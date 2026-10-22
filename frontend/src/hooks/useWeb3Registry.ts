import { useState, useCallback } from 'react';
import {
  Athlete, MeetResult, EventType, WalletState, OfficialInfo,
  EligibilityAttestation, EligibilityStatus, QualificationStandard,
  QUALIFICATION_STANDARDS
} from '../types/registry';
import { CONTRACT_ADDRESS } from '../config/contractConfig';

// Declare Ethereum global window interface for strict TypeScript health
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

// ─────────────────────────────────────────────────────────
//  SEED DATA
// ─────────────────────────────────────────────────────────

const INITIAL_ATHLETES: Record<string, Athlete> = {
  '0xcf8752CdE9Cc41C2b3E26be5AB8b101920e02445': {
    address: '0xcf8752CdE9Cc41C2b3E26be5AB8b101920e02445',
    athleteId: 'ATH-ZA-001',
    name: 'Moeketsi Sekete',
    clubId: 'CLUB-LIMPOPO-01',
    nationalIdHash: '0x8f2d9c4a1b3e5f7a90123456789abcdef0123456789abcdef0123456789abcde',
    isRegistered: true
  },
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    athleteId: 'ATH-KE-104',
    name: 'Akani Simbine',
    clubId: 'CLUB-GAUTENG-03',
    nationalIdHash: '0x4a3b2c1d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    isRegistered: true
  },
  '0x3C44CdD47a3580c4035460A37A3e89547b744d0E': {
    address: '0x3C44CdD47a3580c4035460A37A3e89547b744d0E',
    athleteId: 'ATH-NG-209',
    name: 'Chukwuebuka Enekwechi',
    clubId: 'CLUB-LAGOS-12',
    nationalIdHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    isRegistered: true
  }
};

const INITIAL_RESULTS: Record<string, MeetResult[]> = {
  '0xcf8752CdE9Cc41C2b3E26be5AB8b101920e02445': [
    {
      eventId: 'AFRICA-CHAMP-2026-SP',
      eventType: EventType.ShotPut,
      distanceInMeters: 21.45,
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
      officialAddress: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
      txHash: '0x3f4a9b...8c1d'
    },
    {
      eventId: 'DIAMOND-LEAGUE-QUAL-01',
      eventType: EventType.ShotPut,
      distanceInMeters: 21.82,
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 15,
      officialAddress: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
      txHash: '0x9a2b7c...4e0f'
    }
  ],
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': [
    {
      eventId: 'AFRICA-CHAMP-2026-DT',
      eventType: EventType.Discus,
      distanceInMeters: 68.20,
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
      officialAddress: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
      txHash: '0x1b2c3d...5e6f'
    }
  ],
  '0x3C44CdD47a3580c4035460A37A3e89547b744d0E': [
    {
      eventId: 'NATIONAL-TRIALS-JT',
      eventType: EventType.Javelin,
      distanceInMeters: 84.95,
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 8,
      officialAddress: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
      txHash: '0x8e7d6c...5b4a'
    }
  ]
};

// Pre-seeded eligibility attestations
const INITIAL_ELIGIBILITIES: Record<string, EligibilityAttestation[]> = {
  '0xcf8752CdE9Cc41C2b3E26be5AB8b101920e02445': [
    {
      meetId: 'AFRICA-CHAMPS-2027',
      status: EligibilityStatus.Cleared,
      attestedAt: Math.floor(Date.now() / 1000) - 86400 * 10,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 60,
      attestedBy: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    },
    {
      meetId: 'AFRICA-CHAMP-2026-SP',
      status: EligibilityStatus.Cleared,
      attestedAt: Math.floor(Date.now() / 1000) - 86400 * 10,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 60,
      attestedBy: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    },
    {
      meetId: 'DIAMOND-LEAGUE-QUAL-01',
      status: EligibilityStatus.Cleared,
      attestedAt: Math.floor(Date.now() / 1000) - 86400 * 20,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 60,
      attestedBy: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    }
  ],
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': [
    {
      meetId: 'NATIONALS-2027',
      status: EligibilityStatus.Cleared,
      attestedAt: Math.floor(Date.now() / 1000) - 86400 * 5,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 90,
      attestedBy: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    },
    {
      meetId: 'AFRICA-CHAMP-2026-DT',
      status: EligibilityStatus.Cleared,
      attestedAt: Math.floor(Date.now() / 1000) - 86400 * 10,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 90,
      attestedBy: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    }
  ],
  '0x3C44CdD47a3580c4035460A37A3e89547b744d0E': [
    {
      meetId: 'NATIONALS-2027',
      status: EligibilityStatus.Pending,
      attestedAt: Math.floor(Date.now() / 1000) - 86400 * 1,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 90,
      attestedBy: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    },
    {
      meetId: 'NATIONAL-TRIALS-JT',
      status: EligibilityStatus.Cleared,
      attestedAt: Math.floor(Date.now() / 1000) - 86400 * 12,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 90,
      attestedBy: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    }
  ]
};

