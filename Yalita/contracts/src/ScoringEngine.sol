// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IScoreRegistry} from "./interfaces/IScoreRegistry.sol";
import {IAttestationRegistry} from "./interfaces/IAttestationRegistry.sol";
import {IScoringEngine} from "./interfaces/IScoringEngine.sol";

/// @title ScoringEngine — Algoritmo DPI Score on-chain
/// @notice Calcula score [300,850] ponderado por Volumen, Frecuencia, Antigüedad y Consistencia.
/// @dev Fórmula: Score = MIN + ((w_V*V + w_F*F + w_A*A + w_C*C) / TOTAL) * (MAX - MIN)
contract ScoringEngine is Ownable, IScoringEngine {
    error InsufficientData();
    error NoAttestation();
    error InvalidWeights();

    struct Weights {
        uint8 volume;      // peso volumen (default 35)
        uint8 frequency;   // peso frecuencia (default 25)
        uint8 antiquity;   // peso antigüedad (default 20)
        uint8 consistency; // peso consistencia (default 15)
    }

    Weights public weights = Weights({volume: 35, frequency: 25, antiquity: 20, consistency: 15});

    uint16 public constant SCORE_MIN = 300;
    uint16 public constant SCORE_MAX = 850;

    IScoreRegistry public immutable scoreRegistry;
    IAttestationRegistry public immutable attestationRegistry;

    event ScoreCalculated(address indexed user, uint16 score);
    event WeightsUpdated(Weights newWeights);

    constructor(address initialOwner, address _scoreRegistry, address _attestationRegistry)
        Ownable(initialOwner)
    {
        scoreRegistry = IScoreRegistry(_scoreRegistry);
        attestationRegistry = IAttestationRegistry(_attestationRegistry);
    }

    function computeAndIssueScore(address user) external returns (uint16 score) {
        IAttestationRegistry.Attestation memory att = attestationRegistry.getLatestAttestation(user);
        if (!att.valid) revert NoAttestation();

        score = _calculateScore(att.txCount, att.totalVolumeBs, att.monthsCovered);

        if (scoreRegistry.hasScore(user)) {
            scoreRegistry.updateScore(user, score, att.txCount, att.totalVolumeBs);
        } else {
            scoreRegistry.mintScore(user, score, att.txCount, att.totalVolumeBs);
        }

        emit ScoreCalculated(user, score);
    }

    function previewScore(uint32 txCount, uint64 volumeBs, uint8 months)
        external view returns (uint16)
    {
        return _calculateScore(txCount, volumeBs, months);
    }

    function updateWeights(Weights calldata newWeights) external onlyOwner {
        uint256 total = uint256(newWeights.volume) + newWeights.frequency
            + newWeights.antiquity + newWeights.consistency;
        if (total != 95) revert InvalidWeights(); // suma fija = 95 (5 reservado para riesgo en v2)
        weights = newWeights;
        emit WeightsUpdated(newWeights);
    }

    // ── Lógica de scoring ────────────────────────────────────────────────────

    function _calculateScore(uint32 txCount, uint64 volumeBs, uint8 months)
        internal view returns (uint16)
    {
        if (txCount == 0) revert InsufficientData();

        // V — Volumen mensual normalizado (log-scale). Target: 50_000 Bs/mes = 100
        uint256 monthlyVolumeBs = months > 0 ? uint256(volumeBs) / months : volumeBs;
        uint256 vScore = _logNormalize(monthlyVolumeBs, 5_000_000); // 50_000 Bs en centavos

        // F — Frecuencia mensual. Target: 30 tx/mes = 100
        uint256 monthlyTxs = months > 0 ? uint256(txCount) / months : txCount;
        uint256 fScore = _linearNormalize(monthlyTxs, 30);

        // A — Antigüedad. Target: 12 meses = 100
        uint256 aScore = _linearNormalize(months, 12);

        // C — Consistencia (proxy: si hay tx regulares = bueno). En v2 usar coef. de variación.
        uint256 cScore = txCount >= 6 ? 80 : (txCount * 80) / 6;

        // Suma ponderada [0, 9500] → mapeo a [SCORE_MIN, SCORE_MAX]
        uint256 raw = vScore * weights.volume
            + fScore * weights.frequency
            + aScore * weights.antiquity
            + cScore * weights.consistency;

        uint256 range = SCORE_MAX - SCORE_MIN;
        uint256 score = SCORE_MIN + (raw * range) / 9500;

        if (score > SCORE_MAX) return SCORE_MAX;
        if (score < SCORE_MIN) return SCORE_MIN;
        return uint16(score);
    }

    /// @dev Aproximación logarítmica usando conteo de bits (log2).
    function _logNormalize(uint256 value, uint256 maxValue) internal pure returns (uint256) {
        if (value == 0) return 0;
        if (value >= maxValue) return 100;
        uint256 valueBits = _log2(value);
        uint256 maxBits = _log2(maxValue);
        return maxBits > 0 ? (valueBits * 100) / maxBits : 0;
    }

    function _linearNormalize(uint256 value, uint256 maxValue) internal pure returns (uint256) {
        if (value >= maxValue) return 100;
        return (value * 100) / maxValue;
    }

    function _log2(uint256 x) internal pure returns (uint256 result) {
        unchecked {
            while (x > 1) {
                x >>= 1;
                result++;
            }
        }
    }
}
