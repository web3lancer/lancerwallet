"use client";

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { login, signup } from './actions';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (action: 'login' | 'signup') => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = action === 'login'
        ? await login(email, password)
        : await signup(email, password);

      if (result?.error) {
        setError(result.error);
      } else {
        // On success, Next.js router cache will be invalidated by the action,
        // and the user will be redirected if the layout handles it.
        // For now, we can just clear the form.
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

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <Input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Button
          onClick={() => handleSubmit('login')}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
        <Button
          onClick={() => handleSubmit('signup')}
          disabled={isSubmitting}
          variant="secondary"
          className="w-full"
        >
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </div>
    </form>
  );
}
