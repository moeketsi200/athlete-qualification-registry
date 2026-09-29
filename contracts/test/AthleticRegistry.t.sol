// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AthleticRegistry} from "../src/AthleticRegistry.sol";

contract AthleticRegistryTest is Test {
    AthleticRegistry public registry;

    // Create fake wallet addresses for testing
    address public admin = makeAddr("admin");
    address public official1 = makeAddr("official1");
    address public official2 = makeAddr("official2");
    address public badActor = makeAddr("badActor");
    address public athlete = makeAddr("athlete");

    function setUp() public {
        // Pretend to be the admin when deploying
        vm.prank(admin);
        registry = new AthleticRegistry();

        // Admin adds official1 and official2
        vm.startPrank(admin);
        registry.addOfficial(official1);
        registry.addOfficial(official2);

        // Register test athlete
        registry.registerAthlete(athlete, "ATH-001", "Moeketsi", bytes32(0));
        vm.stopPrank();
    }

    // TEST 1: Happy Path - Official can record a result (requires 3 officials now for 90% supermajority)
    function testOfficialCanRecordResult() public {
        vm.prank(official1);
        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 1855);

        AthleticRegistry.MeetResult[] memory results = registry.getAthleteResults(athlete);
        assertEq(results.length, 0); // Not completed yet

        vm.prank(official2);
        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 1855);

        results = registry.getAthleteResults(athlete);
        assertEq(results.length, 0); // Still not completed (2/3 is 66%, need 90%)

        vm.prank(admin);
        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 1855);

        results = registry.getAthleteResults(athlete);
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
        assertEq(officials.length, 3); // admin, official1, official2
        assertEq(officials[0], admin);
        assertEq(officials[1], official1);
        assertEq(officials[2], official2);
        assertTrue(registry.isOfficial(admin));
        assertTrue(registry.isOfficial(official1));
        assertTrue(registry.isOfficial(official2));
        assertFalse(registry.isOfficial(badActor));
    }

    // TEST 5: addOfficial - Only admin can add
    function testRevertsIfNonAdminAddsOfficial() public {
        vm.prank(badActor);
        vm.expectRevert("Only admin can add officials");
        registry.addOfficial(badActor);
    }

    // TEST 6: addOfficial - Invalid Address
    function testRevertsIfAddOfficialZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("Invalid Official Address");
        registry.addOfficial(address(0));
    }

    // TEST 7: addOfficial - Already added official does nothing duplicate
    function testAddAlreadyAddedOfficial() public {
        vm.prank(admin);
        registry.addOfficial(official1);
        address[] memory officials = registry.getOfficials();
        assertEq(officials.length, 3); // should still be 3
    }

    // TEST 8: registerAthlete - Invalid Address
    function testRevertsIfRegisterAthleteZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("Invalid Athlete Address");
        registry.registerAthlete(address(0), "ATH-002", "Invalid", bytes32(0));
    }

    // TEST 9: registerAthlete - Already registered
    function testRevertsIfAthleteAlreadyRegistered() public {
        vm.prank(admin);
        vm.expectRevert("Athlete already registered");
        registry.registerAthlete(athlete, "ATH-001", "Moeketsi", bytes32(0));
    }

    // TEST 10: registerAthlete - Happy Path
    function testGetAthlete() public {
        AthleticRegistry.Athlete memory registeredAthlete = registry.getAthlete(athlete);
        assertEq(registeredAthlete.athleteId, "ATH-001");
        assertEq(registeredAthlete.name, "Moeketsi");
        assertTrue(registeredAthlete.isRegistered);
    }

    // TEST 11: recordResult - Athlete not registered
    function testRevertsIfRecordingForUnregisteredAthlete() public {
        vm.prank(official1);
        address unregisteredAthlete = makeAddr("unregistered");
        vm.expectRevert("Athlete is not registered");
        registry.recordResult(unregisteredAthlete, "MEET-2", AthleticRegistry.EventType.Discus, 1000);
    }
}
