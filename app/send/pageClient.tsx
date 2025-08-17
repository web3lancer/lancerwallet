"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { sendTransaction } from '@/lib/wallet';
import { ethers } from 'ethers';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';

export default function SendPageClient() {
  const searchParams = useSearchParams();
  const { wallets, password } = useStore();
  
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  useEffect(() => {
    const defaultWalletAddress = searchParams.get('wallet');
    if (defaultWalletAddress && wallets.some(w => w.address === defaultWalletAddress)) {
      setSelectedWalletAddress(defaultWalletAddress);
    } else if (wallets.length > 0) {
      setSelectedWalletAddress(wallets[0].address);
    }
  }, [wallets, searchParams]);

  const selectedWallet = wallets.find(w => w.address === selectedWalletAddress);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedWallet || !password) {
      setError('Please select a wallet and ensure it is unlocked.');
      return;
    }
    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address.');
      return;
    }
    if (parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(selectedWallet.balance)) {
      setError('Invalid amount or insufficient balance.');
      return;
    }

    setIsLoading(true);
    try {
      const hash = await sendTransaction(
        selectedWallet.privateKey!,
        recipient,
        amount,
        selectedWallet.network
      );
      setTxHash(hash);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!password) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-lg mx-auto p-8">
          <h1 className="text-2xl font-bold mb-2">Wallets Locked</h1>
          <p className="mb-4 text-gray-500">Please unlock your wallets to send transactions.</p>
          <Link href="/wallets">
            <Button>Unlock Wallets</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-lg mx-auto p-8">
          <h1 className="text-2xl font-bold mb-2 text-green-500">Transaction Sent!</h1>
          <p className="mb-4 text-gray-500 break-all">Hash: {txHash}</p>
          <Button onClick={() => setStep('form')}>Send Another</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Send Crypto</h1>
        <p className="text-gray-500">Transfer cryptocurrency securely.</p>
      </header>
      <Card className="p-6">
        <form onSubmit={handleSend} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div>
            <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Wallet</label>
            <select
              id="wallet"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"
              value={selectedWalletAddress}
              onChange={(e) => setSelectedWalletAddress(e.target.value)}
            >
              {wallets.map(w => (
                <option key={w.address} value={w.address}>
                  {w.name} ({parseFloat(w.balance).toFixed(4)} ETH)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipient Address</label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (ETH)</label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Transaction'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
