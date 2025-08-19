"use client";

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { login, signup } from './actions';
import { appwriteAccount } from '@/lib/appwrite';
import { useStore } from '@/lib/store';
import { detectInjectedProviders, requestSignature } from '@/lib/appwrite/web3';
import { ethers } from 'ethers';

export default function AuthForm() {
  const { setUser } = useStore();
  const [step, setStep] = useState(0); // 0: email, 1: password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified submit: try login, if user not found, fallback to signup
  const handleUnifiedSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Try login first
      let result = await login(email, password);
      if (result?.error) {
        // If error is user not found, try signup
        if (result.error.toLowerCase().includes('not found') || result.error.toLowerCase().includes('no user')) {
          result = await signup(email, password);
        }
      }
      if (result?.error) {
        setError(result.error);
      } else {
        setEmail('');
        setPassword('');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 0: email only
  // Step 1: password
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            autoFocus
          />
          <Button
            onClick={() => {
              if (!email || !email.includes('@')) {
                setError('Please enter a valid email address.');
                return;
              }
              setError(null);
              setStep(1);
            }}
            disabled={isSubmitting || !email}
            className="w-full"
            type="button"
          >
            Continue
          </Button>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            autoFocus
          />
          <Button
            onClick={handleUnifiedSubmit}
            disabled={isSubmitting || !password}
            className="w-full"
            type="button"
          >
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      )}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>
      <div>
        <Button
          onClick={handleWeb3Login}
          disabled={isSubmitting}
          className="w-full"
          variant="secondary"
          type="button"
        >
          {isSubmitting ? 'Connecting...' : 'Login with Web3'}
        </Button>
      </div>
    </form>
  );

  async function handleWeb3Login() {
    setIsSubmitting(true);
    setError(null);
    try {
      const providers = detectInjectedProviders();
      // Access injected provider safely
      // Narrow type using Window & { ethereum?: { request?: (args: any) => Promise<any> } }
      const win = window as Window & { ethereum?: { request?: (...args: any[]) => Promise<any> } };
      if (providers.length === 0 || !win.ethereum) {
          setError("No Web3 provider detected. Please install MetaMask.");
          setIsSubmitting(false);
          return;
        }

        const provider = new ethers.BrowserProvider(win.ethereum as any);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];


      const nonceRes = await fetch("/api/auth/nonce");
      const { key, nonce } = await nonceRes.json();

      const signature = await requestSignature(address, `Sign this nonce: ${nonce}`);

      const tokenRes = await fetch("/api/auth/custom-token/web3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, key, nonce }),
      });

      if (!tokenRes.ok) {
        const { error } = await tokenRes.json();
        throw new Error(error || "Failed to get session token.");
      }

      const { token } = await tokenRes.json();

      await appwriteAccount.createSession(address, token);
      const user = await appwriteAccount.get();
      setUser(user);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }
}

