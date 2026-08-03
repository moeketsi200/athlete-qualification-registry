import React, { useState } from 'react';
import { Search, Award, CheckCircle2, Shield, Calendar, User, Hash, ExternalLink, Sparkles, Trophy } from 'lucide-react';
import { Athlete, MeetResult, EventType, EventTypeNames } from '../types/registry';

interface QualificationLookupProps {
  athletes: Record<string, Athlete>;
  results: Record<string, MeetResult[]>;
}

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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Trophy color="#f59e0b" size={24} />
              Qualification Directory & Verification
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Search registered athletes to inspect cryptographically logged meet performance scores.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="Search by Name, Athlete ID, or Wallet Address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Event Filter Selector */}
          <select
            className="form-input"
            value={selectedEventType}
            onChange={e => setSelectedEventType(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="ALL">All Events (Shot Put, Discus, Javelin)</option>
            <option value={EventType.ShotPut}>Shot Put</option>
            <option value={EventType.Discus}>Discus Throw</option>
            <option value={EventType.Javelin}>Javelin Throw</option>
            <option value={EventType.Other}>Other Events</option>
          </select>

        </div>
      </div>

      {/* Athlete Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {filteredAthletes.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No matching qualification records found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try refining your search query or registering an athlete in the Official Dashboard.</p>
          </div>
        ) : (
          filteredAthletes.map(athlete => {
            const athleteMeetResults = results[athlete.address] || [];

            return (
              <div key={athlete.address} className="glass-card-interactive" style={{ padding: '1.75rem' }}>
                
                {/* Athlete Top Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                      border: '1px solid var(--primary-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}>
                      {athlete.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{athlete.name}</h3>
                        <span className="badge badge-green"><CheckCircle2 size={12} /> Verified Athlete</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <span>ID: <strong style={{ color: 'var(--text-secondary)' }}>{athlete.athleteId}</strong></span>
                        <span>•</span>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                          {athlete.address.slice(0, 6)}...{athlete.address.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    <div>National ID Hash:</div>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {athlete.nationalIdHash.slice(0, 10)}...{athlete.nationalIdHash.slice(-6)}
                    </code>
                  </div>

                </div>

                {/* Logged Meet Results */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={14} color="#f59e0b" />
                    On-Chain Verified Qualification Performances ({athleteMeetResults.length})
                  </div>

                  {athleteMeetResults.length === 0 ? (
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No official meet performances logged yet for this athlete.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {athleteMeetResults.map((result, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="badge badge-gold">
                              {EventTypeNames[result.eventType] || 'Event'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(result.timestamp * 1000).toLocaleDateString()}
                            </span>
                          </div>

                          <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.5rem 0' }} className="gradient-text-cyan">
                            {result.distanceInMeters.toFixed(2)} meters
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div>Meet ID: <strong style={{ color: 'var(--text-secondary)' }}>{result.eventId}</strong></div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                              <span>Signed Official:</span>
                              <code style={{ color: '#c084fc', fontFamily: 'monospace' }}>
                                {result.officialAddress.slice(0, 6)}...{result.officialAddress.slice(-4)}
                              </code>
                            </div>
                            {result.txHash && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                                <span>Tx Hash:</span>
                                <span style={{ color: '#34d399', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  {result.txHash} <ExternalLink size={12} />
                                </span>
                              </div>
                            )}
                          </div>

                        </div>
                      ))}
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
