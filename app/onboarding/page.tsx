"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import { generateMnemonic, validateMnemonic, createWalletFromMnemonic, saveWalletToLocal } from '../../lib/wallet';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState('');
  const [restoredAddress, setRestoredAddress] = useState<string | null>(null);
  const [inputMnemonic, setInputMnemonic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCreate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newMnemonic = generateMnemonic();
      setMnemonic(newMnemonic);
      setStep(1);
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      setError('Failed to generate seed phrase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToVerify = () => setStep(2);

  const verify = (value: string) => {
    if (value.trim() === mnemonic.trim()) {
      setStep(3);
    } else {
      setError('Seed phrase does not match. Please try again.');
    }
  };

  const complete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = await createWalletFromMnemonic(mnemonic);
      // Save wallet locally (auth is optional)
      saveWalletToLocal(wallet);
      
      // Save mnemonic to localStorage for this session
      localStorage.setItem('mnemonic', mnemonic);
      
      setRestoredAddress(wallet.address);
      setStep(4);
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError('Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRestore = () => {
    setStep(10);
    setError(null);
  };

  const restore = async () => {
    if (!inputMnemonic.trim()) {
      setError('Please enter a seed phrase');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!validateMnemonic(inputMnemonic)) {
        throw new Error("Invalid mnemonic");
      }
      
      const wallet = await createWalletFromMnemonic(inputMnemonic);
      // Save wallet locally (auth is optional)
      saveWalletToLocal(wallet);
      
      // Save mnemonic to localStorage for this session
      localStorage.setItem('mnemonic', inputMnemonic);
      
      setRestoredAddress(wallet.address);
      setStep(11);
    } catch (err) {
      console.error('restore mnemonic error', err);
      setError("Invalid seed phrase. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Progress indicator for create wallet flow
  const getCreateProgress = () => {
    if (step === 1) return 33;
    if (step === 2) return 66;
    if (step === 3) return 100;
    return 0;
  };

  // Step titles for better UX
  const getStepTitle = () => {
    switch (step) {
      case 0: return 'Getting Started';
      case 1: return 'Step 1: Save Your Seed Phrase';
      case 2: return 'Step 2: Verify Seed Phrase';
      case 3: return 'Step 3: Create Wallet';
      case 4: return 'Wallet Created!';
      case 10: return 'Restore Existing Wallet';
      case 11: return 'Wallet Restored!';
      default: return '';
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center fade-in"
      style={{
        padding: 'var(--space-6)',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        position: 'relative'
      }}
    >
      {/* Background decoration */}
      <div 
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(124, 90, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(124, 90, 255, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      <div 
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-4)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header with logo and progress */}
        <header 
          className="text-center"
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <div 
            className="flex justify-center items-center gap-3"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <Logo size={56} />
            <h1 className="text-2xl font-bold text-primary">LancerWallet</h1>
          </div>
          
          {/* Progress indicator for create wallet flow */}
          {(step >= 1 && step <= 3) && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div 
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--surface-pressed)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    width: `${getCreateProgress()}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--purple-500), var(--purple-600))',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-slow) ease-in-out'
                  }}
                />
              </div>
              <p className="text-sm text-secondary mt-2">
                Step {step} of 3
              </p>
            </div>
          )}
          
          <h2 className="text-xl font-semibold text-primary">
            {getStepTitle()}
          </h2>
          
          {/* Error Display */}
          {error && (
            <div 
              className="mt-4 p-3 rounded-md"
              style={{
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                color: 'var(--error)'
              }}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}
        </header>
        
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center fade-in">
            <p className="text-base text-secondary mb-8">
              Create a new wallet or restore an existing one to get started with secure crypto management.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
  <button 
    onClick={startCreate} 
    className="btn-primary"
    disabled={isLoading}
    style={{ minWidth: '160px' }}
  >
    {isLoading ? '⏳ Creating...' : '🆕 Create New Wallet'}
  </button>
  <button 
    onClick={startRestore} 
    className="btn-secondary"
    style={{ minWidth: '160px' }}
  >
    🔄 Restore Existing Wallet
  </button>
  <button
    onClick={() => window.location.href = '/auth'}
    className="btn-ghost"
    style={{ minWidth: '160px' }}
  >
    ✉️ Continue with Email
  </button>
</div>
          </div>
        )}

        {/* Step 1: Show seed phrase */}
        {step === 1 && (
          <div className="fade-in">
            <div 
              className="p-4 mb-6"
              style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--warning)'
              }}
            >
              <p className="text-sm font-medium">
                ⚠️ Important: Write this down and store it safely. This is the only way to recover your wallet.
              </p>
            </div>
            
            <div 
              className="p-6 mb-6"
              style={{
                background: 'var(--surface-hover)',
                border: '2px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: '1.8',
                wordSpacing: '8px',
                letterSpacing: '0.5px'
              }}
            >
              {mnemonic}
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button 
                onClick={proceedToVerify} 
                className="btn-primary"
                style={{ flex: 1 }}
              >
                ✅ I&apos;ve Saved It Securely
              </button>
              <button 
                onClick={() => setStep(0)} 
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                ← Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verify seed phrase */}
        {step === 2 && (
          <div className="fade-in">
            <p className="text-base text-secondary mb-6">
              Type your seed phrase exactly as shown to confirm you backed it up correctly.
            </p>
            
            <div className="input-group mb-6">
              <label className="input-label">
                Seed Phrase Verification
              </label>
              <textarea 
                value={inputMnemonic} 
                onChange={(e) => setInputMnemonic(e.target.value)} 
                className="input"
                style={{
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: '1.6'
                }}
                rows={4}
                placeholder="Enter your 24-word seed phrase..."
              />
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button 
                onClick={() => verify(inputMnemonic)} 
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={!inputMnemonic.trim()}
              >
                🔍 Verify Phrase
              </button>
              <button 
                onClick={() => setStep(1)} 
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                ← Back to Phrase
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generate wallet */}
        {step === 3 && (
          <div className="text-center fade-in">
            <div className="mb-6">
              <div 
                style={{
                  fontSize: '3rem',
                  marginBottom: 'var(--space-4)'
                }}
              >
                🔐
              </div>
              <p className="text-base text-secondary">
                Perfect! Now we&apos;ll derive your wallet address from your verified seed phrase.
              </p>
            </div>
            
            <button 
              onClick={complete} 
              className="btn-primary"
              disabled={isLoading}
              style={{ minWidth: '200px' }}
            >
              {isLoading ? '⏳ Generating...' : '🚀 Generate Wallet'}
            </button>
          </div>
        )}

        {/* Step 4: Wallet created success */}
        {step === 4 && (
          <div className="text-center fade-in">
            <div 
              className="bounce"
              style={{
                fontSize: '4rem',
                marginBottom: 'var(--space-6)'
              }}
            >
              🎉
            </div>
            <h3 className="text-xl font-semibold text-primary mb-4">
              Wallet Created Successfully!
            </h3>
            <p className="text-sm text-secondary mb-4">
              Your new wallet address:
            </p>
            <div 
              className="p-4 mb-8"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                wordBreak: 'break-all',
                color: 'var(--text-primary)'
              }}
            >
              {restoredAddress}
            </div>
            <Link 
              href="/home" 
              className="btn-primary"
              style={{ 
                textDecoration: 'none',
                minWidth: '200px',
                display: 'inline-block'
              }}
            >
              🏠 Go to Dashboard
            </Link>
          </div>
        )}

        {/* Step 10: Restore wallet */}
        {step === 10 && (
          <div className="fade-in">
            <p className="text-base text-secondary mb-6">
              Enter your existing seed phrase to restore your wallet and access your assets.
            </p>
            
            <div className="input-group mb-6">
              <label className="input-label">
                Your Seed Phrase
              </label>
              <textarea 
                value={inputMnemonic} 
                onChange={(e) => setInputMnemonic(e.target.value)} 
                className="input"
                style={{
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: '1.6'
                }}
                rows={4}
                placeholder="Enter your 12 or 24-word seed phrase..."
              />
              <p className="text-xs text-tertiary mt-2">
                Separate each word with a space
              </p>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button 
                onClick={restore} 
                className="btn-primary"
                disabled={isLoading || !inputMnemonic.trim()}
                style={{ flex: 1 }}
              >
                {isLoading ? '⏳ Restoring...' : '🔄 Restore Wallet'}
              </button>
              <button 
                onClick={() => setStep(0)} 
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                ← Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 11: Wallet restored success */}
        {step === 11 && (
          <div className="text-center fade-in">
            <div 
              className="bounce"
              style={{
                fontSize: '4rem',
                marginBottom: 'var(--space-6)'
              }}
            >
              🎊
            </div>
            <h3 className="text-xl font-semibold text-primary mb-4">
              Wallet Restored Successfully!
            </h3>
            <p className="text-sm text-secondary mb-4">
              Your restored wallet address:
            </p>
            <div 
              className="p-4 mb-8"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                wordBreak: 'break-all',
                color: 'var(--text-primary)'
              }}
            >
              {restoredAddress}
            </div>
            <Link 
              href="/home" 
              className="btn-primary"
              style={{ 
                textDecoration: 'none',
                minWidth: '200px',
                display: 'inline-block'
              }}
            >
              🏠 Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
