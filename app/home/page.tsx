"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import UnlockModal from '@/app/components/UnlockModal';

export default function HomePage() {
  const { user, activeWallet, isLocked } = useStore();
  const [showUnlock, setShowUnlock] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Locked or no wallet state
  if (isLocked || !activeWallet) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-lg mx-auto p-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name || 'User'}!</h1>
          <p className="mb-4 text-gray-500">
            {isLocked ? 'Your wallet is currently locked.' : 'No wallet found. Create or restore one to continue.'}
          </p>
          <div className="flex gap-3 justify-center">
            {isLocked ? (
              <Button onClick={() => setShowUnlock(true)}>Unlock Wallet</Button>
            ) : (
              <>
                <Link href="/onboarding">
                  <Button>Create/Restore</Button>
                </Link>
                <Link href="/wallets">
                  <Button variant="secondary">View Wallet</Button>
                </Link>
              </>
            )}
          </div>
        </Card>
        <UnlockModal isOpen={showUnlock} onClose={() => setShowUnlock(false)} />
      </div>
    );
  }

  const totalPortfolioValue = activeWallet.balanceUSD || 0;

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name || 'User'}!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Portfolio Value */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Portfolio Value</h2>
          <p className="text-4xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
        </Card>

        {/* Wallet Count */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Wallets</h2>
          <p className="text-4xl font-bold">{activeWallet ? 1 : 0}</p>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 flex flex-col justify-center items-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Quick Actions</h2>
          <div className="flex space-x-4">
            <Link href="/send">
              <Button>⬆️ Send</Button>
            </Link>
            <Link href="/wallets">
              <Button variant="secondary">👜 Wallet</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Active Wallet Summary */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Wallet</h2>
        <Card className="p-4">
          <ul>
            <li className="flex justify-between items-center p-2">
              <div>
                <p className="font-semibold">{activeWallet.name}</p>
                <p className="text-sm text-gray-500 font-mono">{`${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}`}</p>
              </div>
              <p className="font-semibold">{formatCurrency(activeWallet.balanceUSD || 0)}</p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
