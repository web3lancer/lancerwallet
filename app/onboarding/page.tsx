"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState('');
  const [restoredAddress, setRestoredAddress] = useState<string | null>(null);
  const [inputMnemonic, setInputMnemonic] = useState('');

  const startCreate = async () => {
    const { generateMnemonic } = await import('bip39');
    const m = generateMnemonic(256); // 24 words
    setMnemonic(m);
    setStep(1);
  };

  const proceedToVerify = () => setStep(2);

  const verify = (value: string) => {
    if (value.trim() === mnemonic.trim()) setStep(3);
    else alert('Seed phrase does not match.');
  };

  const complete = async () => {
    // derive a wallet address using ethers from mnemonic (lazy-loaded)
    const { Wallet } = await import('ethers');
    // ethers' Wallet may be a namespace; use bracket access to avoid any cast
    // dynamic import typing mismatch - access defensive
    const walletAny = (Wallet as unknown) as { fromPhrase?: (m: string) => { address: string }; Wallet?: { fromPhrase: (m: string) => { address: string } } };
    const wallet = walletAny?.fromPhrase ? walletAny.fromPhrase(mnemonic) : walletAny?.Wallet ? walletAny.Wallet.fromPhrase(mnemonic) : null;
    if (!wallet) throw new Error('Could not derive wallet');
    // In a real app you'd persist keys securely (e.g., encrypted storage)
    setRestoredAddress(wallet.address);
    setStep(4);
  };

  const startRestore = () => setStep(10);

  const restore = async () => {
    try {
      const { validateMnemonic } = await import('bip39');
      const { Wallet } = await import('ethers');
      if (!validateMnemonic(inputMnemonic)) throw new Error("Invalid mnemonic");
      // dynamic import typing mismatch - access defensive
const walletAny = (Wallet as unknown) as { fromPhrase?: (m: string) => { address: string }; Wallet?: { fromPhrase: (m: string) => { address: string } } };
      const wallet = walletAny?.fromPhrase ? walletAny.fromPhrase(inputMnemonic) : walletAny?.Wallet ? walletAny.Wallet.fromPhrase(inputMnemonic) : null;
      if (!wallet) throw new Error('Could not derive wallet');
      setRestoredAddress(wallet.address);
      setStep(11);
    } catch (err) {
      // keep simple UX-level feedback and log for debug
      console.warn('restore mnemonic error', err);
      alert("Invalid mnemonic");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow p-8">
        <div className="flex justify-center mb-6">
          <Logo size={72} />
        </div>
        {step === 0 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to LancerWallet</h2>
            <p className="mb-6">Create a new wallet or restore an existing one.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={startCreate} className="bg-purple-600 text-white px-4 py-2 rounded">Create new wallet</button>
              <button onClick={startRestore} className="border px-4 py-2 rounded">Restore existing wallet</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Your seed phrase (write it down)</h3>
            <p className="mb-4 text-sm text-gray-600">This is the only way to recover your wallet. Keep it private and offline.</p>
            <div className="bg-gray-100 p-4 rounded mb-4 whitespace-pre-wrap">{mnemonic}</div>
            <div className="flex gap-4">
              <button onClick={proceedToVerify} className="bg-purple-600 text-white px-4 py-2 rounded">I&apos;ve saved it</button>
              <button onClick={() => setStep(0)} className="border px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Verify your seed phrase</h3>
            <p className="mb-4 text-sm text-gray-600">Type your seed phrase to confirm you backed it up.</p>
            <textarea value={inputMnemonic} onChange={(e) => setInputMnemonic(e.target.value)} className="w-full p-3 border rounded mb-4" rows={3} />
            <div className="flex gap-4">
              <button onClick={() => verify(inputMnemonic)} className="bg-purple-600 text-white px-4 py-2 rounded">Verify</button>
              <button onClick={() => setStep(1)} className="border px-4 py-2 rounded">Back</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Finalizing</h3>
            <p className="mb-4 text-sm text-gray-600">We&apos;ll derive your wallet address now.</p>
            <div className="flex gap-4">
              <button onClick={complete} className="bg-purple-600 text-white px-4 py-2 rounded">Generate wallet</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">All set!</h3>
            <p className="mb-2">Your wallet address:</p>
            <div className="bg-gray-100 p-3 rounded mb-4">{restoredAddress}</div>
            <div className="flex gap-4">
              <Link href="/home" className="bg-purple-600 text-white px-4 py-2 rounded">Go to dashboard</Link>
            </div>
          </div>
        )}

        {step === 10 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Restore wallet</h3>
            <p className="mb-4 text-sm text-gray-600">Paste your seed phrase below.</p>
            <textarea value={inputMnemonic} onChange={(e) => setInputMnemonic(e.target.value)} className="w-full p-3 border rounded mb-4" rows={3} />
            <div className="flex gap-4">
              <button onClick={restore} className="bg-purple-600 text-white px-4 py-2 rounded">Restore</button>
              <button onClick={() => setStep(0)} className="border px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        )}

        {step === 11 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Restored</h3>
            <p className="mb-2">Restored wallet address:</p>
            <div className="bg-gray-100 p-3 rounded mb-4">{restoredAddress}</div>
            <div className="flex gap-4">
              <Link href="/home" className="bg-purple-600 text-white px-4 py-2 rounded">Go to dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
