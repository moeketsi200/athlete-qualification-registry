import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { QualificationLookup } from './components/QualificationLookup';
import { OfficialDashboard } from './components/OfficialDashboard';
import { Footer } from './components/Footer';
import { useWeb3Registry } from './hooks/useWeb3Registry';
import { Trophy, ShieldCheck, Search } from 'lucide-react';

export default function App() {
  const {
    wallet,
    connectWallet,
    toggleOfficialRole,
    switchWallet,
    athletes,
    results,
    pendingResults,
    officials,
    registerAthlete,
    recordResult,
    addOfficial,
    isProcessing,
    txMessage,
    contractAddress
  } = useWeb3Registry();

  const [activeView, setActiveView] = useState<'LOOKUP' | 'OFFICIAL'>('LOOKUP');

  const totalAthletesCount = Object.keys(athletes).length;
  const totalResultsCount = Object.values(results).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <Navbar
        wallet={wallet}
        connectWallet={connectWallet}
        toggleOfficialRole={toggleOfficialRole}
        contractAddress={contractAddress}
      />

      {/* Hero Banner with Live Metrics */}
      <HeroSection
        totalAthletes={totalAthletesCount}
        totalResults={totalResultsCount}
      />

      {/* Main Mode View Navigation Header Bar */}
      <div style={{ maxWidth: '1240px', width: '100%', margin: '1rem auto 0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.85rem',
          background: 'rgba(10, 16, 30, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glass-bright)',
          padding: '0.55rem',
          borderRadius: '18px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35)'
        }}>
          
          <button
            onClick={() => setActiveView('LOOKUP')}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '14px',
              border: activeView === 'LOOKUP' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              background: activeView === 'LOOKUP' 
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(2, 132, 199, 0.25) 100%)' 
                : 'transparent',
              color: activeView === 'LOOKUP' ? '#38bdf8' : 'var(--text-secondary)',
              fontSize: '0.98rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: activeView === 'LOOKUP' ? '0 4px 16px rgba(6, 182, 212, 0.25)' : 'none'
            }}
          >
            <Search size={18} color={activeView === 'LOOKUP' ? '#38bdf8' : 'var(--text-muted)'} />
            <span>Qualification Directory</span>
            {activeView === 'LOOKUP' && (
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Active</span>
            )}
          </button>

          <button
            onClick={() => setActiveView('OFFICIAL')}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '14px',
              border: activeView === 'OFFICIAL' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: activeView === 'OFFICIAL' 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)' 
                : 'transparent',
              color: activeView === 'OFFICIAL' ? '#fbbf24' : 'var(--text-secondary)',
              fontSize: '0.98rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: activeView === 'OFFICIAL' ? '0 4px 16px rgba(245, 158, 11, 0.25)' : 'none'
            }}
          >
            <ShieldCheck size={18} color={activeView === 'OFFICIAL' ? '#fbbf24' : 'var(--text-muted)'} />
            <span>Official Management Portal</span>
            {activeView === 'OFFICIAL' && (
              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Active</span>
            )}
          </button>

        </div>
      </div>

      {/* Dynamic Main View */}
      <main style={{ flex: 1 }}>
        {activeView === 'LOOKUP' ? (
          <QualificationLookup
            athletes={athletes}
            results={results}
          />
        ) : (
          <OfficialDashboard
            wallet={wallet}
            switchWallet={switchWallet}
            athletes={athletes}
            officials={officials}
            pendingResults={pendingResults}
            recordResult={recordResult}
            registerAthlete={registerAthlete}
            addOfficial={addOfficial}
            isProcessing={isProcessing}
            txMessage={txMessage}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
