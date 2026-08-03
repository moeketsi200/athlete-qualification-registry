import React from 'react';
import { Shield, Award, ExternalLink, GitCommit, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel" style={{ margin: '3rem 1rem 1rem 1rem', padding: '2rem', borderRadius: '16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <Award size={20} color="#06b6d4" />
            <span>Athletic Ledger — Decentralized Qualification Registry</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Built for Africa's Blockchain Club Sprint | Powered by Solidity, Foundry & React
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GitCommit size={14} color="#f59e0b" />
            <span>Iteration 3 Client Integrated</span>
          </div>
          <span>•</span>
          <span style={{ color: '#38bdf8' }}>Aug 5 Sprint Target</span>
        </div>

      </div>
    </footer>
  );
};
