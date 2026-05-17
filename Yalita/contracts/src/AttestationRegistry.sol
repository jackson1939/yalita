// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IAttestationRegistry} from "./interfaces/IAttestationRegistry.sol";

/// @title AttestationRegistry — Registro de pruebas zkTLS de datos financieros
/// @notice Cada attestation es una prueba criptográfica (vía Reclaim) de que el usuario
///         tiene un historial de pagos verificable, sin revelar los datos crudos.
contract AttestationRegistry is Ownable, IAttestationRegistry {
    error AlreadySubmitted(bytes32 proofHash);
    error NotAuthorized();
    error InvalidProof();

    mapping(bytes32 => Attestation) public attestations;
    mapping(address => bytes32[]) private _userAttestations;
    mapping(address => bool) public submitters;

    event AttestationSubmitted(
        address indexed user,
        bytes32 indexed proofHash,
        DataSource source,
        uint32 txCount,
        uint64 totalVolumeBs
    );
    event AttestationInvalidated(bytes32 indexed proofHash);
    event SubmitterAuthorized(address indexed submitter, bool authorized);

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier onlySubmitter() {
        if (!submitters[msg.sender]) revert NotAuthorized();
        _;
    }

    function setSubmitterAuthorization(address submitter, bool authorized) external onlyOwner {
        submitters[submitter] = authorized;
        emit SubmitterAuthorized(submitter, authorized);
    }

    function submitAttestation(
        bytes32 proofHash,
        DataSource source,
        address user,
        uint32 txCount,
        uint64 totalVolumeBs,
        uint8 monthsCovered
    ) external onlySubmitter {
        if (proofHash == bytes32(0)) revert InvalidProof();
        if (attestations[proofHash].valid) revert AlreadySubmitted(proofHash);

        attestations[proofHash] = Attestation({
            proofHash: proofHash,
            source: source,
            user: user,
            timestamp: uint48(block.timestamp),
            txCount: txCount,
            totalVolumeBs: totalVolumeBs,
            monthsCovered: monthsCovered,
            valid: true
        });

        _userAttestations[user].push(proofHash);

        emit AttestationSubmitted(user, proofHash, source, txCount, totalVolumeBs);
    }

    function getLatestAttestation(address user) external view returns (Attestation memory) {
        bytes32[] memory hashes = _userAttestations[user];
        if (hashes.length == 0) {
            return Attestation({
                proofHash: bytes32(0),
                source: DataSource.TIGO_MONEY,
                user: address(0),
                timestamp: 0,
                txCount: 0,
                totalVolumeBs: 0,
                monthsCovered: 0,
                valid: false
            });
        }
        return attestations[hashes[hashes.length - 1]];
    }

    function getUserAttestationCount(address user) external view returns (uint256) {
        return _userAttestations[user].length;
    }

    function invalidateAttestation(bytes32 proofHash) external onlyOwner {
        attestations[proofHash].valid = false;
        emit AttestationInvalidated(proofHash);
    }
}
