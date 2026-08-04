// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAthleticRegistry {
    event OfficialAdded(address indexed officialAddress);

    function getOfficials() external view returns (address[] memory);
    function isOfficial(address officialAddress) external view returns (bool);
}

