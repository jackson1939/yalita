// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ScoreRegistry} from "../src/ScoreRegistry.sol";
import {AttestationRegistry} from "../src/AttestationRegistry.sol";
import {ScoringEngine} from "../src/ScoringEngine.sol";
import {IAttestationRegistry} from "../src/interfaces/IAttestationRegistry.sol";

contract ScoringEngineTest is Test {
    ScoreRegistry public scoreReg;
    AttestationRegistry public attReg;
    ScoringEngine public engine;
    address public owner = address(0xA11CE);
    address public oracle = address(0xBEEF);
    address public alice = address(0xA1);

    function setUp() public {
        vm.startPrank(owner);
        scoreReg = new ScoreRegistry(owner);
        attReg = new AttestationRegistry(owner);
        engine = new ScoringEngine(owner, address(scoreReg), address(attReg));
        scoreReg.setScorerAuthorization(address(engine), true);
        attReg.setSubmitterAuthorization(oracle, true);
        vm.stopPrank();
    }

    function test_PreviewScore_TopUser() public view {
        // Usuario "ideal": muchas txs, mucho volumen, mucha antigüedad
        uint16 score = engine.previewScore(300, 50_000_00 * 12, 12);
        assertGt(score, 750);
    }

    function test_PreviewScore_NewUser() public view {
        // Usuario nuevo: poco volumen, poca antigüedad
        uint16 score = engine.previewScore(5, 500_00, 1);
        assertLt(score, 550);
    }

    function test_ComputeAndIssue_Flow() public {
        // 1. Oracle submitea attestation
        vm.prank(oracle);
        attReg.submitAttestation(
            bytes32("proof-1"),
            IAttestationRegistry.DataSource.TIGO_MONEY,
            alice,
            150,            // 150 txs
            8_000_00 * 6,   // Bs 8000/mes durante 6 meses
            6
        );

        // 2. Engine calcula y emite el score
        uint16 score = engine.computeAndIssueScore(alice);

        assertTrue(scoreReg.hasScore(alice));
        assertEq(scoreReg.getScore(alice).score, score);
        assertGt(score, 600); // usuario decente
    }

    function test_RevertWhen_NoAttestation() public {
        vm.expectRevert(ScoringEngine.NoAttestation.selector);
        engine.computeAndIssueScore(alice);
    }

    function test_Score_BolivianUser_TigoMoney() public view {
        uint16 score = engine.previewScore(45, 28_000_00, 6);
        assertGe(score, 550);
        assertLe(score, 750);
    }

    function test_Score_Updates_Improve() public {
        vm.prank(oracle);
        attReg.submitAttestation(
            bytes32("proof-low"),
            IAttestationRegistry.DataSource.TIGO_MONEY,
            alice,
            8,
            2_000_00,
            2
        );

        uint16 firstScore = engine.computeAndIssueScore(alice);

        vm.prank(oracle);
        attReg.submitAttestation(
            bytes32("proof-high"),
            IAttestationRegistry.DataSource.TIGO_MONEY,
            alice,
            55,
            32_000_00 * 6,
            6
        );

        uint16 secondScore = engine.computeAndIssueScore(alice);
        assertGt(secondScore, firstScore);
    }
}
