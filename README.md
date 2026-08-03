# 🏆 Decentralized Athletic Qualification Registry

## Overview

Regional track and field qualification records—particularly for throwing events such as shot put, discus, and javelin—frequently suffer from administrative disputes, missing paperwork, or post-event registration disqualifications.

Building an immutable, transparent ledger for official meet results eliminates these grievances. The **Decentralized Athletic Qualification Registry** ensures that once a performance distance is logged by an authorized official, the athlete's qualification status is cryptographically verifiable on-chain and cannot be retroactively or arbitrarily altered by regional management.

---

## Learning Outcomes & Tech Stack

* **Smart Contract Engineering**: Writing clean, gas-efficient Solidity contracts with robust data structures.
* **Access Control & Security**: Implementing role-based access control (RBAC) to ensure only verified meet officials can log results.
* **Automated Testing & Deployment**: Using industry-standard toolchains (Foundry / Hardhat) to write comprehensive unit and integration test suites.
* **Full-Stack Web3 Integration**: Building a modern React & TypeScript client interface utilizing `viem` / `ethers.js` for seamless wallet connectivity and live contract interaction.

---

## Sprint Schedule

Recommended Sprint Window: **3-Day Intensive Sprint** (Targeting August 5 Deadline)

| Day | Focus Area | Deliverable |
| :--- | :--- | :--- |
| **Day 1 (Today)** | Foundational Architecture | Core Solidity Data Structures & Base Storage |
| **Day 2 (Tomorrow)** | Security & Testing | Access Control Modifiers & Foundry Test Suite |
| **Day 3 (Wednesday)** | Frontend & Deployment | React/TS Client Interface & Vercel Live Demo |

---

## Project Structure

```text
athlete-qualification-registry/
│
├── contracts/
│   ├── src/
│   │   ├── AthleticRegistry.sol
│   │   └── interfaces/
│   │       └── IAthleticRegistry.sol
│   │
│   ├── script/
│   │   └── DeployAthleticRegistry.s.sol
│   │
│   └── test/
│       └── AthleticRegistry.t.sol
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── config/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── foundry.toml
└── README.md
```

---

## Implementation Plan

### Step 1 — Core Solidity Data Structures (Iteration 1)

**File**: `contracts/src/AthleticRegistry.sol`

Construct the foundational smart contract managing athlete profiles and official meet performances.

#### Data Structures

* **`Athlete`** (Struct): Stores athlete metadata (e.g., `athleteId`, `name`, `nationalIdHash`, `isRegistered`).
* **`MeetResult`** (Struct): Represents an official event performance entry:
  * `eventId` (`bytes32` / `string`)
  * `eventType` (`enum` or `string` e.g., Shot Put, Discus, Javelin)
  * `distanceInMeters` (`uint256`)
  * `timestamp` (`uint256`)
  * `officialAddress` (`address`)

#### Key Functions

* `registerAthlete(...)`: Register a new athlete onto the ledger.
* `recordResult(...)`: Log an official distance performance for a given athlete.
* `getAthleteResults(...)`: Read-only getter function returning all logged meet performances for an athlete.

---

### Step 2 — Access Control & Security (Iteration 2)

**Files**: `contracts/src/AthleticRegistry.sol`, `contracts/test/AthleticRegistry.t.sol`

Enforce protocol security by restricting data entry exclusively to authorized addresses ("Officials") and verifying contract execution through automated testing.

#### Security & Access Modifiers

* Integrate Role-Based Access Control (e.g., `OpenZeppelin AccessControl` or custom `onlyOfficial` / `onlyAdmin` modifiers).
* Ensure unauthorized addresses are prohibited from calling `recordResult` and throw descriptive custom errors (e.g., `UnauthorizedOfficial()`).

#### Testing & Deployment Suite

* Write unit tests covering boundary conditions:
  * Valid result entry by authorized official.
  * Revert on result entry attempt by non-official address.
  * Revert on invalid distance values (e.g., zero distance).
* Implement automated deployment scripts using Foundry (`forge script`) or Hardhat.

---

### Step 3 — Client Interface & Web3 Integration (Iteration 3)

**Directory**: `frontend/`

Spin up a modern, responsive web application enabling athletes, officials, and event organizers to view and verify qualification records transparently.

#### Frontend Features

* **Wallet Connection**: Integrated Web3 wallet connection (via Wagmi / Viem / Ethers.js).
* **Official Dashboard**: Dedicated form for verified officials to log new meet results on-chain.
* **Qualification Lookup**: Searchable athlete directory rendering cryptographically verified performance histories.
* **Live Deployment**: Hosted on Vercel with direct testnet contract integration.