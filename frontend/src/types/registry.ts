export enum EventType {
  ShotPut = 0,
  Discus = 1,
  Javelin = 2,
  Other = 3
}

export const EventTypeNames: Record<EventType, string> = {
  [EventType.ShotPut]: 'Shot Put',
  [EventType.Discus]: 'Discus Throw',
  [EventType.Javelin]: 'Javelin Throw',
  [EventType.Other]: 'Other Track & Field'
};

export interface Athlete {
  address: string;
  athleteId: string;
  name: string;
  nationalIdHash: string;
  isRegistered: boolean;
}

export interface MeetResult {
  eventId: string;
  eventType: EventType;
  distanceInMeters: number; // formatted float, e.g., 21.45m (stored as int/mm or scaled)
  timestamp: number;
  officialAddress: string;
  txHash?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isOfficial: boolean;
  isAdmin: boolean;
  balance: string;
  networkName: string;
}

export interface OfficialInfo {
  address: string;
  isAdmin: boolean;
  title?: string;
  addedTimestamp?: number;
}

