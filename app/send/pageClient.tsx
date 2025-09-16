"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { sendTransaction } from '@/lib/wallet';
import { ethers } from 'ethers';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';
import UnlockModal from '@/app/components/UnlockModal';
import { createTransactionAction } from './actions';
import { ID } from 'appwrite';

export default function SendPageClient() {
  const { activeWallet, isLocked, user } = useStore();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showUnlock, setShowUnlock] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeWallet || isLocked) {
      setError('Please unlock your wallet first.');
      setShowUnlock(true);
      return;
    }
    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address.');
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    setIsLoading(true);
    try {
      const hash = await sendTransaction(
        activeWallet.privateKey!,
        recipient,
        amount,
        activeWallet.network
      );
      setTxHash(hash);

      if (user) {
        await createTransactionAction({
          transactionId: ID.unique(),
          userId: user.$id,
          walletId: activeWallet.address,
          hash,
          fromAddress: activeWallet.address,
          toAddress: recipient,
          value: amount,
          network: activeWallet.network,
          status: 'completed',
          type: 'send',
          timestamp: new Date().toISOString(),
          notes: '',
        });
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLocked || !activeWallet) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-lg mx-auto p-8">
          <h1 className="text-2xl font-bold mb-2">Wallet Locked</h1>
          <p className="mb-4 text-gray-500">Unlock your wallet to send transactions.</p>
          <Button onClick={() => setShowUnlock(true)}>Unlock Wallet</Button>
        </Card>
        <UnlockModal isOpen={showUnlock} onClose={() => setShowUnlock(false)} />
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Wallet</label>
            <Input
              type="text"
              value={`${activeWallet.name} (${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)})`}
              disabled
            />
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
      <UnlockModal isOpen={showUnlock} onClose={() => setShowUnlock(false)} />
    </div>
  );
}
