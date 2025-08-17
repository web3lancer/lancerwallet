"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';

export default function WalletsPageClient() {
  const {
    wallets,
    password,
    isLoading,
    error,
    unlockWallets,
    lockWallets,
    createNewWallet
  } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword) {
      await unlockWallets(currentPassword);
    }
  };

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Render password prompt if wallets are locked
  if (!password) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <form onSubmit={handleUnlock} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Unlock Your Wallets</h2>
            <p className="text-sm text-center text-gray-500">
              Enter your login password to decrypt and view your wallets.
            </p>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Input
              type="password"
              placeholder="Enter your password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Unlocking...' : 'Unlock Wallets'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Render loading state while creating/fetching wallets
  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const totalPortfolioValue = wallets.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wallets</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={createNewWallet} disabled={isLoading}>
            {isLoading ? 'Creating...' : '➕ Create New Wallet'}
          </Button>
          <Button onClick={lockWallets} variant="secondary">
            🔒 Lock Wallets
          </Button>
        </div>
      </header>

      {wallets.length === 0 ? (
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">No Wallets Yet</h2>
          <p className="mb-4">Click &quot;Create New Wallet&quot; to get started.</p>
        </Card>
      ) : (
        <>
          <Card className="mb-8 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Portfolio Value</p>
            <h2 className="text-4xl font-bold">{formatCurrency(totalPortfolioValue)}</h2>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.address} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{wallet.name}</h3>
                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {wallet.network}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono mb-4">{formatAddress(wallet.address)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatCurrency(wallet.balanceUSD)}</p>
                  <p className="text-sm text-gray-500">{parseFloat(wallet.balance).toFixed(5)} ETH</p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}