import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, UserPlus, AlertTriangle, CheckCircle2, Lock, Flame } from 'lucide-react';
import { Athlete, EventType, EventTypeNames, WalletState } from '../types/registry';

interface OfficialDashboardProps {
  wallet: WalletState;
  athletes: Record<string, Athlete>;
  recordResult: (athleteAddr: string, eventId: string, type: EventType, dist: number) => Promise<any>;
  registerAthlete: (addr: string, id: string, name: string, hash: string) => Promise<any>;
  addOfficial: (addr: string) => Promise<any>;
  isProcessing: boolean;
  txMessage: string | null;
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  wallet,
  athletes,
  recordResult,
  registerAthlete,
  addOfficial,
  isProcessing,
  txMessage
}) => {
  const [activeTab, setActiveTab] = useState<'RECORD' | 'REGISTER' | 'ADMIN'>('RECORD');

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
    } catch (err: any) {
      setFormError(err.message || "Transaction failed");
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
    } catch (err: any) {
      setFormError(err.message || "Failed to register athlete.");
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
    } catch (err: any) {
      setFormError(err.message || "Failed to add official.");
    }
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('RECORD')}
          className={activeTab === 'RECORD' ? 'btn-primary' : 'btn-secondary'}
        >
          <PlusCircle size={18} /> Record Meet Result
        </button>
        <button
          onClick={() => setActiveTab('REGISTER')}
          className={activeTab === 'REGISTER' ? 'btn-primary' : 'btn-secondary'}
        >
          <UserPlus size={18} /> Register New Athlete
        </button>
        <button
          onClick={() => setActiveTab('ADMIN')}
          className={activeTab === 'ADMIN' ? 'btn-gold' : 'btn-secondary'}
        >
          <ShieldCheck size={18} /> Manage Officials
        </button>
      </div>

      {/* Tab 1: Record Result */}
      {activeTab === 'RECORD' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame color="#f59e0b" size={20} />
            Log Official Meet Performance (`recordResult`)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Only verified officials can invoke this transaction. Invoking with distance = 0 will trigger <code style={{ color: '#f87171' }}>AthleticRegistry__InvalidDistance()</code> custom error.
          </p>

          <form onSubmit={handleRecordSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            
            <div>
              <label className="form-label">Select Registered Athlete *</label>
              <select
                className="form-input"
                value={selectedAthleteAddr}
                onChange={e => setSelectedAthleteAddr(e.target.value)}
                required
              >
                <option value="">-- Choose Athlete --</option>
                {Object.values(athletes).map(a => (
                  <option key={a.address} value={a.address}>
                    {a.name} ({a.athleteId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Event / Meet ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MEET-2026-SHOTPUT-01"
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Event Type *</label>
              <select
                className="form-input"
                value={eventType}
                onChange={e => setEventType(Number(e.target.value) as EventType)}
              >
                <option value={EventType.ShotPut}>Shot Put</option>
                <option value={EventType.Discus}>Discus Throw</option>
                <option value={EventType.Javelin}>Javelin Throw</option>
                <option value={EventType.Other}>Other Event</option>
              </select>
            </div>

            <div>
              <label className="form-label">Performance Distance (Meters) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 21.85 (Try 0 to test revert)"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={isProcessing}
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                {isProcessing ? "Executing Transaction..." : "Log Verified Distance On-Chain"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tab 2: Register Athlete */}
      {activeTab === 'REGISTER' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus color="#06b6d4" size={20} />
            Register Athlete Profile (`registerAthlete`)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Adds a new athlete entity to the immutable mapping <code style={{ color: '#38bdf8' }}>s_athletes[address]</code>.
          </p>

          <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            
            <div>
              <label className="form-label">Athlete Wallet Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={newAthleteAddr}
                onChange={e => setNewAthleteAddr(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Athlete Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Wayde van Niekerk"
                value={newAthleteName}
                onChange={e => setNewAthleteName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Athlete ID (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ATH-ZA-999"
                value={newAthleteId}
                onChange={e => setNewAthleteId(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">National ID Hash (bytes32 Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={newNationalIdHash}
                onChange={e => setNewNationalIdHash(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={isProcessing}
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                {isProcessing ? "Processing Registration..." : "Register Athlete Profile"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tab 3: Manage Officials */}
      {activeTab === 'ADMIN' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="#f59e0b" size={20} />
            Authorize Meet Official (`addOfficial`)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Admin function granting logging privileges to a meet official's wallet address.
          </p>

          <form onSubmit={handleAddOfficialSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Official Wallet Address (0x...)"
                value={newOfficialAddr}
                onChange={e => setNewOfficialAddr(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-gold"
              disabled={isProcessing}
              style={{ minWidth: '180px', justifyContent: 'center' }}
            >
              {isProcessing ? "Authorizing..." : "Grant Official Role"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
