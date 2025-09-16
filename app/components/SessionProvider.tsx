"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getLoggedInUser } from '@/app/auth/actions';
import { Models } from 'appwrite';
import Skeleton from './ui/Skeleton'; // A loading skeleton

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user } = await getLoggedInUser();
        if (user) {
          setUser(user as Models.User<Models.Preferences>);
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Legacy migration: if 'mnemonic' exists and 'mnemonic.enc' is missing, prompt user to set passphrase and migrate.
    const migrateLegacyMnemonic = async () => {
      try {
        if (typeof window === 'undefined') return;
        const legacy = localStorage.getItem('mnemonic');
        const enc = localStorage.getItem('mnemonic.enc');
        if (legacy && !enc) {
          const passphrase = window.prompt('Set a passphrase to encrypt your seed (min 8 chars):') || '';
          if (passphrase.length < 8) {
            alert('Passphrase must be at least 8 characters. You can migrate later from Settings.');
            return;
          }
          const { encryptWithPassphrase } = await import('@/lib/crypto');
          const encrypted = encryptWithPassphrase({ mnemonic: legacy }, passphrase);
          localStorage.setItem('mnemonic.enc', encrypted);
          localStorage.removeItem('mnemonic');
          alert('Your secret phrase has been encrypted and migrated securely.');
        }
      } catch (e) {
        console.error('Legacy mnemonic migration failed:', e);
      }
    };

    checkUser();
    migrateLegacyMnemonic();
  }, [setUser]);

  if (isLoading) {
    // You can replace this with a more sophisticated loading screen or splash screen
    return (
        <div className="flex items-center justify-center h-screen">
            <Skeleton className="w-64 h-8" />
        </div>
    );
  }

  return <>{children}</>;
}
