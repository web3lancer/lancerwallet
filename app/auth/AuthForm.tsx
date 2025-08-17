"use client";

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { login, signup } from './actions';

export default function AuthForm() {
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
    </form>
  );
}

