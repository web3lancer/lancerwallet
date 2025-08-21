"use client";

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { passkeyAuth, walletAuth } from './actions';
import { useStore } from '@/lib/store';

type AuthMethod = 'passkey' | 'wallet' | 'import';

export default function AuthForm() {
  const { setUser } = useStore();
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [step, setStep] = useState(0);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authMethod) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Welcome to LancerWallet</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose how you'd like to secure your wallet
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => handlePasskeyAuth()}
            disabled={isSubmitting}
            className="w-full"
            type="button"
          >
            {isSubmitting ? 'Setting up...' : 'Create with Passkey (Recommended)'}
          </Button>
          
          <Button
            onClick={() => setAuthMethod('wallet')}
            disabled={isSubmitting}
            className="w-full"
            variant="secondary"
            type="button"
          >
            Create New Wallet
          </Button>
          
          <Button
            onClick={() => setAuthMethod('import')}
            disabled={isSubmitting}
            className="w-full"
            variant="secondary"
            type="button"
          >
            Import Existing Wallet
          </Button>
        </div>

        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          <p>Passkey: Encrypted automatically, sign in with biometrics</p>
          <p>Manual: Set password to encrypt your data</p>
        </div>
      </div>
    );
  }

  if (authMethod === 'wallet' || authMethod === 'import') {
    return (
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {step === 0 && authMethod === 'import' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your seed phrase
              </label>
              <textarea
                placeholder="Enter your 12 or 24-word seed phrase"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <Button
              onClick={() => setStep(1)}
              disabled={isSubmitting || !seedPhrase.trim()}
              className="w-full"
              type="button"
            >
              Continue
            </Button>
          </div>
        )}

        {(step === 0 && authMethod === 'wallet') || (step === 1 && authMethod === 'import') ? (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-2">
                Set encryption password
              </label>
              <Input
                type="password"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoFocus={authMethod === 'wallet'}
              />
              <p className="text-xs text-gray-500 mt-1">
                This password encrypts your wallet data locally
              </p>
            </div>
            <Button
              onClick={() => handleWalletAuth()}
              disabled={isSubmitting || !password}
              className="w-full"
              type="button"
            >
              {isSubmitting ? 'Creating...' : authMethod === 'wallet' ? 'Create Wallet' : 'Import Wallet'}
            </Button>
          </div>
        ) : null}

        <Button
          onClick={() => {
            setAuthMethod(null);
            setStep(0);
            setSeedPhrase('');
            setPassword('');
            setError(null);
          }}
          variant="secondary"
          className="w-full"
          type="button"
        >
          Back
        </Button>
      </form>
    );
  }

  return null;

  async function handlePasskeyAuth() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await passkeyAuth();
      if (result?.error) {
        setError(result.error);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to authenticate with passkey.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWalletAuth() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await walletAuth({
        method: authMethod === 'import' ? 'import' : 'create',
        password,
        seedPhrase: authMethod === 'import' ? seedPhrase : undefined,
      });
      if (result?.error) {
        setError(result.error);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to authenticate with wallet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }
}

