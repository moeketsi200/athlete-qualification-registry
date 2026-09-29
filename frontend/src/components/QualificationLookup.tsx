import React, { useState } from 'react';
import { Search, Award, CheckCircle2, Calendar, Hash, ExternalLink, Sparkles, Trophy, Disc, Activity, Layers } from 'lucide-react';
import { Athlete, MeetResult, EventType, EventTypeNames } from '../types/registry';

interface QualificationLookupProps {
  athletes: Record<string, Athlete>;
  results: Record<string, MeetResult[]>;
}

// Benchmark standard distances for visual qualification meters
const EVENT_BENCHMARKS: Record<EventType, number> = {
  [EventType.ShotPut]: 22.50,  // meters benchmark
  [EventType.Discus]: 70.00,   // meters benchmark
  [EventType.Javelin]: 90.00,  // meters benchmark
  [EventType.Other]: 50.00
};

export const QualificationLookup: React.FC<QualificationLookupProps> = ({ athletes, results }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');

  const athleteList = Object.values(athletes);

  const filteredAthletes = athleteList.filter(athlete => {
    const matchesSearch = 
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.athleteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedEventType !== 'ALL') {
      const athleteResults = results[athlete.address] || [];
      const typeNum = Number(selectedEventType);
      return athleteResults.some(r => r.eventType === typeNum);
    }

    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      {/* Header & Controls */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Trophy color="#f59e0b" size={26} />
              Qualification Directory & Verification
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
              Search registered athletes to inspect cryptographically logged meet performance scores.
            </p>
          </div>
        </div>

        {/* Filter Controls & Search Box Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            
            {/* High-End Search Input */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search 
                size={20} 
                color={searchQuery ? "#06b6d4" : "var(--text-muted)"} 
                style={{ 
                  position: 'absolute', 
                  left: '1.1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  transition: 'color 0.2s ease'
                }} 
              />
              <input
                type="text"
                className="form-input"
                style={{ 
                  paddingLeft: '3rem', 
                  paddingRight: searchQuery ? '3rem' : '1.25rem',
                  fontSize: '0.98rem',
                  borderRadius: '14px',
                  background: 'transparent',
                  border: searchQuery ? '1px solid var(--primary-cyan)' : '1px solid var(--border-glass-bright)',
                  boxShadow: searchQuery ? '0 0 20px rgba(6, 182, 212, 0.25)' : 'none'
                }}
                placeholder="Search athlete by Name, ID (ATH-ZA-001), or Wallet Address (0x...)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              {/* Clear Search Button */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Discipline Dropdown Selector */}
            <select
              className="form-input"
              value={selectedEventType}
              onChange={e => setSelectedEventType(e.target.value)}
              style={{ 
                cursor: 'pointer',
                borderRadius: '14px',
                padding: '0.85rem 1.15rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                background: 'rgba(10, 16, 30, 0.85)',
                border: '1px solid var(--border-glass-bright)'
              }}
            >
              <option value="ALL">All Disciplines (Shot Put, Discus, Javelin)</option>
              <option value={EventType.ShotPut}>Shot Put (7.26kg)</option>
              <option value={EventType.Discus}>Discus Throw (2.0kg)</option>
              <option value={EventType.Javelin}>Javelin Throw (800g)</option>
              <option value={EventType.Other}>Other Throwing Events</option>
            </select>

          </div>

          {/* Quick Filter Search Tags & Live Results Count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Quick Search Tags:</span>
              <button 
                onClick={() => setSearchQuery('Moeketsi')} 
                className="badge badge-cyan" 
                style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.75rem' }}
              >
                Moeketsi
              </button>
              <button 
                onClick={() => setSearchQuery('ATH-KE-104')} 
                className="badge badge-gold" 
                style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.75rem' }}
              >
                ATH-KE-104
              </button>
              <button 
                onClick={() => setSearchQuery('Chukwuebuka')} 
                className="badge badge-purple" 
                style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.75rem' }}
              >
                Chukwuebuka
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: '#38bdf8' }}>{filteredAthletes.length}</strong> of {athleteList.length} Athletes
            </div>

          </div>

        </div>
      </div>

      {/* Athlete Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {filteredAthletes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={42} style={{ marginBottom: '1rem', opacity: 0.4, color: '#38bdf8' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>No matching qualification records found</div>
            <p style={{ fontSize: '0.88rem', marginTop: '0.35rem' }}>Try refining your search query or registering an athlete in the Official Dashboard.</p>
          </div>
        ) : (
          filteredAthletes.map(athlete => {
            const athleteMeetResults = results[athlete.address] || [];

            return (
              <div key={athlete.address} className="glass-card-interactive" style={{ padding: '1.85rem' }}>
                
                {/* Athlete Top Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                      border: '1px solid var(--primary-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                      fontWeight: 800,
                      fontSize: '1.35rem',
                      boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2)'
                    }}>
                      {athlete.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{athlete.name}</h3>
                        <span className="badge badge-green"><CheckCircle2 size={12} /> Verified Profile</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span>ID: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{athlete.athleteId}</strong></span>
                        <span>•</span>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                          {athlete.address.slice(0, 8)}...{athlete.address.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    <div>National ID Hash:</div>
                    <code style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {athlete.nationalIdHash.slice(0, 10)}...{athlete.nationalIdHash.slice(-6)}
                    </code>
                  </div>

                </div>

                {/* Logged Meet Results */}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={16} color="#f59e0b" />
                    On-Chain Verified Qualification Performances ({athleteMeetResults.length})
                  </div>

                  {athleteMeetResults.length === 0 ? (
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-glass)', borderRadius: '14px', padding: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No official meet performances logged yet for this athlete.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.15rem' }}>
                      {athleteMeetResults.map((result, idx) => {
                        const benchmark = EVENT_BENCHMARKS[result.eventType] || 50;
                        const percentage = Math.min(100, Math.max(15, (result.distanceInMeters / benchmark) * 100));

                        return (
                          <div key={idx} style={{
                            background: 'rgba(10, 16, 30, 0.7)',
                            border: '1px solid var(--border-glass-bright)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.25s ease'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <span className="badge badge-gold">
                                  {result.eventType === EventType.ShotPut && <Activity size={12} />}
                                  {result.eventType === EventType.Discus && <Disc size={12} />}
                                  {result.eventType === EventType.Javelin && <Layers size={12} />}
                                  {EventTypeNames[result.eventType] || 'Event'}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Calendar size={12} />
                                  {new Date(result.timestamp * 1000).toLocaleDateString()}
                                </span>
                              </div>

                              <div style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.4rem 0' }} className="gradient-text-cyan">
                                {result.distanceInMeters.toFixed(2)}m
                              </div>

                              {/* Distance Performance Bar */}
                              <div style={{ margin: '0.75rem 0' }}>
                                <div style={{ height: 6, width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden' }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: 'linear-gradient(90deg, #06b6d4 0%, #38bdf8 50%, #fbbf24 100%)',
                                    borderRadius: 4
                                  }}></div>
                                </div>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.65rem', marginTop: '0.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Meet ID:</span>
                                <strong style={{ color: 'var(--text-main)' }}>{result.eventId}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Signed Official:</span>
                                <code style={{ color: '#c084fc', fontFamily: 'monospace', fontWeight: 600 }}>
                                  {result.officialAddress.slice(0, 6)}...{result.officialAddress.slice(-4)}
                                </code>
                              </div>
                              {result.txHash && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Tx Hash:</span>
                                  <span style={{ color: '#34d399', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                                    {result.txHash} <ExternalLink size={12} />
                                  </span>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
