// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ILendingPool {
    struct Loan {
        uint128 principal;
        uint128 totalDue;
        uint32 dueTimestamp;
        uint16 annualRateBps;
        bool active;
    }

    function addLiquidity(uint128 amount) external;
    function removeLiquidity(uint128 shares) external;
    function requestLoan(uint128 principal, uint32 durationDays) external;
    function repayLoan(uint128 amount) external;
    function getQuote(address user, uint128 principal, uint32 durationDays)
        external view returns (uint16 annualRateBps, uint128 totalDue, uint128 monthlyPayment);
    function loans(address user) external view returns (Loan memory);
}
