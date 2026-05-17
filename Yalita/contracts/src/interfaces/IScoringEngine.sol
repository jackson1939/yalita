// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IScoringEngine {
    function computeAndIssueScore(address user) external returns (uint16 score);
    function previewScore(uint32 txCount, uint64 volumeBs, uint8 months)
        external view returns (uint16);
}
