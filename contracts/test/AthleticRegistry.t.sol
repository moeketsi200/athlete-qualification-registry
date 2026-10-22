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

        // Register test athlete (new signature: includes clubId)
        registry.registerAthlete(athlete, "ATH-001", "Moeketsi", "CLUB-LP-01", bytes32(0));

        // Pre-clear athlete for testing meets
        registry.attestEligibility(
            athlete, "MEET-1", AthleticRegistry.EligibilityStatus.Cleared, block.timestamp + 30 days
        );
        registry.attestEligibility(
            athlete, "TRIAL-1", AthleticRegistry.EligibilityStatus.Cleared, block.timestamp + 30 days
        );
        registry.attestEligibility(
            athlete, "TRIAL-2", AthleticRegistry.EligibilityStatus.Cleared, block.timestamp + 30 days
        );
        vm.stopPrank();
    }

    // ─── RESULT RECORDING TESTS ──────────────────────────────────────

    // TEST 1: Happy Path — Officials can record a result via 90% consensus
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

    // TEST 2: Bad Actor blocked
    function testRevertsIfNonOfficialRecordsResult() public {
        vm.prank(badActor);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__UnauthorizedOfficial.selector);
        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 1855);
    }

    // TEST 3: Invalid Distance blocked
    function testRevertsIfDistanceIsZero() public {
        vm.prank(official1);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__InvalidDistance.selector);
        registry.recordResult(athlete, "MEET-1", AthleticRegistry.EventType.ShotPut, 0);
    }

    // ─── OFFICIALS MANAGEMENT TESTS ──────────────────────────────────

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

    // TEST 5: Only admin can add officials
    function testRevertsIfNonAdminAddsOfficial() public {
        vm.prank(badActor);
        vm.expectRevert("Only admin");
        registry.addOfficial(badActor);
    }

    // TEST 6: Zero address rejected
    function testRevertsIfAddOfficialZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("Invalid Official Address");
        registry.addOfficial(address(0));
    }

    // TEST 7: Duplicate official does nothing
    function testAddAlreadyAddedOfficial() public {
        vm.prank(admin);
        registry.addOfficial(official1);
        address[] memory officials = registry.getOfficials();
        assertEq(officials.length, 3); // should still be 3
    }

    // ─── ATHLETE REGISTRATION TESTS ──────────────────────────────────

    // TEST 8: Zero address rejected
    function testRevertsIfRegisterAthleteZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("Invalid Athlete Address");
        registry.registerAthlete(address(0), "ATH-002", "Invalid", "CLUB-X", bytes32(0));
    }

    // TEST 9: Already registered
    function testRevertsIfAthleteAlreadyRegistered() public {
        vm.prank(admin);
        vm.expectRevert("Athlete already registered");
        registry.registerAthlete(athlete, "ATH-001", "Moeketsi", "CLUB-LP-01", bytes32(0));
    }

    // TEST 10: Happy path with clubId
    function testGetAthleteWithClubId() public view {
        AthleticRegistry.Athlete memory registeredAthlete = registry.getAthlete(athlete);
        assertEq(registeredAthlete.athleteId, "ATH-001");
        assertEq(registeredAthlete.name, "Moeketsi");
        assertEq(registeredAthlete.clubId, "CLUB-LP-01");
        assertTrue(registeredAthlete.isRegistered);
    }

    // TEST 11: Unregistered athlete blocked from result recording
    function testRevertsIfRecordingForUnregisteredAthlete() public {
        vm.prank(official1);
        address unregisteredAthlete = makeAddr("unregistered");
        vm.expectRevert("Athlete is not registered");
        registry.recordResult(unregisteredAthlete, "MEET-2", AthleticRegistry.EventType.Discus, 1000);
    }

    // ─── PRE-MEET ELIGIBILITY TESTS ──────────────────────────────────

    // TEST 12: Happy Path — Official can attest eligibility
    function testAttestEligibility_HappyPath() public {
        uint256 future = block.timestamp + 90 days;

        vm.prank(official1);
        registry.attestEligibility(athlete, "NATIONALS-2027", AthleticRegistry.EligibilityStatus.Cleared, future);

        AthleticRegistry.EligibilityAttestation memory att = registry.getEligibility(athlete, "NATIONALS-2027");

        assertEq(att.meetId, "NATIONALS-2027");
        assertEq(uint8(att.status), uint8(AthleticRegistry.EligibilityStatus.Cleared));
        assertEq(att.expiresAt, future);
        assertEq(att.attestedBy, official1);
        assertTrue(att.attestedAt > 0);
    }

    // TEST 13: Non-official cannot attest eligibility
    function testRevertsIfNonOfficialAttestsEligibility() public {
        uint256 future = block.timestamp + 90 days;
        vm.prank(badActor);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__UnauthorizedOfficial.selector);
        registry.attestEligibility(athlete, "NATIONALS-2027", AthleticRegistry.EligibilityStatus.Cleared, future);
    }

    // TEST 14: Unregistered athlete cannot have eligibility attested
    function testRevertsIfEligibilityForUnregisteredAthlete() public {
        uint256 future = block.timestamp + 90 days;
        address unknown = makeAddr("unknown");
        vm.prank(official1);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__AthleteNotRegistered.selector);
        registry.attestEligibility(unknown, "NATIONALS-2027", AthleticRegistry.EligibilityStatus.Cleared, future);
    }

    // TEST 15: Past expiry rejected
    function testRevertsIfEligibilityExpiryInPast() public {
        vm.prank(official1);
        vm.expectRevert("Expiry must be in future");
        registry.attestEligibility(
            athlete, "NATIONALS-2027", AthleticRegistry.EligibilityStatus.Cleared, block.timestamp - 1
        );
    }

    // TEST 16: Denial attestation is recorded correctly
    function testAttestEligibility_Denied() public {
        uint256 future = block.timestamp + 30 days;
        vm.prank(official1);
        registry.attestEligibility(athlete, "AFRICA-CHAMPS-2027", AthleticRegistry.EligibilityStatus.Denied, future);

        AthleticRegistry.EligibilityAttestation memory att = registry.getEligibility(athlete, "AFRICA-CHAMPS-2027");
        assertEq(uint8(att.status), uint8(AthleticRegistry.EligibilityStatus.Denied));
    }

    // ─── QUALIFICATION STANDARDS TESTS ───────────────────────────────

    // TEST 17: Admin can set a qualification standard and athlete qualifies
    function testAthleteQualifiesAfterResult() public {
        // Set standard: ShotPut >= 18.00m for NATIONALS-2027
        vm.prank(admin);
        registry.setQualificationStandard(AthleticRegistry.EventType.ShotPut, "NATIONALS-2027", 1800);

        // Record a result of 18.55m (above threshold)
        vm.prank(official1);
        registry.recordResult(athlete, "TRIAL-1", AthleticRegistry.EventType.ShotPut, 1855);
        vm.prank(official2);
        registry.recordResult(athlete, "TRIAL-1", AthleticRegistry.EventType.ShotPut, 1855);
        vm.prank(admin);
        registry.recordResult(athlete, "TRIAL-1", AthleticRegistry.EventType.ShotPut, 1855);

        (bool qualified, uint256 best, uint256 threshold) =
            registry.checkQualified(athlete, AthleticRegistry.EventType.ShotPut, "NATIONALS-2027");
        assertTrue(qualified);
        assertEq(best, 1855);
        assertEq(threshold, 1800);
    }

    // TEST 18: Athlete does NOT qualify if below threshold
    function testAthleteDoesNotQualifyBelowThreshold() public {
        // Set standard: ShotPut >= 21.00m
        vm.prank(admin);
        registry.setQualificationStandard(AthleticRegistry.EventType.ShotPut, "WORLD-ATHLETICS-2027", 2100);

        // Record a result of only 18.55m
        vm.prank(official1);
        registry.recordResult(athlete, "TRIAL-2", AthleticRegistry.EventType.ShotPut, 1855);
        vm.prank(official2);
        registry.recordResult(athlete, "TRIAL-2", AthleticRegistry.EventType.ShotPut, 1855);
        vm.prank(admin);
        registry.recordResult(athlete, "TRIAL-2", AthleticRegistry.EventType.ShotPut, 1855);

        (bool qualified,,) =
            registry.checkQualified(athlete, AthleticRegistry.EventType.ShotPut, "WORLD-ATHLETICS-2027");
        assertFalse(qualified);
    }

    // TEST 19: No standard returns false, zeros
    function testNoStandardReturnsNotQualified() public view {
        (bool qualified, uint256 best, uint256 threshold) =
            registry.checkQualified(athlete, AthleticRegistry.EventType.Discus, "NONEXISTENT-MEET");
        assertFalse(qualified);
        assertEq(best, 0);
        assertEq(threshold, 0);
    }

    // TEST 20: Non-admin cannot set standards
    function testRevertsIfNonAdminSetsStandard() public {
        vm.prank(badActor);
        vm.expectRevert("Only admin");
        registry.setQualificationStandard(AthleticRegistry.EventType.ShotPut, "NATIONALS-2027", 1800);
    }

    // ─── ELIGIBILITY ENFORCEMENT ON RESULT RECORDING ──────────────────

    // TEST 21: Athlete with DENIED eligibility cannot have results recorded
    function testRevertsIfAthleteEligibilityDenied() public {
        uint256 future = block.timestamp + 30 days;
        // Official denies eligibility for AFRICA-CHAMPS-2027
        vm.prank(official1);
        registry.attestEligibility(athlete, "AFRICA-CHAMPS-2027", AthleticRegistry.EligibilityStatus.Denied, future);

        // Attempting to record a result for the denied meet must revert
        vm.prank(official1);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__AthleteEligibilityDenied.selector);
        registry.recordResult(athlete, "AFRICA-CHAMPS-2027", AthleticRegistry.EventType.Discus, 6787);
    }

    // TEST 22: Athlete with PENDING eligibility cannot have results recorded
    function testRevertsIfAthleteEligibilityPending() public {
        uint256 future = block.timestamp + 30 days;
        // Official leaves eligibility pending
        vm.prank(official1);
        registry.attestEligibility(athlete, "NATIONALS-2027", AthleticRegistry.EligibilityStatus.Pending, future);

        // Attempting to record result while pending must revert
        vm.prank(official1);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__AthleteNotCleared.selector);
        registry.recordResult(athlete, "NATIONALS-2027", AthleticRegistry.EventType.ShotPut, 2145);
    }

    // TEST 23: Athlete with EXPIRED clearance cannot have results recorded
    function testRevertsIfAthleteEligibilityExpired() public {
        uint256 future = block.timestamp + 1 days;
        // Official clears athlete for 1 day
        vm.prank(official1);
        registry.attestEligibility(athlete, "OLYMPICS-2028", AthleticRegistry.EligibilityStatus.Cleared, future);

        // Time passes beyond expiration
        vm.warp(block.timestamp + 2 days);

        // Attempting to record result with expired clearance must revert
        vm.prank(official1);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__EligibilityExpired.selector);
        registry.recordResult(athlete, "OLYMPICS-2028", AthleticRegistry.EventType.Javelin, 8500);
    }

    // TEST 24: Athlete with valid CLEARED eligibility records successfully
    function testOfficialCanRecordResultWhenCleared() public {
        uint256 future = block.timestamp + 30 days;
        // Official clears athlete
        vm.prank(official1);
        registry.attestEligibility(athlete, "AFRICA-CHAMPS-2027", AthleticRegistry.EligibilityStatus.Cleared, future);

        // Consensus result recording passes
        vm.prank(official1);
        registry.recordResult(athlete, "AFRICA-CHAMPS-2027", AthleticRegistry.EventType.Discus, 6787);
        vm.prank(official2);
        registry.recordResult(athlete, "AFRICA-CHAMPS-2027", AthleticRegistry.EventType.Discus, 6787);
        vm.prank(admin);
        registry.recordResult(athlete, "AFRICA-CHAMPS-2027", AthleticRegistry.EventType.Discus, 6787);

        AthleticRegistry.MeetResult[] memory res = registry.getAthleteResults(athlete);
        assertEq(res.length, 1);
        assertEq(res[0].distanceInMeters, 6787);
    }

    // TEST 25: Athlete with NO pre-meet clearance cannot have results recorded
    function testRevertsIfAthleteHasNoPreMeetClearance() public {
        // Attempting to record result for UNCLEARED-MEET without any prior attestation must revert
        vm.prank(official1);
        vm.expectRevert(AthleticRegistry.AthleticRegistry__AthleteNotCleared.selector);
        registry.recordResult(athlete, "UNCLEARED-MEET", AthleticRegistry.EventType.ShotPut, 2145);
    }

    // ─── ADMIN TRANSFER TESTS ────────────────────────────────────────

    // TEST 26: Admin can transfer admin role
    function testAdminCanTransferAdmin() public {
        address newAdmin = makeAddr("katlegoAdmin");
        vm.prank(admin);
        registry.transferAdmin(newAdmin);
        assertEq(registry.getAdmin(), newAdmin);
        assertTrue(registry.isOfficial(newAdmin));
    }

    // TEST 27: Non-admin cannot transfer admin role
    function testRevertsIfNonAdminTransfersAdmin() public {
        vm.prank(badActor);
        vm.expectRevert("Only admin");
        registry.transferAdmin(badActor);
    }
}
