// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AthleticRegistry} from "../src/AthleticRegistry.sol";

contract DeployAthleticRegistry is Script {
    function run() external returns (AthleticRegistry) {
        vm.startBroadcast();
        AthleticRegistry registry = new AthleticRegistry();
        // Transfer Contract Admin to Katlego's MetaMask wallet
        registry.transferAdmin(0x5a2c6e79F7Ed85694CdB3AFa1a9ea9DD5195e905);
        vm.stopBroadcast();

        console.log("AthleticRegistry deployed to:", address(registry));
        console.log("Contract Admin transferred to:", registry.getAdmin());
        return registry;
    }
}