// Pre-seeded qualification standards
const INITIAL_STANDARDS: QualificationStandard[] = [
  { eventType: EventType.ShotPut,  targetMeetId: 'NATIONALS-2027',       distanceThreshold: 19.50, isActive: true },
  { eventType: EventType.Discus,   targetMeetId: 'NATIONALS-2027',       distanceThreshold: 60.00, isActive: true },
  { eventType: EventType.Javelin,  targetMeetId: 'NATIONALS-2027',       distanceThreshold: 75.00, isActive: true },
  { eventType: EventType.ShotPut,  targetMeetId: 'AFRICA-CHAMPS-2027',   distanceThreshold: 20.50, isActive: true },
  { eventType: EventType.Discus,   targetMeetId: 'AFRICA-CHAMPS-2027',   distanceThreshold: 65.00, isActive: true },
  { eventType: EventType.Javelin,  targetMeetId: 'AFRICA-CHAMPS-2027',   distanceThreshold: 80.00, isActive: true },
  { eventType: EventType.ShotPut,  targetMeetId: 'WORLD-ATHLETICS-2027', distanceThreshold: 21.20, isActive: true },
  { eventType: EventType.Discus,   targetMeetId: 'WORLD-ATHLETICS-2027', distanceThreshold: 67.00, isActive: true },
  { eventType: EventType.Javelin,  targetMeetId: 'WORLD-ATHLETICS-2027', distanceThreshold: 83.50, isActive: true }
];

const INITIAL_OFFICIALS_LIST: OfficialInfo[] = [
  {
    address: '0x5a2c6e79F7Ed85694CdB3AFa1a9ea9DD5195e905',
    isAdmin: true,
    title: 'Contract Admin & Lead Meet Director (Katlego)',
    addedTimestamp: Math.floor(Date.now() / 1000) - 86400 * 30
  },
  {
    address: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
    isAdmin: false,
    title: 'Regional Technical Delegate',
    addedTimestamp: Math.floor(Date.now() / 1000) - 86400 * 20
  },
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    isAdmin: false,
    title: 'Track Official (Anvil Account #0)',
    addedTimestamp: Math.floor(Date.now() / 1000) - 86400 * 12
  }
];

const OFFICIALS = new Set<string>([
  '0x5a2c6e79F7Ed85694CdB3AFa1a9ea9DD5195e905',
  '0x5a2c6e79f7ed85694cdb3afa1a9ea9dd5195e905',
  '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
]);

// ─────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────

