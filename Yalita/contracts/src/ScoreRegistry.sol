// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IScoreRegistry} from "./interfaces/IScoreRegistry.sol";

/// @title ScoreRegistry — Soulbound NFT del DPI Score
/// @notice Cada wallet puede tener un solo NFT no transferible que representa su Score Quipu [300-850].
/// @dev Solo direcciones autorizadas (ScoringEngine, governance) pueden mintear/actualizar.
contract ScoreRegistry is ERC721, Ownable, IScoreRegistry {
    error AlreadyHasScore();
    error NotAuthorized();
    error Soulbound();
    error InvalidScore(uint16 score);
    error NoScore();

    uint16 public constant SCORE_MIN = 300;
    uint16 public constant SCORE_MAX = 850;

    uint256 private _nextTokenId;
    mapping(address => uint256) public walletToTokenId;
    mapping(uint256 => ScoreData) private _scores;
    mapping(address => bool) public scorers; // direcciones autorizadas

    event ScoreMinted(address indexed user, uint256 indexed tokenId, uint16 score);
    event ScoreUpdated(address indexed user, uint256 indexed tokenId, uint16 newScore);
    event ScorerAuthorized(address indexed scorer, bool authorized);

    constructor(address initialOwner) ERC721("Quipu Score", "QSCORE") Ownable(initialOwner) {}

    modifier onlyScorer() {
        if (!scorers[msg.sender]) revert NotAuthorized();
        _;
    }

    function setScorerAuthorization(address scorer, bool authorized) external onlyOwner {
        scorers[scorer] = authorized;
        emit ScorerAuthorized(scorer, authorized);
    }

    function mintScore(address user, uint16 score, uint32 totalTxs, uint64 volumeBs)
        external onlyScorer returns (uint256 tokenId)
    {
        if (walletToTokenId[user] != 0) revert AlreadyHasScore();
        if (score < SCORE_MIN || score > SCORE_MAX) revert InvalidScore(score);
        tokenId = ++_nextTokenId;
        _safeMint(user, tokenId);
        walletToTokenId[user] = tokenId;
        _scores[tokenId] = ScoreData({
            score: score,
            updatedAt: uint48(block.timestamp),
            totalTxs: totalTxs,
            volumeBs: volumeBs
        });
        emit ScoreMinted(user, tokenId, score);
    }

    function updateScore(address user, uint16 newScore, uint32 totalTxs, uint64 volumeBs)
        external onlyScorer
    {
        uint256 tokenId = walletToTokenId[user];
        if (tokenId == 0) revert NoScore();
        if (newScore < SCORE_MIN || newScore > SCORE_MAX) revert InvalidScore(newScore);
        _scores[tokenId] = ScoreData({
            score: newScore,
            updatedAt: uint48(block.timestamp),
            totalTxs: totalTxs,
            volumeBs: volumeBs
        });
        emit ScoreUpdated(user, tokenId, newScore);
    }

    function getScore(address user) external view returns (ScoreData memory) {
        return _scores[walletToTokenId[user]];
    }

    function hasScore(address user) external view returns (bool) {
        return walletToTokenId[user] != 0;
    }

    // ── Soulbound: bloquear todas las transferencias ─────────────────────────

    function transferFrom(address, address, uint256) public pure override {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert Soulbound();
    }

    function approve(address, uint256) public pure override {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert Soulbound();
    }
}
