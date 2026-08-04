import { useState, useCallback } from 'react';
import { Athlete, MeetResult, EventType, WalletState, OfficialInfo } from '../types/registry';
import { CONTRACT_ADDRESS } from '../config/contractConfig';

// Declare Ethereum global window interface for strict TypeScript health
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

// Initial pre-populated data for demonstration & live interaction
const INITIAL_ATHLETES: Record<string, Athlete> = {
  '0xcf8752CdE9Cc41C2b3E26be5AB8b101920e02445': {
    address: '0xcf8752CdE9Cc41C2b3E26be5AB8b101920e02445',
    athleteId: 'ATH-ZA-001',
    name: 'Moeketsi Sekete',
    nationalIdHash: '0x8f2d9c4a1b3e5f7a90123456789abcdef0123456789abcdef0123456789abcde',
    isRegistered: true
  },
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    athleteId: 'ATH-KE-104',
    name: 'Akani Simbine',
    nationalIdHash: '0x4a3b2c1d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    isRegistered: true
  },
  '0x3C44CdD47a3580c4035460A37A3e89547b744d0E': {
    address: '0x3C44CdD47a3580c4035460A37A3e89547b744d0E',
    athleteId: 'ATH-NG-209',
    name: 'Chukwuebuka Enekwechi',
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

const INITIAL_OFFICIALS_LIST: OfficialInfo[] = [
  {
    address: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
    isAdmin: true,
    title: 'Lead Meet Director & Contract Admin',
    addedTimestamp: Math.floor(Date.now() / 1000) - 86400 * 30
  },
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    isAdmin: false,
    title: 'Regional Technical Delegate (Anvil Account #0)',
    addedTimestamp: Math.floor(Date.now() / 1000) - 86400 * 12
  }
];

const OFFICIALS = new Set<string>([
  '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
]);

export function useWeb3Registry() {
  const [wallet, setWallet] = useState<WalletState>({
    address: '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [txMessage, setTxMessage] = useState<string | null>(null);

  // Connect / Disconnect Wallet simulation & browser extension hook
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
            isAdmin: addr.toLowerCase() === '0xa8c2dc9ee3f1b48bc6fa397c49aec519e245e9fd',
            balance: '2.50 ETH',
            networkName: 'Ethereum Testnet'
          });
          return;
        }
      } catch {
        console.warn("User rejected Web3 connection or extension unavailable, using demo wallet.");
      }
    }
    
    // Toggle connected state if no extension
    setWallet(prev => ({
      ...prev,
      isConnected: !prev.isConnected,
      address: !prev.isConnected ? '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd' : null,
      isOfficial: !prev.isConnected
    }));
  }, [authorizedOfficials]);

  // Toggle role between Official and Guest for live UI testing
  const toggleOfficialRole = useCallback(() => {
    setWallet(prev => ({
      ...prev,
      isOfficial: !prev.isOfficial
    }));
  }, []);

  // Register Athlete Function
  const registerAthlete = useCallback(async (
    athleteAddress: string,
    athleteId: string,
    name: string,
    nationalIdHash: string
  ) => {
    setIsProcessing(true);
    setTxMessage("Submitting registerAthlete() transaction to smart contract...");

    await new Promise(resolve => setTimeout(resolve, 1200));

    const formattedAddr = athleteAddress.trim();
    if (athletes[formattedAddr]?.isRegistered) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error("Athlete address is already registered on-chain!");
    }

    const newAthlete: Athlete = {
      address: formattedAddr,
      athleteId: athleteId || `ATH-${Math.floor(100 + Math.random() * 900)}`,
      name,
      nationalIdHash: nationalIdHash || '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      isRegistered: true
    };

    setAthletes(prev => ({
      ...prev,
      [formattedAddr]: newAthlete
    }));

    if (!results[formattedAddr]) {
      setResults(prev => ({
        ...prev,
        [formattedAddr]: []
      }));
    }

    setIsProcessing(false);
    setTxMessage("Athlete registered successfully!");
    setTimeout(() => setTxMessage(null), 3000);
    return newAthlete;
  }, [athletes, results]);

  // Record Result Function (with strict custom error simulation)
  const recordResult = useCallback(async (
    athleteAddress: string,
    eventId: string,
    eventType: EventType,
    distanceInMeters: number
  ) => {
    setIsProcessing(true);
    setTxMessage("Invoking recordResult() on AthleticRegistry...");

    await new Promise(resolve => setTimeout(resolve, 1400));

    if (!wallet.isOfficial) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error("Reverted with custom error: AthleticRegistry__UnauthorizedOfficial()");
    }

    if (distanceInMeters <= 0) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error("Reverted with custom error: AthleticRegistry__InvalidDistance()");
    }

    const formattedAddr = athleteAddress.trim();
    if (!athletes[formattedAddr]?.isRegistered) {
      setIsProcessing(false);
      setTxMessage(null);
      throw new Error("Reverted: Athlete is not registered on-chain!");
    }

    const randomHash = '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('') + '...' + Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newResult: MeetResult = {
      eventId,
      eventType,
      distanceInMeters,
      timestamp: Math.floor(Date.now() / 1000),
      officialAddress: wallet.address || '0xa8C2dC9EE3f1b48Bc6fA397C49Aec519E245e9Fd',
      txHash: randomHash
    };

    setResults(prev => ({
      ...prev,
      [formattedAddr]: [newResult, ...(prev[formattedAddr] || [])]
    }));

    setIsProcessing(false);
    setTxMessage(`Result recorded! Distance: ${distanceInMeters}m`);
    setTimeout(() => setTxMessage(null), 4000);
    return newResult;
  }, [wallet, athletes]);

  // Add Official Function
  const addOfficial = useCallback(async (officialAddr: string) => {
    setIsProcessing(true);
    setTxMessage("Adding authorized official on-chain...");

    await new Promise(resolve => setTimeout(resolve, 1000));
    const formattedAddr = officialAddr.trim();

    setAuthorizedOfficials(prev => new Set(prev).add(formattedAddr.toLowerCase()).add(formattedAddr));
    
    setOfficialsList(prev => {
      if (prev.some(o => o.address.toLowerCase() === formattedAddr.toLowerCase())) {
        return prev;
      }
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
    setTxMessage("Official successfully authorized!");
    setTimeout(() => setTxMessage(null), 3000);
  }, []);

  return {
    wallet,
    connectWallet,
    toggleOfficialRole,
    athletes,
    results,
    officials: officialsList,
    registerAthlete,
    recordResult,
    addOfficial,
    isProcessing,
    txMessage,
    contractAddress: CONTRACT_ADDRESS
  };
}
