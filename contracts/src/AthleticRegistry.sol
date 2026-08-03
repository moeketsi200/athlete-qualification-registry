// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IAthleticRegistry.sol";

contract AthleticRegistry is IAthleticRegistry {
    // --- Custom Errors ---
    error AthleticRegistry__UnauthorizedOfficial();
    error AthleticRegistry__InvalidDistance();

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
    mapping(address => Athlete) private s_athletes;
    mapping(address => MeetResult[]) private s_athletesResults;
    mapping(address => bool) private s_authorizedOfficials;
    address private i_admin;

    // --- Events ---
    event AthleteRegistered(address indexed athleteAddress, string athleteId, string name);
    event ResultRecorded(
        address indexed athleteAddress,
        string eventId,
        EventType indexed eventType,
        uint256 distanceInMeters,
        address indexed officialAddress
    );

    // --- Modifiers ---
    modifier onlyOfficial() {
        if (!s_authorizedOfficials[msg.sender]) {
            revert AthleticRegistry__UnauthorizedOfficial();
        }
        _;
    }

    constructor() {
        i_admin = msg.sender;
        s_authorizedOfficials[msg.sender] = true;
    }

    function addOfficial(address _official) external {
        require(msg.sender == i_admin, "Only admin can add officials");
        s_authorizedOfficials[_official] = true;
    }

    /**
     * @notice Registers a new athlete profile on-chain.
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
     */
    function recordResult(
        address athleteAddress,
        string memory eventId,
        EventType eventType,
        uint256 distanceInMeters
    ) external onlyOfficial {
        require(s_athletes[athleteAddress].isRegistered, "Athlete is not registered");
        
        if (distanceInMeters == 0) {
            revert AthleticRegistry__InvalidDistance();
        }

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

    function getAthlete(address athleteAddress) external view returns (Athlete memory) {
        return s_athletes[athleteAddress];
    }

    function getAthleteResults(address athleteAddress) external view returns (MeetResult[] memory) {
        return s_athletesResults[athleteAddress];
    }
}
