"use client";

import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { useStore } from '@/lib/store';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  ctaLabel?: string;
}

export default function UnlockModal({ isOpen, onClose, title = 'Unlock Wallet', ctaLabel = 'Unlock' }: UnlockModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { unlockWithPassphrase, isLoading } = useStore();

  const handleUnlock = async () => {
    setError(null);
    const ok = await unlockWithPassphrase(passphrase);
    if (ok) {
      setPassphrase('');
      onClose();
    } else {
      setError('Incorrect passphrase or no encrypted seed found.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-secondary">Enter your passphrase to decrypt your wallet.</p>
        <Input
          type="password"
          placeholder="Passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">Cancel</Button>
          <Button onClick={handleUnlock} disabled={isLoading || passphrase.length === 0} className="flex-1">
            {isLoading ? 'Unlocking...' : ctaLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
