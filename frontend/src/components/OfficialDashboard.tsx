import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, UserPlus, AlertTriangle, CheckCircle2, Lock, Flame, Copy, Check, Users, Award, ClipboardCheck, CalendarCheck, XCircle, Clock } from 'lucide-react';
import { Athlete, MeetResult, EventType, EventTypeNames, WalletState, OfficialInfo, EligibilityAttestation, EligibilityStatus } from '../types/registry';

interface OfficialDashboardProps {
  wallet: WalletState;
  athletes: Record<string, Athlete>;
  officials?: OfficialInfo[];
  eligibilities?: Record<string, EligibilityAttestation[]>;
  recordResult: (athleteAddr: string, eventId: string, type: EventType, dist: number) => Promise<MeetResult | void>;
  registerAthlete: (addr: string, id: string, name: string, hash: string, clubId?: string) => Promise<Athlete | void>;
  attestEligibility?: (addr: string, meetId: string, status: EligibilityStatus, expiresAt: number) => Promise<EligibilityAttestation | void>;
  addOfficial: (addr: string) => Promise<void>;
  switchWallet: (addr: string) => void;
  isProcessing: boolean;
  txMessage: string | null;
  pendingResults?: Record<string, { distanceInMeters: number; eventType: EventType; officials: string[] }>;
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  wallet,
  athletes,
  officials = [],
  pendingResults = {},
  eligibilities = {},
  recordResult,
  registerAthlete,
  attestEligibility,
  addOfficial,
  switchWallet,
  isProcessing,
  txMessage
}) => {
  const [activeTab, setActiveTab] = useState<'RECORD' | 'REGISTER' | 'ADMIN' | 'CLEARANCE'>('RECORD');

  // Pre-Meet Clearance form state
  const [clearanceAthleteAddr, setClearanceAthleteAddr] = useState('');
  const [clearanceMeetId, setClearanceMeetId] = useState('');
  const [clearanceStatus, setClearanceStatus] = useState<EligibilityStatus>(EligibilityStatus.Cleared);
  const [clearanceDays, setClearanceDays] = useState('90');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Record Result Form State
  const [selectedAthleteAddr, setSelectedAthleteAddr] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventType, setEventType] = useState<EventType>(EventType.ShotPut);
  const [distance, setDistance] = useState('');

  // Register Athlete Form State
  const [newAthleteAddr, setNewAthleteAddr] = useState('');
  const [newAthleteId, setNewAthleteId] = useState('');
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newNationalIdHash, setNewNationalIdHash] = useState('');

  // Add Official Form State
  const [newOfficialAddr, setNewOfficialAddr] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedAthleteAddr) {
      setFormError("Please select a registered athlete.");
      return;
    }
    if (!eventId.trim()) {
      setFormError("Please enter a valid Meet Event ID.");
      return;
    }
    const distNum = parseFloat(distance);
    if (isNaN(distNum)) {
      setFormError("Distance must be a valid number.");
      return;
    }

    try {
      await recordResult(selectedAthleteAddr, eventId, eventType, distNum);
      setEventId('');
      setDistance('');
    } catch (err: unknown) {
      setFormError((err as Error).message || "Transaction failed");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newAthleteAddr.trim()) {
      setFormError("Athlete wallet address is required.");
      return;
    }
    if (!newAthleteName.trim()) {
      setFormError("Athlete full name is required.");
      return;
    }

    try {
      await registerAthlete(newAthleteAddr, newAthleteId, newAthleteName, newNationalIdHash);
      setNewAthleteAddr('');
      setNewAthleteId('');
      setNewAthleteName('');
      setNewNationalIdHash('');
    } catch (err: unknown) {
      setFormError((err as Error).message || "Failed to register athlete.");
    }
  };

  const handleClearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clearanceAthleteAddr) {
      setFormError('Please select an athlete to attest.');
      return;
    }
    if (!clearanceMeetId.trim()) {
      setFormError('Please enter a Meet ID to attest eligibility for.');
      return;
    }

    try {
      const days = parseInt(clearanceDays) || 90;
      const expiresAt = Math.floor(Date.now() / 1000) + days * 86400;
      if (attestEligibility) {
        await attestEligibility(clearanceAthleteAddr, clearanceMeetId, clearanceStatus, expiresAt);
      }
      setClearanceAthleteAddr('');
      setClearanceMeetId('');
    } catch (err: unknown) {
      setFormError((err as Error).message || 'Failed to attest eligibility.');
    }
  };

  const totalClearances = Object.values(eligibilities).reduce((acc, list) => acc + list.length, 0);
  const activeClearances = Object.values(eligibilities).reduce((acc, list) => {
    const now = Math.floor(Date.now() / 1000);
    return acc + list.filter(a => a.status === EligibilityStatus.Cleared && a.expiresAt > now).length;
  }, 0);

  const handleAddOfficialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newOfficialAddr.trim()) {
      setFormError("Official wallet address is required.");
      return;
    }

    try {
      await addOfficial(newOfficialAddr);
      setNewOfficialAddr('');
    } catch (err: unknown) {
      setFormError((err as Error).message || "Failed to add official.");
    }
  };

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      {/* Banner / Access Guard */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: wallet.isOfficial ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              padding: '0.75rem',
              borderRadius: '12px',
              color: wallet.isOfficial ? '#34d399' : '#f87171'
            }}>
              {wallet.isOfficial ? <ShieldCheck size={28} /> : <Lock size={28} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                {wallet.isOfficial ? "Official Meet Management Portal" : "Restricted Official Portal"}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                {wallet.isOfficial 
                  ? "Logged in as an authorized Meet Official. Calls are protected by the `onlyOfficial` smart contract modifier."
                  : "You are in Guest view. Switch to Official mode using the button in the top navigation bar to test contract calls."}
              </p>
            </div>
          </div>

          {wallet.isOfficial ? (
            <span className="badge badge-green"><CheckCircle2 size={14} /> `onlyOfficial` Modifier Active</span>
          ) : (
            <span className="badge badge-gold"><AlertTriangle size={14} /> Custom Revert Protection</span>
          )}

        </div>
      </div>

      {/* Transaction Feedback Alert */}
      {txMessage && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid var(--primary-cyan)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600 }}>{txMessage}</span>
        </div>
      )}

      {/* Form Errors */}
      {formError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          color: '#f87171',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} />
          <span style={{ fontWeight: 600 }}>{formError}</span>
        </div>
      )}

      {/* Action Navigation Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        background: 'rgba(10, 16, 30, 0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass-bright)',
        padding: '0.65rem',
        borderRadius: '20px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35)'
      }}>
        
        {/* Button 1: Record Meet Result */}
        <button
          onClick={() => setActiveTab('RECORD')}
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '0.85rem 1.35rem',
            borderRadius: '14px',
            border: activeTab === 'RECORD' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
            background: activeTab === 'RECORD' 
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)' 
              : 'transparent',
            color: activeTab === 'RECORD' ? '#fbbf24' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: activeTab === 'RECORD' ? '0 4px 20px rgba(245, 158, 11, 0.3)' : 'none'
          }}
        >
          <Flame size={20} color={activeTab === 'RECORD' ? '#fbbf24' : 'var(--text-muted)'} />
          <span>Record Meet Result</span>
          {activeTab === 'RECORD' && (
            <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Active</span>
          )}
        </button>

        {/* Button 2: Register New Athlete */}
        <button
          onClick={() => setActiveTab('REGISTER')}
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '0.85rem 1.35rem',
            borderRadius: '14px',
            border: activeTab === 'REGISTER' ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid transparent',
            background: activeTab === 'REGISTER' 
              ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(2, 132, 199, 0.15) 100%)' 
              : 'transparent',
            color: activeTab === 'REGISTER' ? '#38bdf8' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: activeTab === 'REGISTER' ? '0 4px 20px rgba(6, 182, 212, 0.3)' : 'none'
          }}
        >
          <UserPlus size={20} color={activeTab === 'REGISTER' ? '#38bdf8' : 'var(--text-muted)'} />
          <span>Register New Athlete</span>
          {activeTab === 'REGISTER' && (
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Active</span>
          )}
        </button>

        {/* Button 3: Manage Officials */}
        <button
          onClick={() => setActiveTab('ADMIN')}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '0.85rem 1.35rem',
            borderRadius: '14px',
            border: activeTab === 'ADMIN' ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
            background: activeTab === 'ADMIN' 
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(109, 40, 217, 0.15) 100%)' 
              : 'transparent',
            color: activeTab === 'ADMIN' ? '#c084fc' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: activeTab === 'ADMIN' ? '0 4px 20px rgba(139, 92, 246, 0.3)' : 'none'
          }}
        >
          <ShieldCheck size={20} color={activeTab === 'ADMIN' ? '#c084fc' : 'var(--text-muted)'} />
          <span>Manage Officials</span>
          <span className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
            {officials.length}
          </span>
        </button>

        {/* Button 4: Pre-Meet Clearance */}
        <button
          onClick={() => setActiveTab('CLEARANCE')}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '0.85rem 1.35rem',
            borderRadius: '14px',
            border: activeTab === 'CLEARANCE' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
            background: activeTab === 'CLEARANCE'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)'
              : 'transparent',
            color: activeTab === 'CLEARANCE' ? '#34d399' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: activeTab === 'CLEARANCE' ? '0 4px 20px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          <ClipboardCheck size={20} color={activeTab === 'CLEARANCE' ? '#34d399' : 'var(--text-muted)'} />
          <span>Pre-Meet Clearance</span>
          <span className="badge badge-green" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
            {activeClearances}
          </span>
        </button>

      </div>

      {/* Tab 1: Record Result */}
      {activeTab === 'RECORD' && (
        <div className="glass-panel" style={{
          padding: '2.25rem',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(6, 182, 212, 0.04) 100%)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(245, 158, 11, 0.08)'
        }}>
          
          {/* Form Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Flame color="#fbbf24" size={26} />
                Log Official Meet Performance (`recordResult`)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                Protected smart contract call cryptographically storing verified throwing distances on-chain.
              </p>
            </div>

            <span className="badge badge-gold" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
              <ShieldCheck size={12} /> `onlyOfficial` Protected
            </span>
          </div>

          {/* Revert Warning Callout */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertTriangle size={16} />
            <span>
              Invoking with distance = 0 will trigger <code style={{ color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>AthleticRegistry__InvalidDistance()</code> custom error.
            </span>
          </div>

          {/* Record Result Form */}
          <form onSubmit={handleRecordSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.35rem' }}>
            
            {/* Simulate Signature Dropdown */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ color: '#c084fc' }}>
                <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                Simulate Signature As (Official Wallet)
              </label>
              <select
                className="form-input"
                value={wallet.address || ''}
                onChange={e => switchWallet(e.target.value)}
                style={{
                  borderRadius: '14px',
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#e9d5ff',
                  fontWeight: 700
                }}
              >
                {officials.map(off => (
                  <option key={off.address} value={off.address} style={{ color: '#000' }}>
                    {off.title} ({off.address.substring(0, 6)}...{off.address.substring(off.address.length - 4)})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Field 1: Select Athlete */}
            <div>
              <label className="form-label">Select Registered Athlete *</label>
              <select
                className="form-input"
                value={selectedAthleteAddr}
                onChange={e => setSelectedAthleteAddr(e.target.value)}
                required
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: selectedAthleteAddr ? '1px solid var(--primary-cyan)' : '1px solid var(--border-glass-bright)',
                  fontWeight: 600
                }}
              >
                <option value="">-- Choose Registered Athlete --</option>
                {Object.values(athletes).map(a => (
                  <option key={a.address} value={a.address}>
                    {a.name} ({a.athleteId})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Event / Meet ID */}
            <div>
              <label className="form-label">Event / Meet ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AFRICA-CHAMP-2026-SP"
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                required
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: eventId ? '1px solid var(--primary-cyan)' : '1px solid var(--border-glass-bright)',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            {/* Field 3: Event Type */}
            <div>
              <label className="form-label">Event Discipline *</label>
              <select
                className="form-input"
                value={eventType}
                onChange={e => setEventType(Number(e.target.value) as EventType)}
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: '1px solid var(--border-glass-bright)',
                  fontWeight: 600
                }}
              >
                <option value={EventType.ShotPut}>Shot Put (7.26kg)</option>
                <option value={EventType.Discus}>Discus Throw (2.0kg)</option>
                <option value={EventType.Javelin}>Javelin Throw (800g)</option>
                <option value={EventType.Other}>Other Event</option>
              </select>
            </div>

            {/* Field 4: Performance Distance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Performance Distance (Meters) *</label>
                <button
                  type="button"
                  onClick={() => setDistance('0')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginBottom: '0.4rem'
                  }}
                >
                  Set 0m (Test Revert)
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 21.85 (Try 0 to test revert)"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                required
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: distance ? (distance === '0' ? '1px solid #ef4444' : '1px solid var(--primary-gold)') : '1px solid var(--border-glass-bright)',
                  boxShadow: distance === '0' ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none',
                  fontSize: '1.05rem',
                  fontWeight: 700
                }}
              />
            </div>

            {/* Submission Action Button */}
            <div style={{ gridColumn: '1 / -1', marginTop: '0.75rem' }}>
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '0.95rem 1.6rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)'
                }}
              >
                <Flame size={20} color="#fbbf24" />
                <span>{isProcessing ? "Invoking recordResult() On-Chain..." : "Log Verified Performance Distance"}</span>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#fbbf24'
                }}>
                  recordResult()
                </span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Pending Multi-Sig Approvals (Visible on RECORD tab if pending results exist) */}
      {activeTab === 'RECORD' && Object.keys(pendingResults).length > 0 && (
        <div className="glass-panel" style={{
          padding: '2rem',
          marginTop: '1.5rem',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(109, 40, 217, 0.05) 100%)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <AlertTriangle color="#c084fc" size={24} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc' }}>
              Pending Multi-Sig Approvals (Action Required)
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(pendingResults).map(([key, pending]) => {
              const [athleteAddr, eventId] = key.split('-');
              const athlete = athletes[athleteAddr];
              const athleteName = athlete ? athlete.name : "Unknown Athlete";
              const isMySig = pending.officials.includes(wallet.address || '');

              return (
                <div key={key} style={{
                  background: 'rgba(10, 16, 30, 0.7)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                      {athleteName} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>({eventId})</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '1.5rem' }}>
                      <span><strong>Event:</strong> {EventTypeNames[pending.eventType]}</span>
                      <span><strong>Pending Distance:</strong> <span style={{ color: '#c084fc', fontWeight: 700 }}>{pending.distanceInMeters}m</span></span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Signed by: <code style={{ color: '#a78bfa' }}>{pending.officials.join(', ')}</code>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#c084fc', fontWeight: 700, fontSize: '0.9rem' }}>
                      {pending.officials.length}/{Math.ceil(officials.length * 0.9) || 1} Signatures
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAthleteAddr(athleteAddr);
                        setEventId(eventId);
                        setEventType(pending.eventType);
                        setDistance(pending.distanceInMeters.toString());
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={isMySig}
                      style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        background: isMySig ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.9))',
                        border: 'none',
                        color: isMySig ? 'var(--text-muted)' : 'white',
                        fontWeight: 700,
                        cursor: isMySig ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isMySig ? 'Already Signed' : 'Sign & Complete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Register Athlete */}
      {activeTab === 'REGISTER' && (
        <div className="glass-panel" style={{
          padding: '2.25rem',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(139, 92, 246, 0.04) 100%)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(6, 182, 212, 0.08)'
        }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserPlus color="#38bdf8" size={26} />
                Register Athlete Profile (`registerAthlete`)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                Adds a new verified athlete entity to the immutable smart contract mapping <code style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>s_athletes[address]</code>.
              </p>
            </div>

            <span className="badge badge-cyan" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
              <ShieldCheck size={12} /> On-Chain Profile Creation
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.35rem' }}>
            
            {/* Field 1: Athlete Wallet Address */}
            <div>
              <label className="form-label">Athlete Wallet Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={newAthleteAddr}
                onChange={e => setNewAthleteAddr(e.target.value)}
                required
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: newAthleteAddr ? '1px solid var(--primary-cyan)' : '1px solid var(--border-glass-bright)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: newAthleteAddr ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none'
                }}
              />
            </div>

            {/* Field 2: Athlete Full Name */}
            <div>
              <label className="form-label">Athlete Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Wayde van Niekerk"
                value={newAthleteName}
                onChange={e => setNewAthleteName(e.target.value)}
                required
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: newAthleteName ? '1px solid var(--primary-cyan)' : '1px solid var(--border-glass-bright)',
                  fontWeight: 600
                }}
              />
            </div>

            {/* Field 3: Athlete ID (with Auto-Generator) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Athlete ID (Optional)</label>
                <button
                  type="button"
                  onClick={() => setNewAthleteId(`ATH-ZA-${Math.floor(100 + Math.random() * 900)}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginBottom: '0.4rem'
                  }}
                >
                  Generate ID
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ATH-ZA-999"
                value={newAthleteId}
                onChange={e => setNewAthleteId(e.target.value)}
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: '1px solid var(--border-glass-bright)',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            {/* Field 4: National ID Hash (with Auto-Generator) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">National ID Hash (bytes32 Optional)</label>
                <button
                  type="button"
                  onClick={() => setNewNationalIdHash('0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c084fc',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginBottom: '0.4rem'
                  }}
                >
                  Generate Hash
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={newNationalIdHash}
                onChange={e => setNewNationalIdHash(e.target.value)}
                style={{
                  borderRadius: '14px',
                  background: 'rgba(10, 16, 30, 0.85)',
                  border: '1px solid var(--border-glass-bright)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Submit Action Button */}
            <div style={{ gridColumn: '1 / -1', marginTop: '0.75rem' }}>
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(2, 132, 199, 0.25) 100%)',
                  color: '#38bdf8',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  padding: '0.95rem 1.6rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 16px rgba(6, 182, 212, 0.25)'
                }}
              >
                <UserPlus size={20} color="#38bdf8" />
                <span>{isProcessing ? "Submitting registerAthlete() On-Chain..." : "Register Athlete Profile On-Chain"}</span>
                <span style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#38bdf8'
                }}>
                  registerAthlete()
                </span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tab 3: Manage Officials */}
      {activeTab === 'ADMIN' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Add Official Form Card */}
          <div className="glass-panel" style={{
            padding: '2.25rem',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(245, 158, 11, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck color="#fbbf24" size={26} />
                  Authorize Meet Official (`addOfficial`)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                  Admin function granting logging privileges to a meet official's wallet address on-chain.
                </p>
              </div>

              <span className="badge badge-gold" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                <Lock size={12} /> Admin Privileges Protected
              </span>
            </div>

            <form onSubmit={handleAddOfficialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Wallet Input Box with Icon */}
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{
                      paddingLeft: '1.2rem',
                      fontSize: '0.98rem',
                      borderRadius: '14px',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(10, 16, 30, 0.85)',
                      border: newOfficialAddr ? '1px solid var(--primary-gold)' : '1px solid var(--border-glass-bright)',
                      boxShadow: newOfficialAddr ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none'
                    }}
                    placeholder="Enter Official Wallet Address (e.g. 0x70997970C5...)"
                    value={newOfficialAddr}
                    onChange={e => setNewOfficialAddr(e.target.value)}
                    required
                  />
                </div>

                {/* Tasteful Gold Grant Role Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    minWidth: '220px',
                    justifyContent: 'center',
                    padding: '0.85rem 1.6rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <ShieldCheck size={18} color="#fbbf24" />
                  <span>{isProcessing ? "Authorizing On-Chain..." : "Grant Official Role"}</span>
                  <span style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#fbbf24'
                  }}>
                    addOfficial()
                  </span>
                </button>
              </div>

              {/* Sample Quick Fill Address Helper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Quick Test Address:</span>
                <button
                  type="button"
                  onClick={() => setNewOfficialAddr('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')}
                  className="badge badge-cyan"
                  style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', textTransform: 'none', fontSize: '0.75rem' }}
                >
                  0x70997...79C8 (Anvil #1)
                </button>
              </div>

            </form>
          </div>

          {/* Authorized Officials Registry Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users color="#38bdf8" size={22} />
                  Authorized Meet Officials (`getOfficials()`)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  On-chain list of addresses granted <code style={{ color: '#34d399' }}>onlyOfficial</code> rights to cryptographically sign meet records.
                </p>
              </div>

              <span className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                <ShieldCheck size={14} /> {officials.length} Active Officials Registered
              </span>
            </div>

            <div style={{
              overflowX: 'auto',
              borderRadius: '14px',
              border: '1px solid var(--border-glass-bright)',
              background: 'rgba(10, 16, 30, 0.5)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderBottom: '1px solid var(--border-glass-bright)',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em'
                  }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Wallet Address</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Contract Role & Title</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Modifier Status</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officials.map((official, idx) => (
                    <tr 
                      key={official.address + idx} 
                      style={{ 
                        borderBottom: idx === officials.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s ease',
                        background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1.1rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: official.isAdmin ? 'rgba(245, 158, 11, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                            border: official.isAdmin ? '1px solid var(--primary-gold)' : '1px solid var(--primary-cyan)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: official.isAdmin ? '#fbbf24' : '#38bdf8',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}>
                            0x
                          </div>
                          <span style={{ color: '#38bdf8' }}>
                            {official.address.slice(0, 10)}...{official.address.slice(-6)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          {official.isAdmin ? (
                            <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                              <Award size={12} /> Contract Admin
                            </span>
                          ) : (
                            <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                              <ShieldCheck size={12} /> Meet Official
                            </span>
                          )}
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                            {official.title || 'Authorized Meet Official'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                          <CheckCircle2 size={12} /> Authorized (`onlyOfficial`)
                        </span>
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleCopy(official.address)}
                          title="Copy Full Wallet Address"
                          className="btn-secondary"
                          style={{
                            color: copiedAddress === official.address ? '#34d399' : 'var(--text-main)',
                            borderColor: copiedAddress === official.address ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-glass)',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            borderRadius: '10px'
                          }}
                        >
                          {copiedAddress === official.address ? (
                            <>
                              <Check size={14} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy Address
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Tab 4: Pre-Meet Clearance */}
      {activeTab === 'CLEARANCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Attestation Form */}
          <div className="glass-panel" style={{
            padding: '2.25rem',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.04) 100%)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 25px rgba(16,185,129,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ClipboardCheck color="#34d399" size={26} />
                  Attest Pre-Meet Eligibility (`attestEligibility`)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                  Cryptographically lock an athlete's clearance status <strong>before</strong> competition — timestamped and immutable.
                  This addresses the most common failure: athletes competing without prior clearance.
                </p>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                <ShieldCheck size={12} /> `onlyOfficial` Protected
              </span>
            </div>

            {/* Why this matters callout */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              marginBottom: '1.5rem',
              fontSize: '0.83rem',
              color: '#6ee7b7',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem'
            }}>
              <CalendarCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Why this matters:</strong> The most common qualification failure is not that distances are altered —
                it is that athletes are <em>not cleared before the competition</em>.
                This attestation creates a cryptographic, time-stamped pre-clearance record that
                cannot be disputed, lost, or backdated.
              </span>
            </div>

            <form onSubmit={handleClearanceSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.35rem' }}>

              {/* Select Athlete */}
              <div>
                <label className="form-label">Athlete to Clear *</label>
                <select
                  className="form-input"
                  value={clearanceAthleteAddr}
                  onChange={e => setClearanceAthleteAddr(e.target.value)}
                  required
                  style={{
                    borderRadius: '14px',
                    background: 'rgba(10, 16, 30, 0.85)',
                    border: clearanceAthleteAddr ? '1px solid #34d399' : '1px solid var(--border-glass-bright)',
                    fontWeight: 600
                  }}
                >
                  <option value="">-- Select Registered Athlete --</option>
                  {Object.values(athletes).map(a => (
                    <option key={a.address} value={a.address}>
                      {a.name} ({a.athleteId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Meet ID */}
              <div>
                <label className="form-label">Target Meet ID *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. NATIONALS-2027"
                  value={clearanceMeetId}
                  onChange={e => setClearanceMeetId(e.target.value)}
                  required
                  style={{
                    borderRadius: '14px',
                    background: 'rgba(10, 16, 30, 0.85)',
                    border: clearanceMeetId ? '1px solid #34d399' : '1px solid var(--border-glass-bright)',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                {/* Quick-fill buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {['NATIONALS-2027', 'AFRICA-CHAMPS-2027', 'WORLD-ATHLETICS-2027'].map(m => (
                    <button key={m} type="button" onClick={() => setClearanceMeetId(m)}
                      className="badge badge-green"
                      style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', textTransform: 'none', fontSize: '0.7rem' }}
                    >{m}</button>
                  ))}
                </div>
              </div>

              {/* Eligibility Status */}
              <div>
                <label className="form-label">Eligibility Decision *</label>
                <select
                  className="form-input"
                  value={clearanceStatus}
                  onChange={e => setClearanceStatus(Number(e.target.value) as EligibilityStatus)}
                  style={{
                    borderRadius: '14px',
                    background: 'rgba(10, 16, 30, 0.85)',
                    border: clearanceStatus === EligibilityStatus.Cleared
                      ? '1px solid #34d399'
                      : clearanceStatus === EligibilityStatus.Denied
                        ? '1px solid #f87171'
                        : '1px solid var(--border-glass-bright)',
                    fontWeight: 700,
                    color: clearanceStatus === EligibilityStatus.Cleared ? '#34d399'
                         : clearanceStatus === EligibilityStatus.Denied ? '#f87171' : '#fbbf24'
                  }}
                >
                  <option value={EligibilityStatus.Cleared}>✅  Cleared — Athlete is eligible to compete</option>
                  <option value={EligibilityStatus.Pending}>⏳  Pending — Under review, not yet cleared</option>
                  <option value={EligibilityStatus.Denied}>❌  Denied — Athlete does not meet requirements</option>
                </select>
              </div>

              {/* Validity (days) */}
              <div>
                <label className="form-label">Clearance Valid For (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="form-input"
                  value={clearanceDays}
                  onChange={e => setClearanceDays(e.target.value)}
                  style={{
                    borderRadius: '14px',
                    background: 'rgba(10, 16, 30, 0.85)',
                    border: '1px solid var(--border-glass-bright)',
                    fontWeight: 600
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Expires: {new Date(Date.now() + (parseInt(clearanceDays) || 90) * 86400000).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Submit */}
              <div style={{ gridColumn: '1 / -1', marginTop: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '0.95rem 1.6rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    borderRadius: '14px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <ClipboardCheck size={20} color="#34d399" />
                  <span>{isProcessing ? 'Attesting Eligibility On-Chain...' : 'Attest Eligibility & Lock On-Chain'}</span>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34d399'
                  }}>
                    attestEligibility()
                  </span>
                </button>
              </div>

            </form>
          </div>

          {/* Existing Attestations Table */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarCheck color="#34d399" size={22} />
                  On-Chain Eligibility Attestations
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Immutable, timestamped pre-meet clearances — the cryptographic proof that eliminates "not cleared in time" disputes.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                  <CheckCircle2 size={14} /> {activeClearances} Active Clearances
                </span>
                <span className="badge" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem', background: 'rgba(255,255,255,0.07)', color: 'var(--text-secondary)' }}>
                  {totalClearances} Total
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(eligibilities).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No eligibility attestations recorded yet. Use the form above to attest an athlete's pre-meet clearance.
                </div>
              ) : (
                Object.entries(eligibilities).map(([addr, attestations]) => {
                  const athlete = athletes[addr];
                  if (!attestations || attestations.length === 0) return null;
                  return (
                    <div key={addr}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
                        {athlete ? `${athlete.name} (${athlete.athleteId})` : `${addr.slice(0, 10)}...${addr.slice(-6)}`}
                      </div>
                      {attestations.map((att, idx) => {
                        const now = Math.floor(Date.now() / 1000);
                        const isExpired = att.expiresAt < now;
                        const daysLeft = Math.max(0, Math.ceil((att.expiresAt - now) / 86400));

                        const statusColor = att.status === EligibilityStatus.Cleared
                          ? '#34d399' : att.status === EligibilityStatus.Denied
                          ? '#f87171' : '#fbbf24';
                        const statusIcon = att.status === EligibilityStatus.Cleared
                          ? <CheckCircle2 size={15} /> : att.status === EligibilityStatus.Denied
                          ? <XCircle size={15} /> : <Clock size={15} />;
                        const statusLabel = att.status === EligibilityStatus.Cleared ? 'Cleared'
                          : att.status === EligibilityStatus.Denied ? 'Denied' : 'Pending';

                        return (
                          <div key={idx} style={{
                            background: 'rgba(10, 16, 30, 0.6)',
                            border: `1px solid ${isExpired ? 'rgba(100,100,100,0.3)' : att.status === EligibilityStatus.Cleared ? 'rgba(16, 185, 129, 0.25)' : att.status === EligibilityStatus.Denied ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                            borderRadius: '12px',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.85rem',
                            opacity: isExpired ? 0.6 : 1
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: statusColor, display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.92rem' }}>
                                  {statusIcon} {statusLabel}
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>for</span>
                                <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>{att.meetId}</span>
                                {isExpired && <span className="badge" style={{ fontSize: '0.68rem', background: 'rgba(100,100,100,0.2)', color: 'var(--text-muted)' }}>Expired</span>}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Attested {new Date(att.attestedAt * 1000).toLocaleDateString('en-ZA', { year:'numeric', month:'short', day:'numeric' })}
                                {' · '}
                                {isExpired ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
                                {' · by '}
                                <code style={{ color: '#a78bfa', fontSize: '0.75rem' }}>{att.attestedBy.slice(0,10)}...{att.attestedBy.slice(-4)}</code>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {!isExpired && (
                                <div style={{
                                  background: `rgba(${att.status === EligibilityStatus.Cleared ? '16,185,129' : att.status === EligibilityStatus.Denied ? '239,68,68' : '245,158,11'}, 0.12)`,
                                  border: `1px solid ${statusColor}33`,
                                  borderRadius: '8px',
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.78rem',
                                  color: statusColor,
                                  fontWeight: 600
                                }}>
                                  Expires {new Date(att.expiresAt * 1000).toLocaleDateString('en-ZA', { month:'short', day:'numeric', year:'numeric' })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
