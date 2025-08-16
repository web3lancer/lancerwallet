"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getWalletsFromStorage, sendTransaction, WalletData } from '../../lib/wallet';
import { ethers } from 'ethers';

export default function SendPageClient() {
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get('wallet');
  
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'review' | 'sending' | 'success'>('form');
  const [txHash, setTxHash] = useState<string>('');

  useEffect(() => {
    const loadWallets = () => {
      const storedWallets = getWalletsFromStorage();
      setWallets(storedWallets);
      
      // Set default wallet if provided in URL
      if (walletAddress) {
        const wallet = storedWallets.find(w => w.address === walletAddress);
        if (wallet) {
          setSelectedWallet(wallet.address);
        }
      } else if (storedWallets.length > 0) {
        setSelectedWallet(storedWallets[0].address);
      }
    };

    loadWallets();
  }, [walletAddress]);

  const currentWallet = wallets.find(w => w.address === selectedWallet);
  const estimatedGasFee = 0.0015; // ETH
  const ethPrice = 2400; // TODO: Fetch from API
  const estimatedGasFeeUSD = estimatedGasFee * ethPrice;

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!ethers.isAddress(recipient)) {
      newErrors.recipient = 'Invalid Ethereum address format';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (currentWallet && parseFloat(amount) > parseFloat(currentWallet.balance)) {
      newErrors.amount = 'Insufficient balance';
    }

    if (!selectedWallet) {
      newErrors.wallet = 'Please select a wallet';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;
    setStep('review');
  };

  const confirmSend = async () => {
    if (!currentWallet?.privateKey) {
      setErrors({ general: 'Private key not found for this wallet' });
      return;
    }

    setStep('sending');
    setIsLoading(true);

    try {
      const hash = await sendTransaction(
        currentWallet.privateKey,
        recipient,
        amount,
        currentWallet.network
      );
      
      setTxHash(hash);
      setStep('success');
    } catch (error) {
      console.error('Transaction failed:', error);
      setErrors({ general: 'Transaction failed. Please try again.' });
      setStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <h2 className="text-2xl font-bold text-primary mb-4">No Wallets Found</h2>
          <p className="text-base text-secondary mb-6">
            You need to create or import a wallet before you can send transactions.
          </p>
          <Link href="/onboarding" className="btn-primary">
            Create Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/home" 
            className="btn-ghost btn-sm"
            style={{ padding: 'var(--space-2)' }}
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Send Crypto
            </h1>
            <p className="text-base text-secondary">
              Transfer cryptocurrency securely
            </p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {['form', 'review', 'sending', 'success'].map((s, index) => (
              <React.Fragment key={s}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: step === s || (['review', 'sending', 'success'].includes(step) && index < (['form', 'review', 'sending', 'success'].indexOf(step) + 1)) 
                      ? 'var(--purple-500)' 
                      : 'var(--surface-pressed)',
                    color: step === s || (['review', 'sending', 'success'].includes(step) && index < (['form', 'review', 'sending', 'success'].indexOf(step) + 1)) 
                      ? 'var(--text-inverse)' 
                      : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div 
                    style={{
                      width: '24px',
                      height: '2px',
                      background: (['review', 'sending', 'success'].includes(step) && index < (['form', 'review', 'sending', 'success'].indexOf(step))) 
                        ? 'var(--purple-500)' 
                        : 'var(--surface-pressed)'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Error Display */}
      {errors.general && (
        <div 
          className="mb-6 p-4 rounded-md"
          style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            color: 'var(--error)'
          }}
        >
          <p>{errors.general}</p>
        </div>
      )}

      {/* Step 1: Form */}
      {step === 'form' && (
        <div className="card fade-in">
          <h3 className="text-xl font-semibold text-primary mb-6">
            Send Transaction
          </h3>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="space-y-6">
            {/* Wallet Selection */}
            <div>
              <label className="text-sm font-medium text-secondary mb-2 block">
                From Wallet
              </label>
              <select 
                className="input"
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                {wallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.name} ({formatAddress(wallet.address)}) - {parseFloat(wallet.balance).toFixed(4)} ETH
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient */}
            <div>
              <label className="text-sm font-medium text-secondary mb-2 block">
                To Address
              </label>
              <input
                type="text"
                className={`input ${errors.recipient ? 'input-error' : ''}`}
                placeholder="0x..."
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  if (errors.recipient) {
                    setErrors(prev => ({ ...prev, recipient: '' }));
                  }
                }}
              />
              {errors.recipient && (
                <p className="text-sm text-error mt-1">{errors.recipient}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-secondary mb-2 block">
                Amount (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  className={`input ${errors.amount ? 'input-error' : ''}`}
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) {
                      setErrors(prev => ({ ...prev, amount: '' }));
                    }
                  }}
                />
                {currentWallet && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-purple-500"
                    onClick={() => setAmount(currentWallet.balance)}
                  >
                    Max
                  </button>
                )}
              </div>
              {errors.amount && (
                <p className="text-sm text-error mt-1">{errors.amount}</p>
              )}
              {currentWallet && (
                <p className="text-xs text-tertiary mt-1">
                  Available: {parseFloat(currentWallet.balance).toFixed(6)} ETH
                </p>
              )}
            </div>

            {/* Memo */}
            <div>
              <label className="text-sm font-medium text-secondary mb-2 block">
                Memo (Optional)
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Add a note for this transaction..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Gas Estimate */}
            <div 
              className="p-4 rounded-md"
              style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-default)' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Estimated Gas Fee:</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-primary">
                    {estimatedGasFee} ETH
                  </span>
                  <p className="text-xs text-tertiary">
                    ≈ {formatCurrency(estimatedGasFeeUSD)}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? 'Preparing...' : 'Review Transaction'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 'review' && (
        <div className="card fade-in">
          <h3 className="text-xl font-semibold text-primary mb-6">
            Review Transaction
          </h3>
          
          <div className="space-y-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-secondary">From:</span>
                <span className="text-primary font-medium">
                  {currentWallet?.name} ({formatAddress(currentWallet?.address || '')})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">To:</span>
                <span className="text-primary font-medium font-mono">
                  {formatAddress(recipient)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Amount:</span>
                <span className="text-primary font-medium">
                  {amount} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Gas Fee:</span>
                <span className="text-primary font-medium">
                  {estimatedGasFee} ETH
                </span>
              </div>
              <div 
                className="flex justify-between pt-4"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <span className="text-secondary font-medium">Total:</span>
                <span className="text-primary font-semibold">
                  {(parseFloat(amount) + estimatedGasFee).toFixed(6)} ETH
                </span>
              </div>
            </div>

            {memo && (
              <div>
                <span className="text-secondary">Memo:</span>
                <p className="text-primary mt-1">{memo}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                className="btn-secondary"
                onClick={() => setStep('form')}
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button 
                className="btn-primary"
                onClick={confirmSend}
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Sending */}
      {step === 'sending' && (
        <div className="card fade-in text-center">
          <div className="mb-6">
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'conic-gradient(var(--purple-500), var(--purple-600), var(--purple-500))',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'spin 1s linear infinite'
              }}
            >
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                📤
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            Sending Transaction...
          </h3>
          <p className="text-base text-secondary">
            Please wait while your transaction is processed on the blockchain.
          </p>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <div className="card fade-in text-center">
          <div className="mb-6">
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--success)',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white'
              }}
            >
              ✅
            </div>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            Transaction Sent!
          </h3>
          <p className="text-base text-secondary mb-6">
            Your transaction has been broadcast to the blockchain.
          </p>
          
          {txHash && (
            <div className="mb-6 p-4 rounded-md" style={{ background: 'var(--surface-hover)' }}>
              <p className="text-sm text-secondary mb-2">Transaction Hash:</p>
              <p className="text-sm font-mono text-primary break-all">{txHash}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/home" className="btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
              Back to Home
            </Link>
            <button 
              className="btn-primary"
              onClick={() => {
                setStep('form');
                setRecipient('');
                setAmount('');
                setMemo('');
                setTxHash('');
                setErrors({});
              }}
              style={{ flex: 1 }}
            >
              Send Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}