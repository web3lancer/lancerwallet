"use client";

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [authMethod, setAuthMethod] = useState<'phrase' | 'passkey' | null>(null);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handlePhraseLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!seedPhrase.trim()) {
        throw new Error('Seed phrase cannot be empty.');
      }

      // 1. Import wallet functions and derive wallet from phrase
      const { importWalletFromMnemonic, signMessage } = await import('@/lib/wallet');
      const wallet = importWalletFromMnemonic(seedPhrase);
      const userId = `wallet:${wallet.address.toLowerCase()}`;

      // 2. Fetch nonce from the server
      const nonceRes = await fetch('/api/auth/nonce');
      if (!nonceRes.ok) {
        throw new Error('Failed to get an authentication challenge from the server.');
      }
      const { message: nonce } = await nonceRes.json();

      // 3. Sign the nonce
      const signature = await signMessage(wallet.privateKey, nonce);

      // 4. Send signature to the custom token endpoint
      const tokenRes = await fetch('/api/auth/custom-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: wallet.address,
          signature,
          nonce,
        }),
      });

      if (!tokenRes.ok) {
        const { error } = await tokenRes.json();
        throw new Error(error || 'Failed to authenticate. Please check your phrase and try again.');
      }
      const { token } = await tokenRes.json();

      // 5. Create a session with the custom token
      const { appwriteAccount } = await import('@/lib/appwrite');
      await appwriteAccount.createSession(userId, token);

      // 6. Load the wallet into the global state
      const { useStore } = await import('@/lib/store');
      useStore.getState().loadActiveWallet(wallet.mnemonic);

      // 7. Redirect to the home page
      router.push('/home');

    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskey = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      // This function will try to log in, and if that fails, it will try to register.
      // This provides a seamless experience for a single "Continue with Passkey" button.
      const { loginWithPasskey, registerWithPasskey } = await import('@/lib/auth/passkey');
      try {
        const loggedIn = await loginWithPasskey();
        if (loggedIn) {
          router.push('/home');
          return;
        }
      } catch (loginError: unknown) {
        const loginMessage = loginError instanceof Error ? loginError.message : 'Login failed.';
        console.info('Passkey login failed, attempting registration...', loginMessage);
        // We assume that if login fails, it's because the user is new.
        // In a real-world app, we might inspect the error more closely.
        try {
          const registered = await registerWithPasskey();
          if (registered) {
            router.push('/home');
            return;
          }
        } catch (regError: unknown) {
          const regMessage = regError instanceof Error ? regError.message : 'Registration failed.';
          setError(`Registration failed: ${regMessage}`);
          return;
        }
      }
      // If we reach here, something went wrong in both flows.
      setError('Could not authenticate with passkey. Please try again.');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authMethod === 'phrase') {
    return (
      <div className="space-y-6">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <h2 className="text-xl font-semibold text-center">Continue with Phrase</h2>
        <p className="text-sm text-gray-500 text-center">Enter your 12 or 24-word secret recovery phrase.</p>
        <textarea
          placeholder="apple banana cherry..."
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          className="w-full min-h-[120px] p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
          disabled={isSubmitting}
          autoFocus
        />
        <Button onClick={handlePhraseLogin} className="w-full" disabled={isSubmitting || !seedPhrase.trim()}>
          {isSubmitting ? 'Authenticating...' : 'Continue'}
        </Button>
        <Button onClick={() => setAuthMethod(null)} variant="secondary" className="w-full" disabled={isSubmitting}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setAuthMethod('phrase')} className="w-full py-3 text-lg">
        Continue with Seed Phrase
      </Button>
      <Button onClick={handlePasskey} className="w-full py-3 text-lg" variant="secondary" disabled={isSubmitting}>
        {isSubmitting ? 'Working...' : 'Continue with Passkey'}
      </Button>
    </div>
  );
}
