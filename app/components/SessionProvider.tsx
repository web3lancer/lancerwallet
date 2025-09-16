"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getLoggedInUser } from '@/app/auth/actions';
import { Models } from 'appwrite';
import Skeleton from './ui/Skeleton'; // A loading skeleton
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  // Legacy migration modal state
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [legacyMnemonic, setLegacyMnemonic] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [migrateError, setMigrateError] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

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

    const checkLegacyMnemonic = () => {
      try {
        if (typeof window === 'undefined') return;
        const legacy = localStorage.getItem('mnemonic');
        const enc = localStorage.getItem('mnemonic.enc');
        if (legacy && !enc) {
          setLegacyMnemonic(legacy);
          setShowMigrateModal(true);
        }
      } catch (e) {
        console.error('Legacy mnemonic check failed:', e);
      }
    };

    checkUser();
    checkLegacyMnemonic();
  }, [setUser]);

  const handleMigrate = async () => {
    try {
      setMigrateError(null);
      if (!legacyMnemonic) {
        setShowMigrateModal(false);
        return;
      }
      if (passphrase.length < 8) {
        setMigrateError('Passphrase must be at least 8 characters.');
        return;
      }
      if (passphrase !== confirm) {
        setMigrateError('Passphrases do not match.');
        return;
      }
      setIsMigrating(true);
      const { encryptWithPassphrase } = await import('@/lib/crypto');
      const encrypted = encryptWithPassphrase({ mnemonic: legacyMnemonic }, passphrase);
      localStorage.setItem('mnemonic.enc', encrypted);
      localStorage.removeItem('mnemonic');
      setShowMigrateModal(false);
      setLegacyMnemonic(null);
      setPassphrase('');
      setConfirm('');
    } catch (e) {
      console.error('Legacy mnemonic migration failed:', e);
      setMigrateError('Failed to encrypt and migrate your secret phrase.');
    } finally {
      setIsMigrating(false);
    }
  };

  if (isLoading) {
    // You can replace this with a more sophisticated loading screen or splash screen
    return (
        <div className="flex items-center justify-center h-screen">
            <Skeleton className="w-64 h-8" />
        </div>
    );
  }

  return (
    <>
      {children}
      <Modal isOpen={showMigrateModal} onClose={() => setShowMigrateModal(false)} title="Encrypt Your Secret Phrase" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            A legacy unencrypted secret phrase was found on this device. Set a passphrase to encrypt and save it securely.
          </p>
          <Input type="password" placeholder="Passphrase (min 8 chars)" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
          <Input type="password" placeholder="Confirm passphrase" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {migrateError && <p className="text-red-500 text-sm">{migrateError}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowMigrateModal(false)} disabled={isMigrating}>Later</Button>
            <Button className="flex-1" onClick={handleMigrate} disabled={isMigrating || passphrase.length === 0} loading={isMigrating}>Encrypt & Save</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
