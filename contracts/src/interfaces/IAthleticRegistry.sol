// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAthleticRegistry {
    event OfficialAdded(address indexed officialAddress);
    event OfficialRemoved(address indexed officialAddress);
    event EligibilityAttested(
        address indexed athleteAddress, string meetId, uint8 status, uint256 expiresAt, address indexed attestedBy
    );
    event QualificationAchieved(
        address indexed athleteAddress, string targetMeetId, uint8 indexed eventType, uint256 distanceInMeters
    );
    event StandardSet(string targetMeetId, uint8 eventType, uint256 thresholdScaled);

    function getOfficials() external view returns (address[] memory);
    function isOfficial(address officialAddress) external view returns (bool);
}
