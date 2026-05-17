// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAttestationRegistry {
    enum DataSource {
        TIGO_MONEY,
        SIMPLE_BANK,
        BANCO_UNION,
        BELVO,
        SELF_ATTESTED
    }

    struct Attestation {
        bytes32 proofHash;
        DataSource source;
        address user;
        uint48 timestamp;
        uint32 txCount;
        uint64 totalVolumeBs;
        uint8 monthsCovered;
        bool valid;
    }

    function submitAttestation(
        bytes32 proofHash,
        DataSource source,
        address user,
        uint32 txCount,
        uint64 totalVolumeBs,
        uint8 monthsCovered
    ) external;

    function getLatestAttestation(address user) external view returns (Attestation memory);
}