export function useWeb3Registry() {
  const [wallet, setWallet] = useState<WalletState>({
    address: '0x5a2c6e79F7Ed85694CdB3AFa1a9ea9DD5195e905',
    isConnected: true,
    isOfficial: true,
    isAdmin: true,
    balance: '12.45 ETH',
    networkName: 'Foundry Localnet / Sepolia'
  });

  const [athletes, setAthletes] = useState<Record<string, Athlete>>(INITIAL_ATHLETES);
  const [results, setResults] = useState<Record<string, MeetResult[]>>(INITIAL_RESULTS);
  const [authorizedOfficials, setAuthorizedOfficials] = useState<Set<string>>(OFFICIALS);
  const [officialsList, setOfficialsList] = useState<OfficialInfo[]>(INITIAL_OFFICIALS_LIST);

  // Track pending results for Multi-Sig
  const [pendingResults, setPendingResults] = useState<Record<string, {
    distanceInMeters: number;
    eventType: EventType;
    officials: string[];
  }>>({});

  // Eligibility attestations: athleteAddress => attestation[]
  const [eligibilities, setEligibilities] = useState<Record<string, EligibilityAttestation[]>>(INITIAL_ELIGIBILITIES);

  // Qualification standards list
  const [qualificationStandards, setQualificationStandards] = useState<QualificationStandard[]>(INITIAL_STANDARDS);

  const [isProcessing, setIsProcessing] = useState(false);
  const [txMessage, setTxMessage] = useState<string | null>(null);

  // ─── Wallet Helpers ───────────────────────────────────

  const connectWallet = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setWallet({
            address: addr,
            isConnected: true,
            isOfficial: authorizedOfficials.has(addr.toLowerCase()) || authorizedOfficials.has(addr),
            isAdmin: addr.toLowerCase() === '0xa8c2dc9ee3f1b48bc6fa397c49aec519e245e9fd' || addr.toLowerCase() === '0x5a2c6e79f7ed85694cdb3afa1a9ea9dd5195e905',
            balance: '2.50 ETH',
            networkName: 'Ethereum Testnet'
          });
          return;
        }
      } catch {
        console.warn('User rejected Web3 connection or extension unavailable, using demo wallet.');
      }
    }

    setWallet(prev => ({
      ...prev,
      isConnected: !prev.isConnected,
      address: !prev.isConnected ? '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd' : null,
      isOfficial: !prev.isConnected
    }));
  }, [authorizedOfficials]);

  const toggleOfficialRole = useCallback(() => {
    setWallet(prev => {
      const officialAddresses = Array.from(authorizedOfficials);

      if (!prev.isOfficial || !prev.address) {
        return {
          ...prev,
          isOfficial: true,
          address: officialAddresses[0] || '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
        };
      }

      const exactIndex = officialAddresses.indexOf(prev.address);
      const lowerIndex = officialAddresses.indexOf(prev.address.toLowerCase());
      const index = Math.max(exactIndex, lowerIndex);

      if (index >= 0 && index < officialAddresses.length - 1) {
        return {
          ...prev,
          isOfficial: true,
          address: officialAddresses[index + 1]
        };
      } else {
        return {
          ...prev,
          isOfficial: false,
          address: null
        };
      }
    });
  }, [authorizedOfficials]);

  const switchWallet = useCallback((address: string) => {
    setWallet(prev => ({
      ...prev,
      isOfficial: authorizedOfficials.has(address) || authorizedOfficials.has(address.toLowerCase()),
      isAdmin: address.toLowerCase() === '0x5a2c6e79f7ed85694cdb3afa1a9ea9dd5195e905' || address.toLowerCase() === '0xa8c2dc9ee3f1b48bc6fa397c49aec519e245e9fd',
      address: address
    }));
  }, [authorizedOfficials]);

  // ─── Athlete Registration ─────────────────────────────

  const registerAthlete = useCallback(async (
    athleteAddress: string,
    athleteId: string,
    name: string,
    nationalIdHash: string,
    clubId?: string
  ) => {
    setIsProcessing(true);
    setTxMessage('Submitting registerAthlete() transaction to smart contract...');

    await new Promise(resolve => setTimeout(resolve, 1200));

    const formattedAddr = athleteAddress.trim();
    if (athletes[formattedAddr]?.isRegistered) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Athlete address is already registered on-chain!');
    }

    const newAthlete: Athlete = {
      address: formattedAddr,
      athleteId: athleteId || `ATH-${Math.floor(100 + Math.random() * 900)}`,
      name,
      clubId: clubId || '',
      nationalIdHash: nationalIdHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      isRegistered: true
    };

    setAthletes(prev => ({ ...prev, [formattedAddr]: newAthlete }));

    if (!results[formattedAddr]) {
      setResults(prev => ({ ...prev, [formattedAddr]: [] }));
    }

    setIsProcessing(false);
    setTxMessage('Athlete registered successfully!');
    setTimeout(() => setTxMessage(null), 3000);
    return newAthlete;
  }, [athletes, results]);

  // ─── Record Result (Multi-Sig) ────────────────────────

  const recordResult = useCallback(async (
    athleteAddress: string,
    eventId: string,
    eventType: EventType,
    distanceInMeters: number
  ) => {
    setIsProcessing(true);
    setTxMessage('Invoking recordResult() on AthleticRegistry...');

    await new Promise(resolve => setTimeout(resolve, 1400));

    if (!wallet.isOfficial) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Reverted with custom error: AthleticRegistry__UnauthorizedOfficial()');
    }

    if (distanceInMeters <= 0) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Reverted with custom error: AthleticRegistry__InvalidDistance()');
    }

    const formattedAddr = athleteAddress.trim();
    if (!athletes[formattedAddr]?.isRegistered) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Reverted: Athlete is not registered on-chain!');
    }

    // Mandatory pre-meet eligibility verification
    const athleteClearances = eligibilities[formattedAddr] || [];
    const clearance = athleteClearances.find(c => c.meetId === eventId);
    if (!clearance) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error(`Reverted: AthleticRegistry__AthleteNotCleared() — Athlete has NO pre-meet clearance on-chain for "${eventId}". Pre-meet clearance is mandatory!`);
    }
    if (clearance.status === EligibilityStatus.Denied) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error(`Reverted: AthleticRegistry__AthleteEligibilityDenied() — Pre-meet clearance is DENIED for "${eventId}"!`);
    }
    if (clearance.status !== EligibilityStatus.Cleared) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error(`Reverted: AthleticRegistry__AthleteNotCleared() — Pre-meet clearance is still PENDING for "${eventId}"!`);
    }
    if (clearance.expiresAt < Math.floor(Date.now() / 1000)) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error(`Reverted: AthleticRegistry__EligibilityExpired() — Pre-meet clearance for "${eventId}" has EXPIRED!`);
    }

    const pendingKey = `${formattedAddr}-${eventId}`;
    const pending = pendingResults[pendingKey];
    const currentWalletAddr = wallet.address || '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd';

    if (pending && pending.officials.includes(currentWalletAddr)) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Reverted with custom error: AthleticRegistry__AlreadySubmitted()');
    }

    if (!pending) {
      setPendingResults(prev => ({
        ...prev,
        [pendingKey]: { distanceInMeters, eventType, officials: [currentWalletAddr] }
      }));
      setIsProcessing(false);
      const requiredConsensus = Math.ceil(officialsList.length * 0.9);
      setTxMessage(`Result Pending: Need ${requiredConsensus - 1} more official signature(s) (1/${requiredConsensus}).`);
      setTimeout(() => setTxMessage(null), 4000);
      return;
    } else {
      if (pending.distanceInMeters !== distanceInMeters || pending.eventType !== eventType) {
        setIsProcessing(false);
        setTxMessage(null);
        throw new Error('Reverted with custom error: AthleticRegistry__DistanceMismatch()');
      }

      const updatedOfficials = [...pending.officials, currentWalletAddr];
      const requiredConsensus = Math.ceil(officialsList.length * 0.9) || 1;

      if (updatedOfficials.length < requiredConsensus) {
        setPendingResults(prev => ({
          ...prev,
          [pendingKey]: { ...pending, officials: updatedOfficials }
        }));
        setIsProcessing(false);
        setTxMessage(`Result Pending: Need ${requiredConsensus - updatedOfficials.length} more signature(s) (${updatedOfficials.length}/${requiredConsensus}).`);
        setTimeout(() => setTxMessage(null), 4000);
        return;
      }

      // Consensus reached!
      const randomHash = '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...' + Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const newResult: MeetResult = {
        eventId, eventType, distanceInMeters,
        timestamp: Math.floor(Date.now() / 1000),
        officialAddress: currentWalletAddr,
        txHash: randomHash
      };

      setResults(prev => ({
        ...prev,
        [formattedAddr]: [newResult, ...(prev[formattedAddr] || [])]
      }));

      setPendingResults(prev => {
        const next = { ...prev };
        delete next[pendingKey];
        return next;
      });

      setIsProcessing(false);
      setTxMessage('Consensus Reached! Result recorded permanently on-chain!');
      setTimeout(() => setTxMessage(null), 4000);
      return newResult;
    }
  }, [wallet, athletes, pendingResults, officialsList, eligibilities]);

  // ─── Eligibility Attestation ──────────────────────────

  const attestEligibility = useCallback(async (
    athleteAddress: string,
    meetId: string,
    status: EligibilityStatus,
    expiresAtTimestamp: number
  ) => {
    setIsProcessing(true);
    setTxMessage('Invoking attestEligibility() on-chain...');

    await new Promise(resolve => setTimeout(resolve, 1100));

    if (!wallet.isOfficial) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Reverted: AthleticRegistry__UnauthorizedOfficial()');
    }

    const formattedAddr = athleteAddress.trim();
    if (!athletes[formattedAddr]?.isRegistered) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Reverted: AthleticRegistry__AthleteNotRegistered()');
    }

    const attestation: EligibilityAttestation = {
      meetId,
      status,
      attestedAt: Math.floor(Date.now() / 1000),
      expiresAt: expiresAtTimestamp,
      attestedBy: wallet.address || '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd'
    };

    setEligibilities(prev => {
      const existing = prev[formattedAddr] || [];
      // Replace if same meetId exists, otherwise append
      const filtered = existing.filter(a => a.meetId !== meetId);
      return { ...prev, [formattedAddr]: [...filtered, attestation] };
    });

    setIsProcessing(false);
    const statusLabel = status === EligibilityStatus.Cleared ? 'CLEARED ✅' : status === EligibilityStatus.Denied ? 'DENIED ❌' : 'PENDING ⏳';
    setTxMessage(`Eligibility attested: ${meetId} — ${statusLabel}`);
    setTimeout(() => setTxMessage(null), 4000);
    return attestation;
  }, [wallet, athletes]);

  // ─── Qualification Standards ──────────────────────────

  const setQualificationStandard = useCallback(async (
    eventType: EventType,
    targetMeetId: string,
    distanceThreshold: number
  ) => {
    setIsProcessing(true);
    setTxMessage('Invoking setQualificationStandard() on-chain...');

    await new Promise(resolve => setTimeout(resolve, 900));

    if (!wallet.isAdmin) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error('Reverted: Only admin can set qualification standards.');
    }

    const newStandard: QualificationStandard = {
      eventType,
      targetMeetId,
      distanceThreshold,
      isActive: true
    };

    setQualificationStandards(prev => {
      const filtered = prev.filter(s => !(s.eventType === eventType && s.targetMeetId === targetMeetId));
      return [...filtered, newStandard];
    });

    setIsProcessing(false);
    setTxMessage(`Standard set: ${targetMeetId} — ${distanceThreshold}m`);
    setTimeout(() => setTxMessage(null), 3000);
    return newStandard;
  }, [wallet.isAdmin]);

  // Check if an athlete qualifies for a given meet and event type
  const checkQualified = useCallback((
    athleteAddress: string,
    eventType: EventType,
    targetMeetId: string
  ): { qualified: boolean; bestDistance: number; threshold: number } => {
    const standard = qualificationStandards.find(
      s => s.eventType === eventType && s.targetMeetId === targetMeetId && s.isActive
    );

    if (!standard) return { qualified: false, bestDistance: 0, threshold: 0 };

    const athleteResults = results[athleteAddress] || [];
    const bestDistance = athleteResults
      .filter(r => r.eventType === eventType)
      .reduce((best, r) => Math.max(best, r.distanceInMeters), 0);

    return {
      qualified: bestDistance >= standard.distanceThreshold,
      bestDistance,
      threshold: standard.distanceThreshold
    };
  }, [qualificationStandards, results]);

  // Get eligibility attestations for an athlete
  const getEligibilities = useCallback((athleteAddress: string): EligibilityAttestation[] => {
    return eligibilities[athleteAddress] || [];
  }, [eligibilities]);

  // ─── Officials Management ─────────────────────────────

  const addOfficial = useCallback(async (officialAddr: string) => {
    setIsProcessing(true);
    setTxMessage('Adding authorized official on-chain...');

    await new Promise(resolve => setTimeout(resolve, 1000));
    const formattedAddr = officialAddr.trim();

    setAuthorizedOfficials(prev => new Set(prev).add(formattedAddr.toLowerCase()).add(formattedAddr));

    setOfficialsList(prev => {
      if (prev.some(o => o.address.toLowerCase() === formattedAddr.toLowerCase())) return prev;
      return [
        ...prev,
        {
          address: formattedAddr,
          isAdmin: false,
          title: 'Authorized Meet Official',
          addedTimestamp: Math.floor(Date.now() / 1000)
        }
      ];
    });

    setIsProcessing(false);
    setTxMessage('Official successfully authorized!');
    setTimeout(() => setTxMessage(null), 3000);
  }, []);

  // ─── Return ───────────────────────────────────────────

  return {
    wallet,
    connectWallet,
    toggleOfficialRole,
    switchWallet,
    athletes,
    results,
    pendingResults,
    officials: officialsList,
    eligibilities,
    qualificationStandards,
    registerAthlete,
    recordResult,
    attestEligibility,
    setQualificationStandard,
    checkQualified,
    getEligibilities,
    addOfficial,
    isProcessing,
    txMessage,
    contractAddress: CONTRACT_ADDRESS
  };
}
