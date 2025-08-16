"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getWalletsFromStorage, WalletData } from '../../lib/wallet';

interface NFTItem {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  contractAddress: string;
  tokenId: string;
}

export default function NFTPageClient() {
  const searchParams = useSearchParams();
  const walletParam = searchParams.get('wallet');
  
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallets = () => {
      const storedWallets = getWalletsFromStorage();
      setWallets(storedWallets);
      
      if (walletParam) {
        const wallet = storedWallets.find(w => w.address === walletParam);
        if (wallet) {
          setSelectedWallet(wallet.address);
        }
      } else if (storedWallets.length > 0) {
        setSelectedWallet(storedWallets[0].address);
      }
    };

    loadWallets();
  }, [walletParam]);

  useEffect(() => {
    const loadNFTs = async () => {
      if (!selectedWallet) {
        setLoading(false);
        return;
      }

      try {
        // Load NFTs from storage or API
        const storedNFTs = JSON.parse(localStorage.getItem(`nfts_${selectedWallet}`) || '[]');
        setNfts(storedNFTs);
      } catch (error) {
        console.error('Error loading NFTs:', error);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [selectedWallet]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p>Loading NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          NFT Gallery
        </h1>
        <p className="text-base text-secondary">
          View and manage your NFT collection
        </p>
      </header>

      {/* Wallet Selector */}
      {wallets.length > 1 && (
        <section className="mb-8">
          <div className="card">
            <label className="text-sm font-medium text-secondary mb-2 block">
              Select Wallet
            </label>
            <select
              className="input"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
            >
              {wallets.map((wallet) => (
                <option key={wallet.address} value={wallet.address}>
                  {wallet.name} ({formatAddress(wallet.address)})
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* NFTs Grid */}
      <section>
        {nfts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="card"
                style={{
                  transition: 'all var(--transition-normal) ease-in-out',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-2)';
                }}
              >
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-surface-hover">
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-primary mb-1">
                    {nft.name}
                  </h3>
                  <p className="text-sm text-secondary mb-2">
                    {nft.collection}
                  </p>
                  <p className="text-xs text-tertiary">
                    Token ID: {nft.tokenId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
            <div className="text-6xl mb-6">🖼️</div>
            <h2 className="text-2xl font-bold text-primary mb-4">
              No NFTs Found
            </h2>
            <p className="text-base text-secondary mb-6">
              {selectedWallet 
                ? "This wallet doesn't contain any NFTs yet."
                : "Connect a wallet to view your NFT collection."}
            </p>
            {selectedWallet && (
              <p className="text-sm text-tertiary">
                NFTs will automatically appear here when you receive them
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}