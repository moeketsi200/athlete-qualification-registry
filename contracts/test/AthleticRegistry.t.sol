// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AthleticRegistry} from "../src/AthleticRegistry.sol";

contract AthleticRegistryTest is Test {
    AthleticRegistry public registry;

    // Create fake wallet addresses for testing
    address public admin = makeAddr("admin");
    address public official1 = makeAddr("official1");
    address public badActor = makeAddr("badActor");
    address public athlete = makeAddr("athlete");

    function setUp() public {
        // Pretend to be the admin when deploying
        vm.prank(admin);
        registry = new AthleticRegistry();

        // Admin adds official1
        vm.prank(admin);
        registry.addOfficial(official1);

        // Register test athlete
        vm.prank(admin);
        registry.registerAthlete(athlete, "ATH-001", "Moeketsi", bytes32(0));
    }

    // TEST 1: Happy Path - Official can record a result
    function testOfficialCanRecordResult() public {
        vm.prank(official1);
        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 1855);

        AthleticRegistry.MeetResult[] memory results = registry.getAthleteResults(athlete);
        assertEq(results.length, 1);
        assertEq(results[0].distanceInMeters, 1855);
    }

    // TEST 2: Boundary - Bad Actor gets stopped
    function testRevertsIfNonOfficialRecordsResult() public {
        vm.prank(badActor);

        vm.expectRevert(AthleticRegistry.AthleticRegistry__UnauthorizedOfficial.selector);

        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 1855);
    }

    // TEST 3: Boundary - Invalid Distance
    function testRevertsIfDistanceIsZero() public {
        vm.prank(official1);

        vm.expectRevert(AthleticRegistry.AthleticRegistry__InvalidDistance.selector);
        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 0);
    }

    // TEST 4: Get List of Officials
    function testGetOfficials() public view {
        address[] memory officials = registry.getOfficials();
        assertEq(officials.length, 2); // admin and official1
        assertEq(officials[0], admin);
        assertEq(officials[1], official1);
        assertTrue(registry.isOfficial(admin));
        assertTrue(registry.isOfficial(official1));
        assertFalse(registry.isOfficial(badActor));
    }
}
