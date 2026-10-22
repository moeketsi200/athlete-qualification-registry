// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IAthleticRegistry.sol";

contract AthleticRegistry is IAthleticRegistry {
    // --- Custom Errors ---
    error AthleticRegistry__UnauthorizedOfficial();
    error AthleticRegistry__InvalidDistance();
    error AthleticRegistry__AlreadySubmitted();
    error AthleticRegistry__DistanceMismatch();
    error AthleticRegistry__ResultFinalized();
    error AthleticRegistry__EligibilityExpired();
    error AthleticRegistry__AthleteNotRegistered();
    error AthleticRegistry__AthleteEligibilityDenied();
    error AthleticRegistry__AthleteNotCleared();

    enum EventType {
        ShotPut,
        Discus,
        Javelin,
        Other
    }

    // --- Eligibility ---
    enum EligibilityStatus {
        Pending,
        Cleared,
        Denied
    }

    struct EligibilityAttestation {
        string meetId;
        EligibilityStatus status;
        uint256 attestedAt;
        uint256 expiresAt;
        address attestedBy;
    }

    struct QualificationStandard {
        EventType eventType;
        string targetMeetId;
        uint256 distanceThresholdScaled; // stored as distance * 100 (e.g. 2145 = 21.45m)
        bool isActive;
    }

    struct Athlete {
        string athleteId;
        string name;
        string clubId;
        bytes32 nationalIdHash;
        bool isRegistered;
    }

    struct MeetResult {
        string eventId;
        EventType eventType;
        uint256 distanceInMeters; // stored scaled * 100 (e.g. 2145 = 21.45m)
        uint256 timestamp;
        address officialAddress;
    }

    struct PendingResult {
        EventType eventType;
        uint256 distanceInMeters;
        uint256 approvalCount;
        bool isCompleted;
    }

    // --- State Variables ---
    mapping(address => Athlete) private s_athletes;
    mapping(address => MeetResult[]) private s_athletesResults;
    mapping(address => bool) private s_authorizedOfficials;
    address[] private s_officials;
    address private i_admin;

    // athleteAddress => eventId => PendingResult
    mapping(address => mapping(string => PendingResult)) private s_pendingResults;
    // athleteAddress => eventId => official => bool
    mapping(address => mapping(string => mapping(address => bool))) private s_hasOfficialSubmitted;

    // athleteAddress => meetId => EligibilityAttestation
    mapping(address => mapping(string => EligibilityAttestation)) private s_eligibility;

    // standardId => QualificationStandard  (standardId = keccak256(eventType, targetMeetId))
    mapping(bytes32 => QualificationStandard) private s_qualificationStandards;
    bytes32[] private s_standardIds;

    // --- Events ---
    event AthleteRegistered(address indexed athleteAddress, string athleteId, string name);
    event ResultRecorded(
        address indexed athleteAddress,
        string eventId,
        EventType indexed eventType,
        uint256 distanceInMeters,
        address indexed officialAddress
    );
    event EligibilityAttested(
        address indexed athleteAddress,
        string meetId,
        EligibilityStatus status,
        uint256 expiresAt,
        address indexed attestedBy
    );
    event QualificationAchieved(
        address indexed athleteAddress, string targetMeetId, EventType indexed eventType, uint256 distanceInMeters
    );
    event StandardSet(string targetMeetId, EventType eventType, uint256 thresholdScaled);

    // --- Modifiers ---
    modifier onlyOfficial() {
        if (!s_authorizedOfficials[msg.sender]) {
            revert AthleticRegistry__UnauthorizedOfficial();
        }
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == i_admin, "Only admin");
        _;
    }

    constructor() {
        i_admin = msg.sender;
        s_authorizedOfficials[msg.sender] = true;
        s_officials.push(msg.sender);
        emit OfficialAdded(msg.sender);
    }

    // --- Officials Management ---

    function addOfficial(address _official) external onlyAdmin {
        require(_official != address(0), "Invalid Official Address");
        if (!s_authorizedOfficials[_official]) {
            s_authorizedOfficials[_official] = true;
            s_officials.push(_official);
            emit OfficialAdded(_official);
        }
    }

    function removeOfficial(address _official) external onlyAdmin {
        require(_official != i_admin, "Cannot remove admin");
        if (s_authorizedOfficials[_official]) {
            s_authorizedOfficials[_official] = false;
            emit OfficialRemoved(_official);
        }
    }

    // --- Athlete Registration ---

    /**
     * @notice Registers a new athlete profile on-chain with optional club affiliation.
     */
    function registerAthlete(
        address athleteAddress,
        string memory athleteId,
        string memory name,
        string memory clubId,
        bytes32 nationalIdHash
    ) external {
        require(athleteAddress != address(0), "Invalid Athlete Address");
        require(!s_athletes[athleteAddress].isRegistered, "Athlete already registered");

        s_athletes[athleteAddress] = Athlete({
            athleteId: athleteId, name: name, clubId: clubId, nationalIdHash: nationalIdHash, isRegistered: true
        });

        emit AthleteRegistered(athleteAddress, athleteId, name);
    }

    // --- Pre-Meet Eligibility Attestation ---

    /**
     * @notice Attests an athlete's eligibility (or denial) for a specific upcoming meet.
     * @dev Once attested as Cleared, the athlete has an immutable, timestamped on-chain proof
     *      that they were pre-cleared before competition — addressing the "not cleared in time"
     *      failure mode without making any claim about retroactive distance manipulation.
     */
    function attestEligibility(
        address athleteAddress,
        string memory meetId,
        EligibilityStatus status,
        uint256 expiresAt
    ) external onlyOfficial {
        if (!s_athletes[athleteAddress].isRegistered) {
            revert AthleticRegistry__AthleteNotRegistered();
        }
        require(expiresAt > block.timestamp, "Expiry must be in future");

        s_eligibility[athleteAddress][meetId] = EligibilityAttestation({
            meetId: meetId, status: status, attestedAt: block.timestamp, expiresAt: expiresAt, attestedBy: msg.sender
        });

        emit EligibilityAttested(athleteAddress, meetId, status, expiresAt, msg.sender);
    }

    // --- Result Recording (Multi-Sig) ---

    /**
     * @notice Records an official meet performance for a registered athlete.
     * @dev Requires 90% consensus from all authorized officials before finalizing.
     *      distanceInMeters is passed in scaled form (e.g. 2145 = 21.45m) for integer precision.
     */
    function recordResult(address athleteAddress, string memory eventId, EventType eventType, uint256 distanceInMeters)
        external
        onlyOfficial
    {
        require(s_athletes[athleteAddress].isRegistered, "Athlete is not registered");

        if (distanceInMeters == 0) {
            revert AthleticRegistry__InvalidDistance();
        }

        // Mandatory pre-meet eligibility verification
        EligibilityAttestation memory att = s_eligibility[athleteAddress][eventId];
        if (att.attestedAt == 0) {
            revert AthleticRegistry__AthleteNotCleared();
        }
        if (att.status == EligibilityStatus.Denied) {
            revert AthleticRegistry__AthleteEligibilityDenied();
        }
        if (att.status != EligibilityStatus.Cleared) {
            revert AthleticRegistry__AthleteNotCleared();
        }
        if (block.timestamp > att.expiresAt) {
            revert AthleticRegistry__EligibilityExpired();
        }

        if (s_hasOfficialSubmitted[athleteAddress][eventId][msg.sender]) {
            revert AthleticRegistry__AlreadySubmitted();
        }

        PendingResult storage pending = s_pendingResults[athleteAddress][eventId];

        if (pending.isCompleted) {
            revert AthleticRegistry__ResultFinalized();
        }

        if (pending.approvalCount == 0) {
            pending.eventType = eventType;
            pending.distanceInMeters = distanceInMeters;
            pending.approvalCount = 1;
            s_hasOfficialSubmitted[athleteAddress][eventId][msg.sender] = true;
        } else {
            if (pending.distanceInMeters != distanceInMeters || pending.eventType != eventType) {
                revert AthleticRegistry__DistanceMismatch();
            }
            pending.approvalCount += 1;
            s_hasOfficialSubmitted[athleteAddress][eventId][msg.sender] = true;

            if (pending.approvalCount >= getRequiredConsensus()) {
                pending.isCompleted = true;

                MeetResult memory newResult = MeetResult({
                    eventId: eventId,
                    eventType: eventType,
                    distanceInMeters: distanceInMeters,
                    timestamp: block.timestamp,
                    officialAddress: msg.sender
                });

                s_athletesResults[athleteAddress].push(newResult);

                emit ResultRecorded(athleteAddress, eventId, eventType, distanceInMeters, msg.sender);

                // Auto-check all active qualification standards for this event type
                _checkQualificationStandards(athleteAddress, eventType, distanceInMeters);
            }
        }
    }

    // --- Qualification Standards ---

    /**
     * @notice Sets a qualification threshold for a target meet and event type.
     * @param eventType   The throwing discipline
     * @param targetMeetId e.g. "NATIONALS-2027"
     * @param distanceThresholdScaled  Distance × 100 in cm (e.g. 2145 = 21.45m)
     */
    function setQualificationStandard(EventType eventType, string memory targetMeetId, uint256 distanceThresholdScaled)
        external
        onlyAdmin
    {
        bytes32 sid = _standardId(eventType, targetMeetId);
        bool isNew = !s_qualificationStandards[sid].isActive;

        s_qualificationStandards[sid] = QualificationStandard({
            eventType: eventType,
            targetMeetId: targetMeetId,
            distanceThresholdScaled: distanceThresholdScaled,
            isActive: true
        });

        if (isNew) {
            s_standardIds.push(sid);
        }

        emit StandardSet(targetMeetId, eventType, distanceThresholdScaled);
    }

    /**
     * @notice Checks whether an athlete has achieved a qualification standard for a target meet.
     * @return qualified true if the athlete's best result for the event type meets or exceeds the threshold.
     * @return bestDistance The athlete's best distance for that event type (0 if none).
     * @return threshold    The required distance threshold.
     */
    function checkQualified(address athleteAddress, EventType eventType, string memory targetMeetId)
        external
        view
        returns (bool qualified, uint256 bestDistance, uint256 threshold)
    {
        bytes32 sid = _standardId(eventType, targetMeetId);
        QualificationStandard memory standard = s_qualificationStandards[sid];

        if (!standard.isActive) {
            return (false, 0, 0);
        }

        threshold = standard.distanceThresholdScaled;
        MeetResult[] memory results = s_athletesResults[athleteAddress];

        for (uint256 i = 0; i < results.length; i++) {
            if (results[i].eventType == eventType && results[i].distanceInMeters > bestDistance) {
                bestDistance = results[i].distanceInMeters;
            }
        }

        qualified = bestDistance >= threshold;
    }

    // --- Internal Helpers ---

    function _checkQualificationStandards(address athleteAddress, EventType eventType, uint256 distanceInMeters)
        internal
    {
        for (uint256 i = 0; i < s_standardIds.length; i++) {
            QualificationStandard memory std = s_qualificationStandards[s_standardIds[i]];
            if (std.isActive && std.eventType == eventType && distanceInMeters >= std.distanceThresholdScaled) {
                emit QualificationAchieved(athleteAddress, std.targetMeetId, eventType, distanceInMeters);
            }
        }
    }

    function _standardId(EventType eventType, string memory targetMeetId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(uint8(eventType), targetMeetId));
    }

    // --- Getter Functions ---

    function getAthlete(address athleteAddress) external view returns (Athlete memory) {
        return s_athletes[athleteAddress];
    }

    function getAthleteResults(address athleteAddress) external view returns (MeetResult[] memory) {
        return s_athletesResults[athleteAddress];
    }

    function getOfficials() external view returns (address[] memory) {
        return s_officials;
    }

    function isOfficial(address officialAddress) external view returns (bool) {
        return s_authorizedOfficials[officialAddress];
    }

    function getPendingResult(address athleteAddress, string memory eventId)
        external
        view
        returns (PendingResult memory)
    {
        return s_pendingResults[athleteAddress][eventId];
    }

    function hasOfficialSubmitted(address athleteAddress, string memory eventId, address official)
        external
        view
        returns (bool)
    {
        return s_hasOfficialSubmitted[athleteAddress][eventId][official];
    }

    function getEligibility(address athleteAddress, string memory meetId)
        external
        view
        returns (EligibilityAttestation memory)
    {
        return s_eligibility[athleteAddress][meetId];
    }

    function getRequiredConsensus() public view returns (uint256) {
        uint256 totalOfficials = s_officials.length;
        if (totalOfficials == 0) return 0;
        return (totalOfficials * 90 + 99) / 100;
    }

    function getAdmin() external view returns (address) {
        return i_admin;
    }
}
