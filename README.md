# 🏆 Decentralized Athletic Qualification Registry

Verification code: WTC-3J4EDMA2
An immutable, transparent, and cryptographically verifiable ledger for regional track and field qualification records—specifically engineered for throwing events (Shot Put, Discus, Javelin). Built with Solidity, Foundry, and React + TypeScript.

---

## 📌 Problem & Problem Statement

Regional track and field qualification records frequently suffer from administrative disputes, missing paperwork, or post-event registration disqualifications. 

The **Decentralized Athletic Qualification Registry** solves this by storing performance records on an immutable blockchain ledger. Once a distance is logged on-chain by an authorized meet official, the athlete's qualification status is cryptographically verifiable and cannot be retroactively altered by regional management.

---

## 🛠️ Architecture & Tech Stack

* **Smart Contracts**: Solidity `^0.8.20` with custom errors (`AthleticRegistry__UnauthorizedOfficial`, `AthleticRegistry__InvalidDistance`) and Role-Based Access Control.
* **Testing & Toolchain**: Foundry (`forge`) test framework with Solc `0.8.35` and `forge-std`.
* **Client Frontend**: React 18 + TypeScript + Vite with a glassmorphism dark Web3 design system.
* **Web3 Integration**: Ethers.js / Viem wallet connectivity targeting `0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496`.

---

## 📁 Repository Structure

```text
athlete-qualification-registry/
│
├── contracts/
│   ├── src/
│   │   ├── AthleticRegistry.sol           # Core smart contract
│   │   └── interfaces/
│   │       └── IAthleticRegistry.sol      # Contract interface
│   │
│   ├── script/
│   │   └── DeployAthleticRegistry.s.sol   # Foundry deployment script
│   │
│   └── test/
│       └── AthleticRegistry.t.sol         # Foundry test suite (11/11 passing, 100% coverage)
│
├── frontend/
│   ├── src/
│   │   ├── components/                    # Navbar, HeroSection, QualificationLookup, OfficialDashboard
│   │   ├── hooks/                         # useWeb3Registry custom hook
│   │   ├── config/                        # Contract address & ABI configuration
│   │   ├── types/                         # TypeScript interfaces (Athlete, MeetResult, EventType)
│   │   ├── App.tsx                        # Main React application
│   │   ├── main.tsx                       # Entry point
│   │   └── index.css                      # Glassmorphism design system
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── foundry.toml                           # Foundry project configuration
└── README.md
```

---

## 🚀 Iterative Build Plan

### Iteration 1: Core Solidity Data Structures
- Defined `Athlete` and `MeetResult` structs.
- Implemented `registerAthlete(...)`, `recordResult(...)`, `getAthlete(...)`, and `getAthleteResults(...)`.

### Iteration 2: Access Control, Custom Errors & Foundry Tests
- Integrated Role-Based Access Control (`i_admin` & `s_authorizedOfficials`).
- Applied `onlyOfficial` modifier to restrict result logging.
- Created gas-efficient custom errors:
  - `AthleticRegistry__UnauthorizedOfficial()`
  - `AthleticRegistry__InvalidDistance()`
- Wrote 100% passing Foundry test suite in `contracts/test/AthleticRegistry.t.sol`.

### Iteration 3: Client Interface & Web3 Integration
- Built modern Web3 React + TypeScript frontend in `frontend/`.
- Integrated Web3 wallet connection, searchable qualification lookup directory, and official management portal.

---

## 🧪 Testing & Smart Contract Verification

### Compile Contracts
```bash
forge build
```

### Run Foundry Test Suite
```bash
forge test -vvv
```

**Test Results (11/11 Passed, 100% Coverage)**:
```text
Ran 11 tests for contracts/test/AthleticRegistry.t.sol:AthleticRegistryTest
[PASS] testAddAlreadyAddedOfficial() (gas: 27418)
[PASS] testGetAthlete() (gas: 26344)
[PASS] testGetOfficials() (gas: 32747)
[PASS] testOfficialCanRecordResult() (gas: 144181)
[PASS] testRevertsIfAddOfficialZeroAddress() (gas: 14107)
[PASS] testRevertsIfAthleteAlreadyRegistered() (gas: 18442)
[PASS] testRevertsIfDistanceIsZero() (gas: 19843)
[PASS] testRevertsIfNonAdminAddsOfficial() (gas: 14274)
[PASS] testRevertsIfNonOfficialRecordsResult() (gas: 17555)
[PASS] testRevertsIfRecordingForUnregisteredAthlete() (gas: 20123)
[PASS] testRevertsIfRegisterAthleteZeroAddress() (gas: 14037)
Suite result: ok. 11 passed; 0 failed; 0 skipped
```

### Run Deployment Script Simulation
```bash
forge script contracts/script/DeployAthleticRegistry.s.sol:DeployAthleticRegistry
```

---

## 💻 Running the Frontend Locally

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 License

Distributed under the MIT License.
