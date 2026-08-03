// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IAthleticRegistry.sol";

contract AthleticRegistry is IAthleticRegistry {
    enum EventType {
        ShotPut, 
        Discus,
        Javelin, 
        Other
    }

    struct Athlete {
        string athleteId;
        string name;
        bytes32 nationalIdHash;
        bool isRegistered;
    }

    struct MeetResult {
        string eventId;
        EventType eventType;
        uint256 distanceInMeters;
        uint256 timestamp;
        address officialAddress;
    }
        
    // --- State Variables ---
    // Maps an athlete's wallet address to their profile 
    mapping(address => Athlete) private s_athletes;
    // Maps an athlete's wallet address to their recorded performance results
    mapping(address => MeetResult[]) private s_athletesResults;

    // --- Events ---
    event AthleteRegistered(address indexed athleteAddress, string athleteId, string name);
    event ResultRecorded(
        address indexed athleteAddress,
        string eventId,
        EventType indexed eventType,
        uint256 distanceInMeters,
        address indexed officialAddress
    );

    /**
     * @notice Registers a new athlete profile on-chain.
     * @param athleteAddress The wallet address associated with the athlete.
     * @param athleteId Unique identifier for the athlete.
     * @param name Full name of the athlete.
     * @param nationalIdHash Cryptographic hash of the athlete's national identification document.
     */
    function registerAthlete(
        address athleteAddress,
        string memory athleteId,
        string memory name,
        bytes32 nationalIdHash
    ) external {
        require(athleteAddress != address(0), "Invalid Athlete Address");
        require(!s_athletes[athleteAddress].isRegistered, "Athlete already registered");

        s_athletes[athleteAddress] = Athlete({
            athleteId: athleteId,
            name: name,
            nationalIdHash: nationalIdHash,
            isRegistered: true
        });

        emit AthleteRegistered(athleteAddress, athleteId, name);
    }

    /**
     * @notice Records an official meet performance for a registered athlete.
     * @param athleteAddress The athlete's wallet address.
     * @param eventId Unique identifier for the meet/event.
     * @param eventType Type of event (ShotPut, Discus, Javelin, Other).
     * @param distanceInMeters Performance distance recorded.
     */
    function recordResult(
        address athleteAddress,
        string memory eventId,
        EventType eventType,
        uint256 distanceInMeters
    ) external {
        require(s_athletes[athleteAddress].isRegistered, "Athlete not registered");
        require(distanceInMeters > 0, "Invalid distance");

        MeetResult memory newResult = MeetResult({
            eventId: eventId,
            eventType: eventType,
            distanceInMeters: distanceInMeters,
            timestamp: block.timestamp,
            officialAddress: msg.sender
        });

        s_athletesResults[athleteAddress].push(newResult);

        emit ResultRecorded(
            athleteAddress,
            eventId,
            eventType,
            distanceInMeters,
            msg.sender
        );
    }

    // --- Getter Functions ---

    /**
     * @notice Fetches the profile details of an athlete.
     * @param athleteAddress The athlete's wallet address.
     */
    function getAthlete(address athleteAddress) external view returns (Athlete memory) {
        return s_athletes[athleteAddress];
    }

    /**
     * @notice Read-only getter returning all logged meet performances for an athlete.
     * @param athleteAddress The athlete's wallet address.
     */
    function getAthleteResults(address athleteAddress) external view returns (MeetResult[] memory) {
        return s_athletesResults[athleteAddress];
    }
}
