"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';
import TokenList from '../components/TokenList';

export default function WalletsPageClient() {
  const {
    user,
    wallets,
    password,
    isLoading,
    error,
    unlockWallets,
    lockWallets,
    createNewWallet,
    loadLocalWallets
  } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    // Load local wallets on mount if not authenticated
    if (!user && wallets.length === 0) {
      loadLocalWallets();
    }
  }, [user, wallets.length, loadLocalWallets]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword) {
      await unlockWallets(currentPassword);
    }
  };

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Show local wallets without password if user is not authenticated
  if (!user && wallets.length > 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Your Local Wallets</h2>
            <p className="text-sm text-gray-500 mb-4">
              These wallets are stored locally. Sign up to back them up to the cloud.
            </p>
          </div>
          
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <Card key={wallet.address} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{wallet.name}</h3>
                    <p className="text-sm text-gray-500">{formatAddress(wallet.address)}</p>
                    <p className="text-sm">{wallet.balance} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(wallet.balanceUSD)}</p>
                    <p className="text-sm text-gray-500">{wallet.network}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            onClick={createNewWallet}
            disabled={isLoading}
            className="mt-4 w-full"
          >
            {isLoading ? 'Creating...' : 'Create New Wallet'}
          </Button>
        </Card>
      </div>
    );
  }

  // Render password prompt if wallets are locked (authenticated users)
  if (user && !password) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <form onSubmit={handleUnlock} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Unlock Your Wallets</h2>
            <p className="text-sm text-center text-gray-500">
              Enter your login password to decrypt and view your wallets.
            </p>
            <Input
              type="password"
              placeholder="Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || !currentPassword}
              className="w-full"
            >
              {isLoading ? 'Unlocking...' : 'Unlock Wallets'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Show authenticated user wallets or prompt to create first wallet
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Wallets</h1>
        <div className="flex gap-2">
          <Button 
            onClick={createNewWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </Button>
          {user && (
            <Button 
              onClick={lockWallets}
              variant="ghost"
            >
              Lock Wallets
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="mb-4 p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <div className="grid gap-4">
        {wallets.map((wallet) => (
          <Card key={wallet.address} className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{wallet.name}</h3>
                <p className="text-gray-500">{formatAddress(wallet.address)}</p>
                <p className="text-sm mt-1">{wallet.balance} ETH</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(wallet.balanceUSD)}</p>
                <p className="text-sm text-gray-500">{wallet.network}</p>
              </div>
            </div>
            <TokenList walletId={wallet.address} />
          </Card>
        ))}
        
        {wallets.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No wallets found. Create your first wallet to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
}