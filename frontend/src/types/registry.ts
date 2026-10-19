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

export const EventTypeIcons: Record<EventType, string> = {
  [EventType.ShotPut]: '⚫',
  [EventType.Discus]: '🥏',
  [EventType.Javelin]: '🏹',
  [EventType.Other]: '🏟️'
};

// Qualification standards per event type (in meters) for common meets
export const QUALIFICATION_STANDARDS: Record<string, Record<EventType, number>> = {
  'NATIONALS-2027': {
    [EventType.ShotPut]: 19.50,
    [EventType.Discus]: 60.00,
    [EventType.Javelin]: 75.00,
    [EventType.Other]: 0
  },
  'AFRICA-CHAMPS-2027': {
    [EventType.ShotPut]: 20.50,
    [EventType.Discus]: 65.00,
    [EventType.Javelin]: 80.00,
    [EventType.Other]: 0
  },
  'WORLD-ATHLETICS-2027': {
    [EventType.ShotPut]: 21.20,
    [EventType.Discus]: 67.00,
    [EventType.Javelin]: 83.50,
    [EventType.Other]: 0
  }
};

export enum EligibilityStatus {
  Pending = 0,
  Cleared = 1,
  Denied = 2
}

export const EligibilityStatusLabels: Record<EligibilityStatus, string> = {
  [EligibilityStatus.Pending]: 'Pending Review',
  [EligibilityStatus.Cleared]: 'Cleared',
  [EligibilityStatus.Denied]: 'Denied'
};

export interface EligibilityAttestation {
  meetId: string;
  status: EligibilityStatus;
  attestedAt: number;
  expiresAt: number;
  attestedBy: string;
}

export interface QualificationStandard {
  eventType: EventType;
  targetMeetId: string;
  distanceThreshold: number; // in meters (float)
  isActive: boolean;
}

export interface Athlete {
  address: string;
  athleteId: string;
  name: string;
  clubId?: string;
  nationalIdHash: string;
  isRegistered: boolean;
}

export interface MeetResult {
  eventId: string;
  eventType: EventType;
  distanceInMeters: number; // formatted float, e.g., 21.45m
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
