"use client";

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { walletAuth } from './actions';
import { useStore } from '@/lib/store';
import { generateNewWallet } from '@/lib/wallet';
import type { WalletKeys } from '@/lib/wallet';
import { startRegistration } from '@simplewebauthn/browser';
import { appwriteAccount } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';

type AuthMethod = 'passkey' | 'wallet' | 'import' | 'passkey_login' | 'phrase_login';
type PasskeyStep = 'start' | 'show_mnemonic' | 'confirm_mnemonic' | 'registering' | 'set_local_password';
type FormMode = 'signup' | 'login';

export default function AuthForm() {
  const { setUser } = useStore();
  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>('signup');
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [passkeyStep, setPasskeyStep] = useState<PasskeyStep>('start');

  const [newWallet, setNewWallet] = useState<WalletKeys | null>(null);
  const [mnemonicConfirmation, setMnemonicConfirmation] = useState('');

  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartPasskey = () => {
    setError(null);
    const wallet = generateNewWallet();
    setNewWallet(wallet);
    setAuthMethod('passkey');
    setPasskeyStep('show_mnemonic');
  };

  const handlePasskeyLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const optionsRes = await fetch('/api/auth/webauthn/authentication/options');
      const options = await optionsRes.json();
      if (!optionsRes.ok) throw new Error(options.error);

      const { startAuthentication } = await import('@simplewebauthn/browser');
      const assertion = await startAuthentication(options);

      const verificationRes = await fetch('/api/auth/webauthn/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assertion, challengeId: options.challengeId }),
      });
      const verificationData = await verificationRes.json();
      if (!verificationRes.ok) throw new Error(verificationData.error);

      const { token } = verificationData;
      const userHandle = assertion.response.userHandle;
      if (!userHandle) throw new Error('User handle not found in assertion.');

      await appwriteAccount.createSession(userHandle, token);
      router.push('/home');

    } catch (e: any) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhraseLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!seedPhrase.trim()) throw new Error('Secret phrase cannot be empty.');

      const { importWalletFromMnemonic, signMessage } = await import('@/lib/wallet');
      const wallet = importWalletFromMnemonic(seedPhrase);

      const nonceRes = await fetch('/api/auth/nonce');
      const { message } = await nonceRes.json();
      if (!nonceRes.ok) throw new Error('Could not get nonce from server.');

      const signature = await signMessage(wallet.privateKey, message);

      const verifyRes = await fetch('/api/auth/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address, signature, message }),
      });

      if (!verifyRes.ok) {
        const { error } = await verifyRes.json();
        throw new Error(error || 'Failed to verify signature.');
      }

      router.push('/home');

    } catch (e: any) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEncryptedMnemonic = () => {
    if (!newWallet || !password) {
      setError('Could not save wallet. Please try again.');
      return;
    }
    try {
      const { encryptDataWithPassword } = require('@/lib/crypto');
      const encryptedMnemonic = encryptDataWithPassword({ mnemonic: newWallet.mnemonic }, password);
      localStorage.setItem(`lancer-wallet-${newWallet.address}`, encryptedMnemonic);
      router.push('/home');
    } catch (e) {
      setError('Failed to encrypt and save wallet locally.');
    }
  };

  const handlePasskeyRegistration = async () => {
    if (!newWallet) {
      setError('Wallet not generated. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setPasskeyStep('registering');

    try {
      const userId = `wallet:${newWallet.address.toLowerCase()}`;
      const userName = newWallet.address.toLowerCase();

      // 1. Get registration options from server
      const optionsRes = await fetch('/api/auth/webauthn/registration/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName }),
      });
      const options = await optionsRes.json();
      if (!optionsRes.ok) throw new Error(options.error || 'Failed to get registration options.');

      // 2. Start registration on client
      const attestation = await startRegistration(options);

      // 3. Verify registration on server
      const verificationRes = await fetch('/api/auth/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...attestation, userId }),
      });
      const verificationData = await verificationRes.json();
      if (!verificationRes.ok) throw new Error(verificationData.error || 'Failed to verify registration.');

      // 4. Create session with the token from the server
      const { token } = verificationData;
      await appwriteAccount.createSession(userId, token);

      // TODO: Encrypt and store mnemonic locally
      // For now, we just redirect. The user MUST have saved their mnemonic.
      // A better flow would be to prompt for a local password here to encrypt the seed.
      setPasskeyStep('set_local_password');

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during passkey setup.');
      }
      setPasskeyStep('show_mnemonic'); // Go back to the mnemonic step on error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render logic based on authMethod and steps
  if (!authMethod) {
    if (formMode === 'signup') {
      return (
        <div>
          <div className="space-y-6">
            {error && <p className="text-red-500">{error}</p>}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Create a Wallet</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose how to create your new wallet.</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleStartPasskey} className="w-full">Create with Passkey</Button>
              <Button onClick={() => setAuthMethod('wallet')} className="w-full" variant="secondary">Create with Password</Button>
              <Button onClick={() => setAuthMethod('import')} className="w-full" variant="secondary">Import Existing Wallet</Button>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm">
              Already have an account?{' '}
              <button onClick={() => setFormMode('login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                Log In
              </button>
            </p>
          </div>
        </div>
      );
    } else { // formMode === 'login'
      return (
        <div>
          <div className="space-y-6">
            {error && <p className="text-red-500">{error}</p>}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Log In</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back! Access your account.</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handlePasskeyLogin} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Log In with Passkey'}
              </Button>
              <Button onClick={() => setAuthMethod('phrase_login')} className="w-full" variant="secondary" disabled={isSubmitting}>
                Log In with Secret Phrase
              </Button>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm">
              Don't have an account?{' '}
              <button onClick={() => setFormMode('signup')} className="font-medium text-indigo-600 hover:text-indigo-500" disabled={isSubmitting}>
                Sign Up
              </button>
            </p>
          </div>
        </div>
      );
    }
  }

  if (authMethod === 'phrase_login') {
    return (
      <div>
        <form onSubmit={(e) => { e.preventDefault(); handlePhraseLogin(); }} className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter your secret phrase
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
          <Button type="submit" className="w-full" disabled={isSubmitting || !seedPhrase.trim()}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <Button onClick={() => setAuthMethod(null)} variant="secondary" disabled={isSubmitting}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (authMethod === 'passkey') {
    return (
      <div className="space-y-6">
        {error && <p className="text-red-500">{error}</p>}

        {passkeyStep === 'show_mnemonic' && newWallet && (
          <div>
            <h3 className="font-bold text-lg">Save Your Secret Phrase!</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 my-2">This is the ONLY way to recover your wallet. Store it somewhere safe and offline.</p>
            <div className="p-4 my-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-lg font-mono tracking-wider text-center">
              {newWallet.mnemonic}
            </div>
            <Button onClick={() => setPasskeyStep('confirm_mnemonic')} className="w-full">I have saved my phrase</Button>
          </div>
        )}

        {passkeyStep === 'confirm_mnemonic' && (
          <div>
            <h3 className="font-bold text-lg">Confirm Your Secret Phrase</h3>
            <p className="text-sm my-2">To ensure you have saved your phrase, please enter it below.</p>
            <textarea
              placeholder="Enter the 12-word phrase you just saved"
              value={mnemonicConfirmation}
              onChange={(e) => setMnemonicConfirmation(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
            {mnemonicConfirmation.trim() === newWallet?.mnemonic.trim() ? (
              <Button onClick={handlePasskeyRegistration} className="w-full mt-4">Confirm & Register Passkey</Button>
            ) : <p className="text-sm text-red-500 mt-2">The phrase does not match.</p>}
          </div>
        )}

        {passkeyStep === 'registering' && (
            <div>
                <h3 className="font-bold text-lg text-center">Registering Passkey...</h3>
                <p className="text-sm text-center my-2">Please follow the instructions from your browser or device.</p>
            </div>
        )}

        {passkeyStep === 'set_local_password' && (
            <div>
                <h3 className="font-bold text-lg">Success! Now, secure your wallet locally.</h3>
                <p className="text-sm my-2">Create a password to encrypt your secret phrase on this device. You will use this password to unlock your wallet for transactions.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEncryptedMnemonic(); }}>
                    <Input
                        type="password"
                        placeholder="Enter a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <Button type="submit" className="w-full mt-4" disabled={!password}>
                        Save & Finish
                    </Button>
                </form>
            </div>
        )}

        <Button onClick={() => setAuthMethod(null)} variant="secondary" className="w-full mt-4">Back</Button>
      </div>
    );
  }

  if (authMethod === 'wallet' || authMethod === 'import') {
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleWalletAuth(); }} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {authMethod === 'import' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your secret phrase
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
          </div>
        )}

        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium mb-2">
              Set a local encryption password
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
              This password encrypts your wallet data on this device.
            </p>
          </div>
          <Button
            onClick={handleWalletAuth}
            disabled={isSubmitting || !password || (authMethod === 'import' && !seedPhrase.trim())}
            className="w-full"
            type="submit"
          >
            {isSubmitting ? 'Working...' : authMethod === 'wallet' ? 'Create Wallet' : 'Import Wallet'}
          </Button>
        </div>

        <Button
          onClick={() => {
            setAuthMethod(null);
            setSeedPhrase('');
            setPassword('');
            setError(null);
          }}
          variant="secondary"
          className="w-full"
          type="button"
          disabled={isSubmitting}
        >
          Back
        </Button>
      </form>
    );
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
        setIsSubmitting(false);
      } else {
        // on success, the action redirects, so no need to do anything here
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during wallet authentication.');
      }
      setIsSubmitting(false);
    }
  }

  return null;
}
