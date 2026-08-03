// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/AthleticRegistry.sol";

contract AthleticRegistryTest {
    AthleticRegistry public registry;

    function setUp() public {
        registry = new AthleticRegistry();
    }
}
