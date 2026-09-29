import React from 'react';
import { Award, ShieldCheck, Cpu, Code2, Zap, GitCommit, Heart, ExternalLink, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel" style={{
      margin: '4rem auto 1.5rem auto',
      maxWidth: '1240px',
      width: 'calc(100% - 2rem)',
      padding: '2.5rem 2.25rem 1.5rem 2.25rem',
      borderRadius: '24px',
      background: 'rgba(10, 15, 28, 0.75)',
      backdropFilter: 'blur(24px)',
      border: '1px solid var(--border-glass-bright)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.08)'
    }}>
      
      {/* Top Footer Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {/* Column 1: Brand & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              padding: '0.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)'
            }}>
              <Award size={22} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              ATHLETIC<span className="gradient-text-cyan">LEDGER</span>
            </h3>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Decentralized Qualification Registry eliminating administrative disputes and missing paperwork in regional African track & field throwing events.
          </p>

          {/* Tech Stack Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
              <Code2 size={11} /> Solidity ^0.8.20
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
              <Cpu size={11} /> Foundry Testnet
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
              <Zap size={11} /> React 19 / Vite
            </span>
          </div>
        </div>

        {/* Column 2: Supported Disciplines */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Supported Throwing Events
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#38bdf8' }}>•</span> Shot Put (7.26kg Men / 4kg Women)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#c084fc' }}>•</span> Discus Throw (2.0kg Men / 1kg Women)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#fbbf24' }}>•</span> Javelin Throw (800g Men / 600g Women)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#34d399' }}>•</span> Regional Championship Qualifiers
            </li>
          </ul>
        </div>

        {/* Column 3: Sprint Target & Security Assurance */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Sprint Status & Governance
          </h4>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-glass-bright)',
            borderRadius: '16px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sprint Phase:</span>
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                <GitCommit size={12} /> Iteration 3
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Deadline:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="pulse-dot"></span> Aug 5 Sprint Target
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Contract Security:</span>
              <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={14} /> `onlyOfficial` Modifier Active
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingTop: '1.25rem',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          Built for <strong>Africa's Blockchain Club Qualification Sprint</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>Powered by Cryptographic Proofs & Immutable Smart Contracts</span>
        </div>
      </div>

    </footer>
  );
};
