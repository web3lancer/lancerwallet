"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';

export default function HomePage() {
  const { user, wallets, password } = useStore();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (!password) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-lg mx-auto p-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name || 'User'}!</h1>
          <p className="mb-4 text-gray-500">Your wallets are currently locked.</p>
          <Link href="/wallets">
            <Button>Unlock Wallets</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalPortfolioValue = wallets.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);

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
          <p className="text-4xl font-bold">{wallets.length}</p>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 flex flex-col justify-center items-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Quick Actions</h2>
          <div className="flex space-x-4">
            <Link href="/send">
              <Button>⬆️ Send</Button>
            </Link>
            <Link href="/wallets">
              <Button variant="secondary">👛 Wallets</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Wallets List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Wallets</h2>
        {wallets.length > 0 ? (
          <Card className="p-4">
            <ul>
              {wallets.slice(0, 5).map(wallet => (
                <li key={wallet.address} className="flex justify-between items-center p-2 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold">{wallet.name}</p>
                    <p className="text-sm text-gray-500 font-mono">{`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(wallet.balanceUSD)}</p>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="text-center p-8">
            <p>No wallets found. Go to the Wallets page to create one.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
