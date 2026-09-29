import React, { useState } from 'react';
import { Award, Wallet, UserCheck, ShieldAlert, Cpu, Copy, Check, ShieldCheck, Zap, Globe, Coins } from 'lucide-react';
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
  const [copiedContract, setCopiedContract] = useState(false);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '1rem',
      zIndex: 100,
      margin: '1rem auto',
      maxWidth: '1240px',
      width: 'calc(100% - 2rem)',
      padding: '0.95rem 1.75rem',
      background: 'rgba(10, 15, 28, 0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.1)',
      border: '1px solid var(--border-glass-bright)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Contract Address Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          
          {/* Logo Mark with Multi-Gradient Border Glow */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 50%, #8b5cf6 100%)',
            padding: '2px',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)'
          }}>
            <div style={{
              background: '#070b19',
              padding: '0.6rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={26} color="#fbbf24" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                ATHLETIC<span className="gradient-text-cyan">LEDGER</span>
              </h1>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                <Globe size={11} color="#06b6d4" /> Africa Blockchain
              </span>
            </div>

            {/* Interactive Copyable Contract Pill */}
            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={handleCopyContract}
                title="Click to copy Smart Contract Address"
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '8px',
                  padding: '0.25rem 0.6rem',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Cpu size={12} color="#06b6d4" />
                <span>Contract:</span>
                <strong style={{ color: '#f8fafc' }}>
                  {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </strong>
                {copiedContract ? <Check size={12} color="#34d399" /> : <Copy size={12} style={{ opacity: 0.7 }} />}
              </button>
            </div>
          </div>

        </div>

        {/* Network & Role Switcher + Wallet Info Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          
          {/* Live Network Badge with Pulse Dot */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '12px',
            padding: '0.5rem 0.95rem',
            fontSize: '0.82rem',
            color: '#38bdf8',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)'
          }}>
            <span className="pulse-dot"></span>
            <span>{wallet.networkName}</span>
          </div>

          {/* Role Mode Toggle Button (Official vs Guest) */}
          <button
            onClick={toggleOfficialRole}
            title="Click to toggle between Official & Guest perspectives"
            style={{
              cursor: 'pointer',
              padding: '0.55rem 1.1rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              borderRadius: '12px',
              border: wallet.isOfficial 
                ? '1px solid rgba(245, 158, 11, 0.45)' 
                : '1px solid rgba(139, 92, 246, 0.45)',
              background: wallet.isOfficial 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)' 
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(109, 40, 217, 0.25) 100%)',
              color: wallet.isOfficial ? '#fbbf24' : '#c084fc',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: wallet.isOfficial 
                ? '0 4px 16px rgba(245, 158, 11, 0.25)' 
                : '0 4px 16px rgba(139, 92, 246, 0.25)'
            }}
          >
            {wallet.isOfficial ? (
              <>
                <ShieldCheck size={16} color="#fbbf24" />
                <span>Official Mode Active</span>
              </>
            ) : (
              <>
                <ShieldAlert size={16} color="#c084fc" />
                <span>Guest View Mode</span>
              </>
            )}
          </button>

          {/* Wallet Action Button with Balance Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {wallet.isConnected && wallet.balance && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass-bright)',
                borderRadius: '12px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <Coins size={14} color="#fbbf24" /> {wallet.balance}
              </div>
            )}

            <button
              onClick={connectWallet}
              style={{
                cursor: 'pointer',
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '12px',
                border: wallet.isConnected 
                  ? '1px solid rgba(6, 182, 212, 0.45)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: wallet.isConnected 
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(2, 132, 199, 0.25) 100%)' 
                  : 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                color: wallet.isConnected ? '#38bdf8' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: wallet.isConnected 
                  ? '0 4px 16px rgba(6, 182, 212, 0.25)' 
                  : '0 4px 16px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Wallet size={16} color={wallet.isConnected ? "#38bdf8" : "#ffffff"} />
              {wallet.isConnected && wallet.address ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
