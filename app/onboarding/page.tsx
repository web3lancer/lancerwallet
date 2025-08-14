"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState('');
  const [restoredAddress, setRestoredAddress] = useState<string | null>(null);
  const [inputMnemonic, setInputMnemonic] = useState('');

  const startCreate = async () => {
    const { generateMnemonic } = await import('bip39');
    const m = generateMnemonic(256); // 24 words
    setMnemonic(m);
    setStep(1);
  };

  const proceedToVerify = () => setStep(2);

  const verify = (value: string) => {
    if (value.trim() === mnemonic.trim()) setStep(3);
    else alert('Seed phrase does not match.');
  };

  const complete = async () => {
    // derive a wallet address using ethers from mnemonic (lazy-loaded)
    const { Wallet } = await import('ethers');
    // ethers' Wallet may be a namespace; use bracket access to avoid any cast
    // dynamic import typing mismatch - access defensive
    const walletAny = (Wallet as unknown) as { fromPhrase?: (m: string) => { address: string }; Wallet?: { fromPhrase: (m: string) => { address: string } } };
    const wallet = walletAny?.fromPhrase ? walletAny.fromPhrase(mnemonic) : walletAny?.Wallet ? walletAny.Wallet.fromPhrase(mnemonic) : null;
    if (!wallet) throw new Error('Could not derive wallet');
    // In a real app you'd persist keys securely (e.g., encrypted storage)
    setRestoredAddress(wallet.address);
    setStep(4);
  };

  const startRestore = () => setStep(10);

  const restore = async () => {
    try {
      const { validateMnemonic } = await import('bip39');
      const { Wallet } = await import('ethers');
      if (!validateMnemonic(inputMnemonic)) throw new Error("Invalid mnemonic");
      // dynamic import typing mismatch - access defensive
const walletAny = (Wallet as unknown) as { fromPhrase?: (m: string) => { address: string }; Wallet?: { fromPhrase: (m: string) => { address: string } } };
      const wallet = walletAny?.fromPhrase ? walletAny.fromPhrase(inputMnemonic) : walletAny?.Wallet ? walletAny.Wallet.fromPhrase(inputMnemonic) : null;
      if (!wallet) throw new Error('Could not derive wallet');
      setRestoredAddress(wallet.address);
      setStep(11);
    } catch (err) {
      // keep simple UX-level feedback and log for debug
      console.warn('restore mnemonic error', err);
      alert("Invalid mnemonic");
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center fade-in"
      style={{
        padding: 'var(--space-6)',
        background: 'var(--bg-primary)'
      }}
    >
      <div 
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-2xl)'
        }}
      >
        <div 
          className="flex justify-center"
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <Logo size={72} />
        </div>
        
        {step === 0 && (
          <div className="text-center">
            <h2 
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)'
              }}
            >
              Welcome to LancerWallet
            </h2>
            <p 
              style={{
                fontSize: '16px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-6)'
              }}
            >
              Create a new wallet or restore an existing one to get started.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={startCreate} className="btn-primary">
                Create new wallet
              </button>
              <button onClick={startRestore} className="btn-secondary">
                Restore existing wallet
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Your seed phrase
            </h3>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)'
              }}
            >
              Write this down and store it safely. This is the only way to recover your wallet.
            </p>
            <div 
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              {mnemonic}
            </div>
            <div className="flex gap-4 flex-wrap">
              <button onClick={proceedToVerify} className="btn-primary">
                I've saved it securely
              </button>
              <button onClick={() => setStep(0)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Verify your seed phrase
            </h3>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)'
              }}
            >
              Type your seed phrase to confirm you backed it up correctly.
            </p>
            <textarea 
              value={inputMnemonic} 
              onChange={(e) => setInputMnemonic(e.target.value)} 
              className="input"
              style={{
                width: '100%',
                marginBottom: 'var(--space-4)',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'var(--font-mono)'
              }}
              rows={3}
              placeholder="Enter your seed phrase..."
            />
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => verify(inputMnemonic)} className="btn-primary">
                Verify
              </button>
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Generate wallet
            </h3>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)'
              }}
            >
              We'll now derive your wallet address from your seed phrase.
            </p>
            <div className="flex gap-4">
              <button onClick={complete} className="btn-primary">
                Generate wallet
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <div 
              style={{
                fontSize: '48px',
                marginBottom: 'var(--space-4)'
              }}
            >
              ✅
            </div>
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Wallet created successfully!
            </h3>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Your wallet address:
            </p>
            <div 
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}
            >
              {restoredAddress}
            </div>
            <Link href="/home" className="btn-primary" style={{ textDecoration: 'none' }}>
              Go to dashboard
            </Link>
          </div>
        )}

        {step === 10 && (
          <div>
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Restore wallet
            </h3>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)'
              }}
            >
              Enter your seed phrase to restore your existing wallet.
            </p>
            <textarea 
              value={inputMnemonic} 
              onChange={(e) => setInputMnemonic(e.target.value)} 
              className="input"
              style={{
                width: '100%',
                marginBottom: 'var(--space-4)',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'var(--font-mono)'
              }}
              rows={3}
              placeholder="Enter your seed phrase..."
            />
            <div className="flex gap-4 flex-wrap">
              <button onClick={restore} className="btn-primary">
                Restore wallet
              </button>
              <button onClick={() => setStep(0)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 11 && (
          <div className="text-center">
            <div 
              style={{
                fontSize: '48px',
                marginBottom: 'var(--space-4)'
              }}
            >
              🎉
            </div>
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Wallet restored successfully!
            </h3>
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)'
              }}
            >
              Restored wallet address:
            </p>
            <div 
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}
            >
              {restoredAddress}
            </div>
            <Link href="/home" className="btn-primary" style={{ textDecoration: 'none' }}>
              Go to dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
