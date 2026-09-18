// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AthleticRegistry} from "../src/AthleticRegistry.sol";

contract DeployAthleticRegistry is Script {
    function run() external returns (AthleticRegistry) {
        vm.startBroadcast();
        AthleticRegistry registry = new AthleticRegistry();
        vm.stopBroadcast();

        console.log("AthleticRegistry deployed to:", address(registry));
        return registry;
    }
}
