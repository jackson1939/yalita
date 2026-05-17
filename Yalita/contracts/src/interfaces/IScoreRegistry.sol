// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IScoreRegistry {
    struct ScoreData {
        uint16 score;
        uint48 updatedAt;
        uint32 totalTxs;
        uint64 volumeBs;
    }

    function mintScore(address user, uint16 score, uint32 totalTxs, uint64 volumeBs)
        external returns (uint256 tokenId);

    function updateScore(address user, uint16 newScore, uint32 totalTxs, uint64 volumeBs) external;

    function getScore(address user) external view returns (ScoreData memory);

    function hasScore(address user) external view returns (bool);
}
