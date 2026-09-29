import React from 'react';
import { ShieldCheck, Award, Lock, Flame, Zap, Disc, Activity, Layers } from 'lucide-react';

interface HeroSectionProps {
  totalAthletes: number;
  totalResults: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ totalAthletes, totalResults }) => {
  return (
    <div style={{ padding: '2.5rem 1.5rem 1rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        
        {/* Top Highlight Pill with Glowing Pulse */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }} className="badge badge-gold">
          <Zap size={14} color="#fbbf24" />
          <span>Africa's Blockchain Club Qualification Sprint</span>
          <span className="pulse-dot" style={{ background: '#fbbf24', boxShadow: '0 0 10px #fbbf24' }}></span>
        </div>

        {/* Main Heading */}
        <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.12 }}>
          Immutable Ledger for <br />
          <span className="gradient-text-gold">Athletic Qualifications</span>
        </h1>

        {/* Sub-heading Description */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '760px', margin: '0 auto 1.75rem auto', lineHeight: 1.65 }}>
          Eliminate administrative disputes, missing paperwork, and retroactive disqualifications in regional track & field throwing events. Qualification distances are cryptographically signed by authorized meet officials.
        </p>

        {/* Event Disciplines Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}>
            <Activity size={14} /> Shot Put (7.26kg)
          </span>
          <span className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}>
            <Disc size={14} /> Discus Throw (2.0kg)
          </span>
          <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}>
            <Layers size={14} /> Javelin Throw (800g)
          </span>
        </div>

      </div>

      {/* Feature / Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.25rem'
      }}>
        
        <div className="glass-card-interactive" style={{ padding: '1.6rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '0.9rem',
            borderRadius: '16px',
            color: '#38bdf8'
          }}>
            <Award size={30} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900 }} className="gradient-text-cyan">{totalAthletes}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registered Athletes</div>
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '1.6rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '0.9rem',
            borderRadius: '16px',
            color: '#fbbf24'
          }}>
            <Flame size={30} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900 }} className="gradient-text-gold">{totalResults}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Verified Meet Results</div>
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '1.6rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.9rem',
            borderRadius: '16px',
            color: '#34d399'
          }}>
            <ShieldCheck size={30} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cryptographic Proof</div>
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '1.6rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '0.9rem',
            borderRadius: '16px',
            color: '#c084fc'
          }}>
            <Lock size={30} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900 }} className="gradient-text-purple">0</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Arbitrary Disqualifications</div>
          </div>
        </div>

      </div>
    </div>
  );
};
