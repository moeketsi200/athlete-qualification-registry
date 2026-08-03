import React from 'react';
import { ShieldCheck, Award, Lock, Flame, CheckCircle2, Zap } from 'lucide-react';

interface HeroSectionProps {
  totalAthletes: number;
  totalResults: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ totalAthletes, totalResults }) => {
  return (
    <div style={{ padding: '2.5rem 1.5rem 1.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        
        {/* Top Highlight Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }} className="badge badge-gold">
          <Zap size={14} color="#fbbf24" />
          <span>Africa's Blockchain Club Qualification Sprint</span>
        </div>

        {/* Main Heading */}
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15 }}>
          Immutable Ledger for <br />
          <span className="gradient-text-gold">Athletic Qualifications</span>
        </h1>

        {/* Description */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Eliminate administrative disputes, missing paperwork, and retroactive disqualifications in regional track & field throwing events. Qualification distances are cryptographically signed by authorized meet officials.
        </p>

      </div>

      {/* Feature / Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#38bdf8' }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text-cyan">{totalAthletes}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Registered Athletes</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#fbbf24' }}>
            <Flame size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text-gold">{totalResults}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Verified Meet Results</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#34d399' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Cryptographic Proof</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#c084fc' }}>
            <Lock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text-purple">0</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Arbitrary Disqualifications</div>
          </div>
        </div>

      </div>
    </div>
  );
};
