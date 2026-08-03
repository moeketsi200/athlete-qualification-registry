export const CONTRACT_ADDRESS = "0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496";

export const CONTRACT_ABI = [
  "function registerAthlete(address athleteAddress, string calldata athleteId, string calldata name, bytes32 nationalIdHash) external",
  "function recordResult(address athleteAddress, string calldata eventId, uint8 eventType, uint256 distanceInMeters) external",
  "function getAthlete(address athleteAddress) external view returns (tuple(string athleteId, string name, bytes32 nationalIdHash, bool isRegistered))",
  "function getAthleteResults(address athleteAddress) external view returns (tuple(string eventId, uint8 eventType, uint256 distanceInMeters, uint256 timestamp, address officialAddress)[])",
  "function addOfficial(address _official) external",
  "event AthleteRegistered(address indexed athleteAddress, string athleteId, string name)",
  "event ResultRecorded(address indexed athleteAddress, string eventId, uint8 indexed eventType, uint256 distanceInMeters, address indexed officialAddress)",
  "error AthleticRegistry__UnauthorizedOfficial()",
  "error AthleticRegistry__InvalidDistance()"
];
