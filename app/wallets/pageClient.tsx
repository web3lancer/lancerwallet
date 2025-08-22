"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import Card from '@/app/components/ui/Card';
import TokenList from '../components/TokenList';
import Button from '../components/ui/Button';
import { useRouter } from 'next/navigation';

export default function WalletsPageClient() {
  const { activeWallet, isLoading, error, isAuthenticated } = useStore();
  const router = useRouter();

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatCurrency = (amount: number | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  // If the page is loading, or if the user is authenticated but the wallet hasn't been loaded yet.
  if (isLoading || (isAuthenticated && !activeWallet)) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading your wallet...</p>
      </div>
    );
  }

  // If the user is not authenticated, prompt them to go to the auth page.
  if (!isAuthenticated) {
    return (
        <div className="container mx-auto p-4 max-w-md">
            <Card className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Please Log In</h2>
                <p className="text-gray-500 mb-6">
                    You need to be logged in to view your wallet.
                </p>
                <Button onClick={() => router.push('/auth')}>Go to Login</Button>
            </Card>
        </div>
    );
  }

  // If there is an error message in the store.
  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Card className="p-8 text-center bg-red-50 border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-700">An Error Occurred</h2>
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  // If the user is authenticated but there is no active wallet for some reason.
  if (!activeWallet) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="p-8">
            <h2 className="text-xl font-bold mb-4">No Wallet Found</h2>
            <p className="text-gray-500">
                We couldn&apos;t find an active wallet for your account. Please try logging out and back in.
            </p>
        </Card>
      </div>
    );
  }

  // Main view: Display the single active wallet.
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Wallet</h1>
      </div>

      <div className="grid gap-4">
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{activeWallet.name}</h3>
              <p className="text-gray-500">{formatAddress(activeWallet.address)}</p>
              <p className="text-sm mt-1">{activeWallet.balance || '0.00'} ETH</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{formatCurrency(activeWallet.balanceUSD)}</p>
              <p className="text-sm text-gray-500">{activeWallet.network}</p>
            </div>
          </div>
          <TokenList walletId={activeWallet.address} />
        </Card>
      </div>
    </div>
  );
}