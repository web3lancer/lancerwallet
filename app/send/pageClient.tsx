"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Token {
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  icon: string;
  decimals: number;
}

interface Wallet {
  id: string;
  name: string;
  address: string;
  tokens: Token[];

}

export default function SendPageClient() {
  const searchParams = useSearchParams();
  const walletId = searchParams.get('wallet');
  
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string>('ETH');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'review' | 'sending' | 'success'>('form');

  // Mock wallet and token data
  const wallets: Wallet[] = useMemo(() => [
    {
      id: '1',
      name: 'Main Wallet',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      tokens: [
        { symbol: 'ETH', name: 'Ethereum', balance: 2.45, valueUSD: 8420.50, icon: '⟠', decimals: 18 },
        { symbol: 'USDC', name: 'USD Coin', balance: 1500.00, valueUSD: 1500.00, icon: '💵', decimals: 6 },
        { symbol: 'UNI', name: 'Uniswap', balance: 145.20, valueUSD: 726.00, icon: '🦄', decimals: 18 }
      ]
    },
    {
      id: '2',
      name: 'Trading Wallet',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      tokens: [
        { symbol: 'ETH', name: 'Ethereum', balance: 0.85, valueUSD: 2923.75, icon: '⟠', decimals: 18 },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 0.012, valueUSD: 520.00, icon: '₿', decimals: 8 }
      ]
    }
   ], []);


  useEffect(() => {
    if (walletId && wallets.find(w => w.id === walletId)) {
      setSelectedWallet(walletId);
    } else if (wallets.length > 0) {
      setSelectedWallet(wallets[0].id);
    }
  }, [walletId, wallets]);

  const currentWallet = wallets.find(w => w.id === selectedWallet);
  const currentToken = currentWallet?.tokens.find(t => t.symbol === selectedToken);
  const estimatedGasFee = 0.0015; // ETH
  const estimatedGasFeeUSD = estimatedGasFee * 3440; // Mock ETH price

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
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      newErrors.recipient = 'Invalid Ethereum address format';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (currentToken && parseFloat(amount) > currentToken.balance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setStep('review');
  };

  const confirmSend = async () => {
    setStep('sending');
    setIsLoading(true);

    // Simulate sending transaction
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 3000);
  };

  const resetForm = () => {
    setRecipient('');
    setAmount('');
    setMemo('');
    setErrors({});
    setStep('form');
  };

  if (step === 'success') {
    return (
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="max-w-md mx-auto text-center">
          <div 
            className="bounce mb-6"
            style={{ fontSize: '4rem' }}
          >
            ✅
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4">
            Transaction Sent!
          </h1>
          <p className="text-base text-secondary mb-6">
            Your transaction has been submitted to the network and is being processed.
          </p>
          
          <div className="card mb-6 text-left">
            <h3 className="text-lg font-semibold text-primary mb-4">Transaction Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary">Amount:</span>
                <span className="text-primary font-medium">{amount} {selectedToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">To:</span>
                <span className="text-primary font-mono text-sm">{formatAddress(recipient)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Gas Fee:</span>
                <span className="text-primary">{estimatedGasFee} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Network:</span>
                <span className="text-primary">Ethereum</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              className="btn-primary"
              onClick={resetForm}
              style={{ flex: 1 }}
            >
              Send Another
            </button>
            <Link 
              href="/home" 
              className="btn-secondary"
              style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sending') {
    return (
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="max-w-md mx-auto text-center">
          <div 
            className="animate-spin mb-6"
            style={{ 
              fontSize: '3rem',
              animation: 'spin 2s linear infinite'
            }}
          >
            ⟳
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4">
            Sending Transaction...
          </h1>
          <p className="text-base text-secondary mb-6">
            Please wait while we process your transaction on the blockchain.
          </p>
          
          <div className="card">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-sm">Transaction created</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
                <span className="text-sm">Broadcasting to network...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-neutral opacity-30"></div>
                <span className="text-sm text-secondary">Waiting for confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <header className="flex items-center gap-4 mb-6">
          <button 
            className="btn-ghost"
            onClick={() => setStep('form')}
            style={{ padding: 'var(--space-2)' }}
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">Review Transaction</h1>
        </header>

        <div className="max-w-md mx-auto">
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Transaction Summary</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-secondary">From Wallet</label>
                <div className="mt-1 p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                  <p className="font-medium text-primary">{currentWallet?.name}</p>
                  <p className="text-sm text-secondary font-mono">{formatAddress(currentWallet?.address || '')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary">To Address</label>
                <div className="mt-1 p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                  <p className="font-mono text-sm text-primary">{recipient}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary">Amount</label>
                <div className="mt-1 p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentToken?.icon}</span>
                    <span className="font-medium text-primary">{amount} {selectedToken}</span>
                  </div>
                  <p className="text-sm text-secondary">
                    ≈ {formatCurrency((parseFloat(amount) || 0) * (currentToken?.valueUSD || 0) / (currentToken?.balance || 1))}
                  </p>
                </div>
              </div>

              {memo && (
                <div>
                  <label className="text-sm text-secondary">Memo</label>
                  <div className="mt-1 p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                    <p className="text-sm text-primary">{memo}</p>
                  </div>
                </div>
              )}

              <div 
                className="p-3 rounded-md"
                style={{ 
                  background: 'rgba(255, 152, 0, 0.1)',
                  border: '1px solid rgba(255, 152, 0, 0.2)'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--warning)' }}>Estimated Gas Fee</span>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
                      {estimatedGasFee} ETH
                    </p>
                    <p className="text-xs" style={{ color: 'var(--warning)', opacity: 0.8 }}>
                      ≈ {formatCurrency(estimatedGasFeeUSD)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              className="btn-secondary"
              onClick={() => setStep('form')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={confirmSend}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? 'Sending...' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Send Crypto
        </h1>
        <p className="text-base text-secondary">
          Transfer cryptocurrency to another wallet address
        </p>
      </header>

      <div className="max-w-md mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="space-y-6">
          {/* Wallet Selection */}
          <div className="input-group">
            <label className="input-label">From Wallet</label>
            <select 
              className="input"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({formatAddress(wallet.address)})
                </option>
              ))}
            </select>
          </div>

          {/* Token Selection */}
          <div className="input-group">
            <label className="input-label">Token</label>
            <select 
              className="input"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              {currentWallet?.tokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol} - {token.balance.toFixed(4)} available
                </option>
              ))}
            </select>
            {currentToken && (
              <p className="text-xs text-tertiary mt-1">
                Balance: {currentToken.balance.toFixed(4)} {currentToken.symbol} 
                (≈ {formatCurrency(currentToken.valueUSD)})
              </p>
            )}
          </div>

          {/* Recipient Address */}
          <div className="input-group">
            <label className="input-label">Recipient Address</label>
            <input
              type="text"
              className={`input ${errors.recipient ? 'input-error' : ''}`}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-sm)'
              }}
            />
            {errors.recipient && (
              <p className="input-error">{errors.recipient}</p>
            )}
          </div>

          {/* Amount */}
          <div className="input-group">
            <div className="flex justify-between items-center">
              <label className="input-label">Amount</label>
              {currentToken && (
                <button
                  type="button"
                  className="text-xs font-medium"
                  style={{ color: 'var(--purple-500)' }}
                  onClick={() => setAmount(currentToken.balance.toString())}
                >
                  Max: {currentToken.balance.toFixed(4)}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                className={`input ${errors.amount ? 'input-error' : ''}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="any"
                min="0"
              />
              <div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2"
                style={{ pointerEvents: 'none' }}
              >
                <span className="text-lg">{currentToken?.icon}</span>
                <span className="text-sm font-medium text-secondary">{selectedToken}</span>
              </div>
            </div>
            {errors.amount && (
              <p className="input-error">{errors.amount}</p>
            )}
            {amount && currentToken && (
              <p className="text-xs text-tertiary mt-1">
                ≈ {formatCurrency((parseFloat(amount) || 0) * currentToken.valueUSD / currentToken.balance)}
              </p>
            )}
          </div>

          {/* Memo (Optional) */}
          <div className="input-group">
            <label className="input-label">Memo (Optional)</label>
            <textarea
              className="input"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a note for this transaction..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Gas Fee Estimate */}
          <div 
            className="p-4 rounded-md"
            style={{ 
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary">Estimated Gas Fee</span>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">
                  {estimatedGasFee} ETH
                </p>
                <p className="text-xs text-secondary">
                  ≈ {formatCurrency(estimatedGasFeeUSD)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="btn-primary"
            disabled={isLoading || !recipient || !amount}
            style={{ width: '100%' }}
          >
            {isLoading ? 'Processing...' : 'Review Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
