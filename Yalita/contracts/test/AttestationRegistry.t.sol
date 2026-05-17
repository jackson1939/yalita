// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AttestationRegistry} from "../src/AttestationRegistry.sol";
import {IAttestationRegistry} from "../src/interfaces/IAttestationRegistry.sol";

contract AttestationRegistryTest is Test {
    AttestationRegistry public reg;
    address public owner = address(0xA11CE);
    address public oracle = address(0xBEEF);
    address public alice = address(0xA1);

    function setUp() public {
        vm.prank(owner);
        reg = new AttestationRegistry(owner);
        vm.prank(owner);
        reg.setSubmitterAuthorization(oracle, true);
    }

    function test_SubmitAttestation() public {
        vm.prank(oracle);
        reg.submitAttestation(
            bytes32("proof-1"),
            IAttestationRegistry.DataSource.TIGO_MONEY,
            alice, 150, 48_000_00, 6
        );
        IAttestationRegistry.Attestation memory att = reg.getLatestAttestation(alice);
        assertTrue(att.valid);
        assertEq(att.txCount, 150);
        assertEq(att.monthsCovered, 6);
    }

    function test_RevertWhen_DuplicateProof() public {
        vm.startPrank(oracle);
        reg.submitAttestation(bytes32("p1"), IAttestationRegistry.DataSource.TIGO_MONEY, alice, 10, 1000, 1);
        vm.expectRevert();
        reg.submitAttestation(bytes32("p1"), IAttestationRegistry.DataSource.TIGO_MONEY, alice, 20, 2000, 2);
        vm.stopPrank();
    }

    function test_RevertWhen_NotSubmitter() public {
        vm.expectRevert(AttestationRegistry.NotAuthorized.selector);
        reg.submitAttestation(bytes32("p1"), IAttestationRegistry.DataSource.TIGO_MONEY, alice, 10, 1000, 1);
    }
}
