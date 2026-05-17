// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IScoreRegistry} from "./interfaces/IScoreRegistry.sol";
import {ILendingPool} from "./interfaces/ILendingPool.sol";

/// @title LendingPool — Pool USDC con tasas dinámicas según DPI Score
/// @notice Liquidity providers depositan USDC y reciben yield. Borrowers reciben tasas justas.
contract LendingPool is ReentrancyGuard, Ownable, ILendingPool {
    using SafeERC20 for IERC20;

    error ScoreTooLow(uint16 score, uint16 required);
    error InsufficientLiquidity();
    error LoanAlreadyActive();
    error NoActiveLoan();
    error AmountExceedsLimit();
    error InsufficientShares();

    uint16 public constant MIN_SCORE = 450;
    uint16 public constant SCORE_MAX = 850;
    uint128 public constant MAX_LOAN_USDC = 5000e6;
    uint128 public constant MIN_LOAN_USDC = 50e6;
    uint16 public constant BASE_RATE_BPS = 800;
    uint16 public constant MAX_SPREAD_BPS = 3000;
    uint16 public constant ORIGINATION_FEE_BPS = 150;
    uint16 public constant MAX_RATE_BPS = 5000; // cap absoluto 50%

    IERC20 public immutable usdc;
    IScoreRegistry public immutable scoreRegistry;

    uint128 public totalDeposited;
    uint128 public totalBorrowed;
    uint128 public totalShares;
    mapping(address => uint128) public lpShares;
    mapping(address => Loan) private _loans;

    event LiquidityAdded(address indexed provider, uint128 amount, uint128 shares);
    event LiquidityRemoved(address indexed provider, uint128 amount, uint128 shares);
    event LoanOriginated(address indexed borrower, uint128 principal, uint16 annualRateBps, uint32 dueDate);
    event LoanRepaid(address indexed borrower, uint128 amount);

    constructor(address initialOwner, address _usdc, address _scoreRegistry) Ownable(initialOwner) {
        usdc = IERC20(_usdc);
        scoreRegistry = IScoreRegistry(_scoreRegistry);
    }

    // ── Liquidity Providers ──────────────────────────────────────────────────

    function addLiquidity(uint128 amount) external nonReentrant {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        uint128 sharesToMint = totalShares == 0
            ? amount
            : uint128((uint256(amount) * totalShares) / totalDeposited);
        lpShares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;
        totalDeposited += amount;
        emit LiquidityAdded(msg.sender, amount, sharesToMint);
    }

    function removeLiquidity(uint128 shares) external nonReentrant {
        if (lpShares[msg.sender] < shares) revert InsufficientShares();
        uint128 amount = uint128((uint256(shares) * totalDeposited) / totalShares);
        if (amount > availableLiquidity()) revert InsufficientLiquidity();
        lpShares[msg.sender] -= shares;
        totalShares -= shares;
        totalDeposited -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit LiquidityRemoved(msg.sender, amount, shares);
    }

    // ── Borrowers ────────────────────────────────────────────────────────────

    function requestLoan(uint128 principal, uint32 durationDays) external nonReentrant {
        if (_loans[msg.sender].active) revert LoanAlreadyActive();
        if (principal < MIN_LOAN_USDC || principal > MAX_LOAN_USDC) revert AmountExceedsLimit();
        if (principal > availableLiquidity()) revert InsufficientLiquidity();

        uint16 score = scoreRegistry.getScore(msg.sender).score;
        if (score < MIN_SCORE) revert ScoreTooLow(score, MIN_SCORE);

        uint16 annualRateBps = _calculateRate(score);
        uint128 interest = _calculateInterest(principal, annualRateBps, durationDays);
        uint128 originationFee = uint128((uint256(principal) * ORIGINATION_FEE_BPS) / 10_000);

        _loans[msg.sender] = Loan({
            principal: principal,
            totalDue: principal + interest,
            dueTimestamp: uint32(block.timestamp + durationDays * 1 days),
            annualRateBps: annualRateBps,
            active: true
        });

        totalBorrowed += principal;
        usdc.safeTransfer(msg.sender, principal - originationFee);

        emit LoanOriginated(msg.sender, principal, annualRateBps, uint32(block.timestamp + durationDays * 1 days));
    }

    function repayLoan(uint128 amount) external nonReentrant {
        Loan storage loan = _loans[msg.sender];
        if (!loan.active) revert NoActiveLoan();

        uint128 toRepay = amount > loan.totalDue ? loan.totalDue : amount;
        usdc.safeTransferFrom(msg.sender, address(this), toRepay);
        loan.totalDue -= toRepay;

        if (loan.totalDue == 0) {
            loan.active = false;
            totalBorrowed -= loan.principal;
        }

        emit LoanRepaid(msg.sender, toRepay);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function availableLiquidity() public view returns (uint128) {
        return totalDeposited > totalBorrowed ? totalDeposited - totalBorrowed : 0;
    }

    function utilizationRate() external view returns (uint256) {
        if (totalDeposited == 0) return 0;
        return (uint256(totalBorrowed) * 10_000) / totalDeposited;
    }

    function loans(address user) external view returns (Loan memory) {
        return _loans[user];
    }

    function getQuote(address user, uint128 principal, uint32 durationDays)
        external view returns (uint16 annualRateBps, uint128 totalDue, uint128 monthlyPayment)
    {
        uint16 score = scoreRegistry.getScore(user).score;
        if (score == 0) score = MIN_SCORE; // estimación si no tiene score
        annualRateBps = _calculateRate(score);
        uint128 interest = _calculateInterest(principal, annualRateBps, durationDays);
        totalDue = principal + interest;
        uint32 months = durationDays / 30 + 1;
        monthlyPayment = totalDue / months;
    }

    // ── Lógica interna ────────────────────────────────────────────────────────

    function _calculateRate(uint16 score) internal view returns (uint16) {
        // Score [MIN_SCORE, SCORE_MAX] → normalizado inverso [0, 100]
        uint256 normalized = score <= MIN_SCORE
            ? 100
            : score >= SCORE_MAX
            ? 0
            : (uint256(SCORE_MAX - score) * 100) / (SCORE_MAX - MIN_SCORE);

        uint256 utilization = totalDeposited > 0
            ? (uint256(totalBorrowed) * 100) / totalDeposited
            : 0;

        // tasa = base + (1 - score_norm)*spread + utilización*5%
        uint256 rate = BASE_RATE_BPS
            + (normalized * MAX_SPREAD_BPS) / 100
            + (utilization * 500) / 100;

        if (rate > MAX_RATE_BPS) return MAX_RATE_BPS;
        return uint16(rate);
    }

    function _calculateInterest(uint128 principal, uint16 annualRateBps, uint32 daysCount)
        internal pure returns (uint128)
    {
        return uint128((uint256(principal) * annualRateBps * daysCount) / (10_000 * 365));
    }
}
