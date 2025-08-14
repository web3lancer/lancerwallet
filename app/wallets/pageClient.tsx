"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWalletsFromStorage, getWalletBalance, saveWalletToStorage, createWalletFromMnemonic, generateMnemonic, WalletData } from '../../lib/wallet';

export default function WalletsPageClient() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const storedWallets = getWalletsFromStorage();
        
        // Update balances for existing wallets
        const updatedWallets = await Promise.all(
          storedWallets.map(async (wallet) => {
            try {
              const { balance, balanceUSD } = await getWalletBalance(wallet.address, wallet.network);
              return { ...wallet, balance, balanceUSD };
            } catch (error) {
              return wallet; // Return original if balance fetch fails
            }
          })
        );
        
        setWallets(updatedWallets);
      } catch (error) {
        console.error('Error loading wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWallets();
  }, []);

  const handleCreateWallet = async () => {
    try {
      const mnemonic = generateMnemonic();
      const newWallet = await createWalletFromMnemonic(mnemonic);
      
      // Save to storage
      saveWalletToStorage(newWallet);
      setWallets([...wallets, newWallet]);
      
      // Save mnemonic for this session (in real app, user should backup securely)
      localStorage.setItem('mnemonic', mnemonic);
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Failed to create wallet. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p>Loading wallets...</p>
        </div>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <h2 className="text-2xl font-bold text-primary mb-4">No Wallets Found</h2>
          <p className="text-base text-secondary mb-6">
            Get started by creating your first wallet or importing an existing one.
          </p>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Add Wallet
          </button>
        </div>
      </div>
    );
  }

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
              key={wallet.address}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all var(--transition-normal) ease-in-out',
                border: selectedWallet === wallet.address ? '2px solid var(--purple-500)' : '1px solid var(--border-default)'
              }}
              onClick={() => setSelectedWallet(selectedWallet === wallet.address ? null : wallet.address)}
            >
              {/* Wallet Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'linear-gradient(135deg, var(--purple-500), var(--purple-600))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-inverse)',
                      fontSize: '1.2rem'
                    }}
                  >
                    👛
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
                    {parseFloat(wallet.balance).toFixed(4)} ETH
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
              </div>

              {/* Expanded Details */}
              {selectedWallet === wallet.address && (
                <div 
                  className="fade-in mt-4 pt-4"
                  style={{ borderTop: '1px solid var(--border-default)' }}
                >
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/nft?wallet=${wallet.address}`} className="btn-primary btn-sm" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                      🖼️ NFTs
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
              Choose how you would like to add a wallet to your account.
            </p>
            <div className="space-y-3">
              <button 
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={handleCreateWallet}
              >
                🆕 Create New Wallet
              </button>
              <Link 
                href="/onboarding"
                className="btn-secondary"
                style={{ 
                  width: '100%',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                📥 Import Existing Wallet
              </Link>
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