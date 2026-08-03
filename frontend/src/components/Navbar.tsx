import React from 'react';
import { Shield, Award, Wallet, CheckCircle2, UserCheck, ShieldAlert, Cpu } from 'lucide-react';
import { WalletState } from '../types/registry';

interface NavbarProps {
  wallet: WalletState;
  connectWallet: () => void;
  toggleOfficialRole: () => void;
  contractAddress: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  connectWallet,
  toggleOfficialRole,
  contractAddress
}) => {
  return (
    <nav className="glass-panel" style={{ position: 'sticky', top: '1rem', zIndex: 100, margin: '1rem', padding: '1rem 1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Contract Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            padding: '0.6rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)'
          }}>
            <Award size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>
              ATHLETIC<span className="gradient-text-cyan">LEDGER</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Cpu size={12} color="#06b6d4" />
              <span>Contract:</span>
              <code style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </code>
            </div>
          </div>
        </div>

        {/* Network & Role Switcher + Wallet Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          
          {/* Network Badge */}
          <div className="badge badge-cyan" style={{ padding: '0.4rem 0.85rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', display: 'inline-block', boxShadow: '0 0 8px #38bdf8' }}></span>
            {wallet.networkName}
          </div>

          {/* Toggle Role (Demo Feature for testing official vs guest view) */}
          <button
            onClick={toggleOfficialRole}
            className={wallet.isOfficial ? "badge badge-gold" : "badge badge-purple"}
            title="Click to toggle between Official & Guest perspectives"
            style={{ cursor: 'pointer', border: 'none', padding: '0.45rem 0.85rem' }}
          >
            {wallet.isOfficial ? (
              <>
                <UserCheck size={14} /> Official Verified
              </>
            ) : (
              <>
                <ShieldAlert size={14} /> Guest View
              </>
            )}
          </button>

          {/* Wallet Action Button */}
          <button
            onClick={connectWallet}
            className={wallet.isConnected ? "btn-secondary" : "btn-primary"}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}
          >
            <Wallet size={16} />
            {wallet.isConnected && wallet.address ? (
              <span>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>

        </div>
      </div>
    </nav>
  );
};
