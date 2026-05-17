// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ScoreRegistry} from "../src/ScoreRegistry.sol";
import {AttestationRegistry} from "../src/AttestationRegistry.sol";
import {ScoringEngine} from "../src/ScoringEngine.sol";
import {LendingPool} from "../src/LendingPool.sol";
import {MockUSDC} from "../test/helpers/MockUSDC.sol";

/// @notice Deploy completo del protocolo. Uso:
///   forge script script/Deploy.s.sol --rpc-url fuji --broadcast --verify
contract Deploy is Script {
    address constant USDC_FUJI = 0x5425890298aed601595a70AB815c96711a31Bc65;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Si estamos en local (chainId 31337), desplegamos un USDC mock
        address usdc = block.chainid == 31337
            ? _deployMockUSDC(deployerKey)
            : USDC_FUJI;

        vm.startBroadcast(deployerKey);

        ScoreRegistry scoreReg = new ScoreRegistry(deployer);
        AttestationRegistry attReg = new AttestationRegistry(deployer);
        ScoringEngine engine = new ScoringEngine(deployer, address(scoreReg), address(attReg));
        LendingPool pool = new LendingPool(deployer, usdc, address(scoreReg));

        // Configuración inicial: autorizar el engine en el registry
        scoreReg.setScorerAuthorization(address(engine), true);

        vm.stopBroadcast();

        // Logs para .env
        console.log("===========================================");
        console.log("  Yalita Protocol deployed");
        console.log("===========================================");
        console.log("USDC:                  %s", usdc);
        console.log("ScoreRegistry:         %s", address(scoreReg));
        console.log("AttestationRegistry:   %s", address(attReg));
        console.log("ScoringEngine:         %s", address(engine));
        console.log("LendingPool:           %s", address(pool));
        console.log("===========================================");
        console.log("");
        console.log("Pegar en .env:");
        console.log("NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS=%s", address(scoreReg));
        console.log("NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS=%s", address(attReg));
        console.log("NEXT_PUBLIC_SCORING_ENGINE_ADDRESS=%s", address(engine));
        console.log("NEXT_PUBLIC_LENDING_POOL_ADDRESS=%s", address(pool));
    }

    function _deployMockUSDC(uint256 deployerKey) internal returns (address) {
        vm.startBroadcast(deployerKey);
        MockUSDC mock = new MockUSDC();
        vm.stopBroadcast();
        return address(mock);
    }
}
