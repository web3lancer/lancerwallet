"use client";
import React, { useState } from 'react';
import Link from 'next/link';

interface Wallet {
  id: string;
  name: string;
  address: string;
  balance: number;
  balanceUSD: number;
  network: string;
  type: 'imported' | 'generated';
  lastUsed: string;
  tokens: Array<{
    symbol: string;
    name: string;
    balance: number;
    valueUSD: number;
    icon: string;
  }>;
}

export default function WalletsPageClient() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock wallet data
  const wallets: Wallet[] = [
    {
      id: '1',
      name: 'Main Wallet',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: 2.45,
      balanceUSD: 8420.50,
      network: 'Ethereum',
      type: 'generated',
      lastUsed: '2 hours ago',
      tokens: [
        { symbol: 'ETH', name: 'Ethereum', balance: 2.45, valueUSD: 8420.50, icon: '⟠' },
        { symbol: 'USDC', name: 'USD Coin', balance: 1500.00, valueUSD: 1500.00, icon: '💵' },
        { symbol: 'UNI', name: 'Uniswap', balance: 145.20, valueUSD: 726.00, icon: '🦄' }
      ]
    },
    {
      id: '2',
      name: 'Trading Wallet',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      balance: 0.85,
      balanceUSD: 2923.75,
      network: 'Ethereum',
      type: 'imported',
      lastUsed: '1 day ago',
      tokens: [
        { symbol: 'ETH', name: 'Ethereum', balance: 0.85, valueUSD: 2923.75, icon: '⟠' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 0.012, valueUSD: 520.00, icon: '₿' }
      ]
    }
  ];

  const totalPortfolioValue = wallets.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            My Wallets
          </h1>
          <p className="text-base text-secondary">
            Manage your crypto wallets and view balances
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Add Wallet
        </button>
      </header>

      {/* Portfolio Summary */}
      <div className="card-wallet mb-8" style={{ position: 'relative', overflow: 'hidden' }}>
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '140%',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm mb-1" style={{ opacity: 0.8 }}>
                Total Portfolio Value
              </p>
              <h2 className="text-4xl font-bold" style={{ letterSpacing: '-0.5px' }}>
                {formatCurrency(totalPortfolioValue)}
              </h2>
              <p className="text-sm mt-2" style={{ opacity: 0.9 }}>
                Across {wallets.length} wallets
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm mb-1" style={{ opacity: 0.8 }}>
                24h Change
              </div>
              <div 
                className="text-lg font-semibold px-3 py-1 rounded-md"
                style={{
                  background: 'rgba(76, 175, 80, 0.2)',
                  color: 'var(--success)'
                }}
              >
                +$127.50 (+0.8%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Your Wallets
        </h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all var(--transition-normal) ease-in-out',
                border: selectedWallet === wallet.id ? '2px solid var(--purple-500)' : '1px solid var(--border-default)'
              }}
              onClick={() => setSelectedWallet(selectedWallet === wallet.id ? null : wallet.id)}
            >
              {/* Wallet Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-lg)',
                      background: wallet.type === 'generated' 
                        ? 'linear-gradient(135deg, var(--purple-500), var(--purple-600))'
                        : 'linear-gradient(135deg, var(--brown-500), var(--brown-600))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-inverse)',
                      fontSize: '1.2rem'
                    }}
                  >
                    {wallet.type === 'generated' ? '🔐' : '📥'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {wallet.name}
                    </h3>
                    <p className="text-sm text-secondary font-mono">
                      {formatAddress(wallet.address)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(wallet.balanceUSD)}
                  </p>
                  <p className="text-sm text-secondary">
                    {wallet.balance.toFixed(4)} ETH
                  </p>
                </div>
              </div>

              {/* Network Badge */}
              <div className="flex justify-between items-center mb-4">
                <span 
                  className="px-3 py-1 rounded-md text-sm font-medium"
                  style={{
                    background: 'rgba(33, 150, 243, 0.1)',
                    color: 'var(--info)',
                    border: '1px solid rgba(33, 150, 243, 0.2)'
                  }}
                >
                  {wallet.network}
                </span>
                <span className="text-xs text-tertiary">
                  Last used {wallet.lastUsed}
                </span>
              </div>

              {/* Token Summary */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-secondary">
                  Top Tokens ({wallet.tokens.length})
                </p>
                <div className="flex gap-2">
                  {wallet.tokens.slice(0, 3).map((token) => (
                    <div
                      key={token.symbol}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                      style={{
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border-default)'
                      }}
                    >
                      <span>{token.icon}</span>
                      <span className="font-medium">{token.symbol}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedWallet === wallet.id && (
                <div 
                  className="fade-in mt-4 pt-4"
                  style={{ borderTop: '1px solid var(--border-default)' }}
                >
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-primary">
                      Token Breakdown
                    </h4>
                    {wallet.tokens.map((token) => (
                      <div
                        key={token.symbol}
                        className="flex justify-between items-center p-2 rounded-md"
                        style={{ background: 'var(--surface-hover)' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{token.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-primary">
                              {token.symbol}
                            </p>
                            <p className="text-xs text-secondary">
                              {token.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {formatCurrency(token.valueUSD)}
                          </p>
                          <p className="text-xs text-secondary">
                            {token.balance.toLocaleString()} {token.symbol}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/send?wallet=${wallet.id}`} className="btn-primary btn-sm" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                      💸 Send
                    </Link>
                    <button className="btn-secondary btn-sm" style={{ flex: 1 }}>
                      📥 Receive
                    </button>
                    <button className="btn-ghost btn-sm" style={{ flex: 1 }}>
                      ⚙️ Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-primary mb-4">
              Add New Wallet
            </h3>
            <p className="text-base text-secondary mb-6">
              Choose how you&apos;d like to add a wallet to your account.
            </p>
            <div className="space-y-3">
              <Link 
                href="/onboarding"
                className="btn-primary"
                style={{ 
                  width: '100%',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                🆕 Create New Wallet
              </Link>
              <button className="btn-secondary" style={{ width: '100%' }}>
                📥 Import Existing Wallet
              </button>
              <button className="btn-ghost" style={{ width: '100%' }}>
                🔗 Connect Hardware Wallet
              </button>
            </div>
            <button 
              className="btn-ghost mt-4"
              onClick={() => setShowCreateModal(false)}
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}