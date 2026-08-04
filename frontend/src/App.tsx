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
    athletes,
    results,
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

      {/* Main Mode View Navigation */}
      <div style={{ maxWidth: '1200px', width: '100%', margin: '1rem auto 0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '0.75rem'
        }}>
          
          <button
            onClick={() => setActiveView('LOOKUP')}
            style={{
              background: 'none',
              border: 'none',
              color: activeView === 'LOOKUP' ? '#38bdf8' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: activeView === 'LOOKUP' ? '2px solid #06b6d4' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={18} /> Qualification Directory
          </button>

          <button
            onClick={() => setActiveView('OFFICIAL')}
            style={{
              background: 'none',
              border: 'none',
              color: activeView === 'OFFICIAL' ? '#fbbf24' : 'var(--text-muted)',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: activeView === 'OFFICIAL' ? '2px solid #f59e0b' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={18} /> Official Management Portal
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
            athletes={athletes}
            officials={officials}
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
