// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ScoreRegistry} from "../src/ScoreRegistry.sol";

contract ScoreRegistryTest is Test {
    ScoreRegistry public registry;
    address public owner = address(0xA11CE);
    address public scorer = address(0xBEEF);
    address public alice = address(0xA1);
    address public bob = address(0xB0);

    function setUp() public {
        vm.prank(owner);
        registry = new ScoreRegistry(owner);
        vm.prank(owner);
        registry.setScorerAuthorization(scorer, true);
    }

    function test_MintScore() public {
        vm.prank(scorer);
        uint256 tokenId = registry.mintScore(alice, 720, 150, 8_000_00);
        assertEq(tokenId, 1);
        assertTrue(registry.hasScore(alice));
        assertEq(registry.getScore(alice).score, 720);
    }

    function test_RevertWhen_DoubleMint() public {
        vm.startPrank(scorer);
        registry.mintScore(alice, 720, 150, 8_000_00);
        vm.expectRevert(ScoreRegistry.AlreadyHasScore.selector);
        registry.mintScore(alice, 750, 200, 10_000_00);
        vm.stopPrank();
    }

    function test_RevertWhen_NotAuthorized() public {
        vm.expectRevert(ScoreRegistry.NotAuthorized.selector);
        registry.mintScore(alice, 720, 150, 8_000_00);
    }

    function test_RevertWhen_Transfer() public {
        vm.prank(scorer);
        uint256 tokenId = registry.mintScore(alice, 720, 150, 8_000_00);
        vm.prank(alice);
        vm.expectRevert(ScoreRegistry.Soulbound.selector);
        registry.transferFrom(alice, bob, tokenId);
    }

    function test_UpdateScore() public {
        vm.startPrank(scorer);
        registry.mintScore(alice, 600, 50, 3_000_00);
        registry.updateScore(alice, 720, 150, 8_000_00);
        vm.stopPrank();
        assertEq(registry.getScore(alice).score, 720);
    }

    function testFuzz_ValidScoreRange(uint16 score) public {
        vm.assume(score >= 300 && score <= 850);
        vm.prank(scorer);
        registry.mintScore(alice, score, 100, 5_000_00);
        assertEq(registry.getScore(alice).score, score);
    }
}
