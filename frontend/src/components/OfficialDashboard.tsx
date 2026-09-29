import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, UserPlus, AlertTriangle, CheckCircle2, Lock, Flame, Copy, Check, Users, Award } from 'lucide-react';
import { Athlete, MeetResult, EventType, EventTypeNames, WalletState, OfficialInfo } from '../types/registry';

interface OfficialDashboardProps {
  wallet: WalletState;
  athletes: Record<string, Athlete>;
  officials?: OfficialInfo[];
  recordResult: (athleteAddr: string, eventId: string, type: EventType, dist: number) => Promise<MeetResult | void>;
  registerAthlete: (addr: string, id: string, name: string, hash: string) => Promise<Athlete | void>;
  addOfficial: (addr: string) => Promise<void>;
  isProcessing: boolean;
  txMessage: string | null;
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  wallet,
  athletes,
  officials = [],
  recordResult,
  registerAthlete,
  addOfficial,
  isProcessing,
  txMessage
}) => {
  const [activeTab, setActiveTab] = useState<'RECORD' | 'REGISTER' | 'ADMIN'>('RECORD');
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
            minWidth: '220px',
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

    </div>
  );
};
