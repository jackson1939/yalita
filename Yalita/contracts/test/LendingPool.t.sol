// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ScoreRegistry} from "../src/ScoreRegistry.sol";
import {LendingPool} from "../src/LendingPool.sol";
import {MockUSDC} from "./helpers/MockUSDC.sol";

contract LendingPoolTest is Test {
    ScoreRegistry public scoreReg;
    LendingPool public pool;
    MockUSDC public usdc;
    address public owner = address(0xA11CE);
    address public scorer = address(0xBEEF);
    address public lp = address(0x111);
    address public alice = address(0xA1);

    function setUp() public {
        usdc = new MockUSDC();
        vm.startPrank(owner);
        scoreReg = new ScoreRegistry(owner);
        pool = new LendingPool(owner, address(usdc), address(scoreReg));
        scoreReg.setScorerAuthorization(scorer, true);
        vm.stopPrank();

        // LP deposita liquidez
        usdc.mint(lp, 10_000e6);
        vm.startPrank(lp);
        usdc.approve(address(pool), type(uint256).max);
        pool.addLiquidity(10_000e6);
        vm.stopPrank();
    }

    function test_GetQuote_HigherScoreCheaper() public {
        // Score alto → tasa baja, score bajo → tasa alta
        vm.prank(scorer);
        scoreReg.mintScore(alice, 800, 200, 10_000_00);
        (uint16 highRate,,) = pool.getQuote(alice, 1000e6, 90);

        address bob = address(0xB0);
        vm.prank(scorer);
        scoreReg.mintScore(bob, 500, 50, 2_000_00);
        (uint16 lowRate,,) = pool.getQuote(bob, 1000e6, 90);

        assertLt(highRate, lowRate);
    }

    function test_RequestLoan_Success() public {
        vm.prank(scorer);
        scoreReg.mintScore(alice, 700, 150, 8_000_00);

        vm.prank(alice);
        pool.requestLoan(500e6, 90);

        LendingPool.Loan memory loan = pool.loans(alice);
        assertTrue(loan.active);
        assertEq(loan.principal, 500e6);
        assertGt(loan.totalDue, loan.principal); // tiene interés

        // Alice recibió principal - origination fee (1.5%)
        assertEq(usdc.balanceOf(alice), 500e6 - (500e6 * 150) / 10_000);
    }

    function test_RevertWhen_ScoreTooLow() public {
        vm.prank(scorer);
        scoreReg.mintScore(alice, 400, 30, 1_000_00); // score < 450

        vm.prank(alice);
        vm.expectRevert();
        pool.requestLoan(500e6, 90);
    }

    function test_Repay_Partial() public {
        vm.prank(scorer);
        scoreReg.mintScore(alice, 700, 150, 8_000_00);

        vm.prank(alice);
        pool.requestLoan(100e6, 90);

        LendingPool.Loan memory beforeRepay = pool.loans(alice);
        assertTrue(beforeRepay.active);

        usdc.mint(alice, 50e6);
        vm.startPrank(alice);
        usdc.approve(address(pool), 50e6);
        pool.repayLoan(50e6);
        vm.stopPrank();

        LendingPool.Loan memory afterRepay = pool.loans(alice);
        assertTrue(afterRepay.active);
        assertEq(afterRepay.totalDue, beforeRepay.totalDue - 50e6);
        assertEq(afterRepay.principal, beforeRepay.principal);
    }

    function test_RequestLoan_InsufficientScore() public {
        vm.prank(scorer);
        scoreReg.mintScore(alice, 400, 30, 1_000_00);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(LendingPool.ScoreTooLow.selector, 400, 450));
        pool.requestLoan(100e6, 90);
    }

    function test_RepayLoan() public {
        vm.prank(scorer);
        scoreReg.mintScore(alice, 700, 150, 8_000_00);

        vm.prank(alice);
        pool.requestLoan(500e6, 90);

        LendingPool.Loan memory loan = pool.loans(alice);
        uint128 totalDue = loan.totalDue;

        // Alice repaga
        usdc.mint(alice, totalDue);
        vm.startPrank(alice);
        usdc.approve(address(pool), totalDue);
        pool.repayLoan(totalDue);
        vm.stopPrank();

        loan = pool.loans(alice);
        assertFalse(loan.active);
    }
}
