"use client";
import React, { useState } from 'react';
import ThemeSelector from "../components/ThemeSelector";
import ProfileSettings from '../components/ProfileSettings';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: string;
}

export default function SettingsPageClient() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    {
      id: 'notifications',
      label: 'Push Notifications',
      description: 'Receive notifications for transactions and updates',
      enabled: true,
      category: 'notifications'
    },
    {
      id: 'transaction-alerts',
      label: 'Transaction Alerts',
      description: 'Get notified when transactions are confirmed',
      enabled: true,
      category: 'notifications'
    },
    {
      id: 'price-alerts',
      label: 'Price Alerts',
      description: 'Receive alerts for significant price changes',
      enabled: false,
      category: 'notifications'
    },
    {
      id: 'biometric-auth',
      label: 'Biometric Authentication',
      description: 'Use fingerprint or face ID to unlock the app',
      enabled: true,
      category: 'security'
    },
    {
      id: 'auto-lock',
      label: 'Auto-lock Wallet',
      description: 'Automatically lock wallet after inactivity',
      enabled: true,
      category: 'security'
    },
    {
      id: 'transaction-confirmation',
      label: 'Transaction Confirmation',
      description: 'Require confirmation for all transactions',
      enabled: true,
      category: 'security'
    },
    {
      id: 'testnet-mode',
      label: 'Testnet Mode',
      description: 'Enable testnet networks for development',
      enabled: false,
      category: 'advanced'
    },
    {
      id: 'analytics',
      label: 'Usage Analytics',
      description: 'Help improve the app by sharing usage data',
      enabled: true,
      category: 'privacy'
    }
  ]);

  const [activeSection, setActiveSection] = useState<string>('general');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  // Reveal modal local state
  const [revealPassphrase, setRevealPassphrase] = useState('');
  const [revealError, setRevealError] = useState<string | null>(null);

  // Restore flow: set passphrase for plaintext backup
  const [showSetPassphraseModal, setShowSetPassphraseModal] = useState(false);
  const [pendingMnemonic, setPendingMnemonic] = useState<string | null>(null);
  const [setPassphrase, setSetPassphrase] = useState('');
  const [setPassphraseConfirm, setSetPassphraseConfirm] = useState('');
  const [setPassphraseError, setSetPassphraseError] = useState<string | null>(null);

  // Reset reveal state when modal opens
  React.useEffect(() => {
    if (showRevealModal) {
      setMnemonic(null);
      setRevealPassphrase('');
      setRevealError(null);
    }
  }, [showRevealModal]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const sections = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy', icon: '🛡️' },
    { id: 'advanced', name: 'Advanced', icon: '🔧' },
    { id: 'about', name: 'About', icon: 'ℹ️' }
  ];

  const getSettingsForCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  const handleBackup = () => {
    try {
      const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
      const enc = localStorage.getItem('mnemonic.enc');

      if (!enc) {
        alert('No encrypted secret found. Please ensure you have created or imported a wallet.');
        return;
      }

      const backupData = {
        enc,
        wallets: wallets.map((w: import('../../lib/wallet').WalletData) => ({ ...w, privateKey: undefined })), // Remove private keys for security
        timestamp: new Date().toISOString(),
        version: '2.0'
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lancer-wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);

          if ((!backupData.enc && !backupData.mnemonic) || !backupData.wallets) {
            throw new Error('Invalid backup file format');
          }

          // Restore mnemonic (encrypted if present, otherwise ask user to set a passphrase)
          if (backupData.enc) {
            localStorage.setItem('mnemonic.enc', backupData.enc);
          } else if (backupData.mnemonic) {
            setPendingMnemonic(backupData.mnemonic);
            setShowSetPassphraseModal(true);
          }

          // Restore wallets (dedupe by address)
          const existingWallets = JSON.parse(localStorage.getItem('wallets') || '[]');
          const toAdd = backupData.wallets.filter((w: { address: string }) => !existingWallets.find((ew: import('../../lib/wallet').WalletData) => ew.address === w.address));
          if (toAdd.length) {
            localStorage.setItem('wallets', JSON.stringify([...existingWallets, ...toAdd]));
          }

          alert('Backup processed. If a passphrase is required, please complete the passphrase step.');
        } catch (error) {
          console.error('Restore failed:', error);
          alert('Failed to restore wallet. Please check your backup file and try again.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLogout = () => {
    // Clear wallet/account data (mnemonic.enc, session, etc.)
    localStorage.removeItem('mnemonic.enc');
    localStorage.removeItem('mnemonic'); // legacy cleanup
    localStorage.removeItem('wallet');
    localStorage.removeItem('session');
    // Redirect to onboarding
    window.location.href = '/onboarding';
  };

  const handleReset = () => {
    setShowResetModal(false);
    // Clear all wallet/account data
    localStorage.clear();
    // Redirect to onboarding
    window.location.href = '/onboarding';
  };

  const handleRevealDecrypt = async () => {
    try {
      setRevealError(null);
      setMnemonic(null);
      const enc = localStorage.getItem('mnemonic.enc');
      if (!enc) {
        setRevealError('No encrypted secret found on this device.');
        return;
      }
      const { decryptWithPassphrase } = await import('../../lib/crypto');
      const data = decryptWithPassphrase<{ mnemonic: string }>(enc, revealPassphrase);
      if (!data?.mnemonic) {
        setRevealError('Incorrect passphrase.');
        return;
      }
      setMnemonic(data.mnemonic);
    } catch (e) {
      console.error('Decrypt reveal failed', e);
      setRevealError('Failed to decrypt.');
    }
  };

  const handleSetPassphraseConfirm = async () => {
    try {
      setSetPassphraseError(null);
      if (!pendingMnemonic) {
        setShowSetPassphraseModal(false);
        return;
      }
      if (setPassphrase.length < 8) {
        setSetPassphraseError('Passphrase must be at least 8 characters.');
        return;
      }
      if (setPassphrase !== setPassphraseConfirm) {
        setSetPassphraseError('Passphrases do not match.');
        return;
      }
      const { encryptWithPassphrase } = await import('../../lib/crypto');
      const enc = encryptWithPassphrase({ mnemonic: pendingMnemonic }, setPassphrase);
      localStorage.setItem('mnemonic.enc', enc);
      setPendingMnemonic(null);
      setSetPassphrase('');
      setSetPassphraseConfirm('');
      setShowSetPassphraseModal(false);
      alert('Secret phrase encrypted and saved.');
    } catch (e) {
      console.error('Encrypt with passphrase failed', e);
      setSetPassphraseError('Failed to save encrypted secret.');
    }
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-base text-secondary">Customize your wallet preferences and security settings</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <nav className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-primary mb-4">Settings</h3>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all ${
                    activeSection === section.id ? 'bg-purple-500 text-white' : 'text-secondary hover:bg-surface-hover'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    background: activeSection === section.id ? 'var(--purple-500)' : 'transparent',
                    color: activeSection === section.id ? 'var(--text-inverse)' : 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span>{section.icon}</span>
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Settings Content */}
        <main className="lg:col-span-3">
          {/* Profile Settings */}
          {activeSection === 'profile' && <ProfileSettings />}

          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">Theme</label>
                    <ThemeSelector />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">Currency</label>
                    <select className="input" style={{ maxWidth: '200px' }}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">Language</label>
                    <select className="input" style={{ maxWidth: '200px' }}>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Network</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">Default Network</label>
                    <select className="input" style={{ maxWidth: '200px' }}>
                      <option value="ethereum">Ethereum Mainnet</option>
                      <option value="polygon">Polygon</option>
                      <option value="bsc">Binance Smart Chain</option>
                      <option value="arbitrum">Arbitrum</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Authentication</h3>
                <div className="space-y-4">
                  {getSettingsForCategory('security').map((setting) => (
                    <div key={setting.id} className="flex justify-between items-center p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                      <div>
                        <p className="text-sm font-medium text-primary">{setting.label}</p>
                        <p className="text-xs text-secondary">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.enabled}
                          onChange={() => toggleSetting(setting.id)}
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 rounded-full peer-checked:bg-purple-500 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{ background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)' }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Backup & Recovery</h3>
                <div className="space-y-4">
                  <button className="btn-secondary" onClick={handleBackup} style={{ width: '100%' }}>
                    💾 Backup Wallet
                  </button>
                  <button className="btn-secondary" onClick={handleRestore} style={{ width: '100%' }}>
                    📥 Restore from Backup
                  </button>
                  <button className="btn-secondary" onClick={() => setShowRevealModal(true)} style={{ width: '100%' }}>
                    🔍 Reveal Secret Phrase
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ width: '100%', background: 'rgba(244, 67, 54, 0.1)', borderColor: 'rgba(244, 67, 54, 0.2)', color: 'var(--error)' }}
                    onClick={handleLogout}
                  >
                    🚪 Log Out
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ width: '100%', background: 'rgba(244, 67, 54, 0.1)', borderColor: 'rgba(244, 67, 54, 0.2)', color: 'var(--error)' }}
                    onClick={() => setShowResetModal(true)}
                  >
                    🗑️ Reset Wallet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-primary mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {getSettingsForCategory('notifications').map((setting) => (
                  <div key={setting.id} className="flex justify-between items-center p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                    <div>
                      <p className="text-sm font-medium text-primary">{setting.label}</p>
                      <p className="text-xs text-secondary">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={setting.enabled} onChange={() => toggleSetting(setting.id)} className="sr-only peer" />
                      <div
                        className="w-11 h-6 rounded-full peer-checked:bg-purple-500 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{ background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)' }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-primary mb-4">Privacy & Data</h3>
              <div className="space-y-4">
                {getSettingsForCategory('privacy').map((setting) => (
                  <div key={setting.id} className="flex justify-between items-center p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                    <div>
                      <p className="text-sm font-medium text-primary">{setting.label}</p>
                      <p className="text-xs text-secondary">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={setting.enabled} onChange={() => toggleSetting(setting.id)} className="sr-only peer" />
                      <div
                        className="w-11 h-6 rounded-full peer-checked:bg-purple-500 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{ background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)' }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeSection === 'advanced' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Developer Options</h3>
                <div className="space-y-4">
                  {getSettingsForCategory('advanced').map((setting) => (
                    <div key={setting.id} className="flex justify-between items-center p-3 rounded-md" style={{ background: 'var(--surface-hover)' }}>
                      <div>
                        <p className="text-sm font-medium text-primary">{setting.label}</p>
                        <p className="text-xs text-secondary">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={setting.enabled} onChange={() => toggleSetting(setting.id)} className="sr-only peer" />
                        <div
                          className="w-11 h-6 rounded-full peer-checked:bg-purple-500 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{ background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)' }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Gas Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">Default Gas Price</label>
                    <select className="input" style={{ maxWidth: '200px' }}>
                      <option value="slow">Slow (Lower fees)</option>
                      <option value="standard">Standard</option>
                      <option value="fast">Fast (Higher fees)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About */}
          {activeSection === 'about' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">App Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Version</span>
                    <span className="text-sm font-medium text-primary">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Build</span>
                    <span className="text-sm font-medium text-primary">2024.01.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Network</span>
                    <span className="text-sm font-medium text-primary">Ethereum Mainnet</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Support</h3>
                <div className="space-y-3">
                  <button className="btn-secondary" style={{ width: '100%' }}>
                    📚 Help Center
                  </button>
                  <button className="btn-secondary" style={{ width: '100%' }}>
                    💬 Contact Support
                  </button>
                  <button className="btn-secondary" style={{ width: '100%' }}>
                    📋 Report Issue
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Legal</h3>
                <div className="space-y-3">
                  <button className="btn-ghost" style={{ width: '100%' }}>
                    📄 Terms of Service
                  </button>
                  <button className="btn-ghost" style={{ width: '100%' }}>
                    🔒 Privacy Policy
                  </button>
                  <button className="btn-ghost" style={{ width: '100%' }}>
                    📜 Open Source Licenses
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reveal Secret Phrase Modal */}
      {showRevealModal && (
        <div className="modal-overlay" onClick={() => setShowRevealModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-primary mb-4">🔍 Secret Phrase</h3>
            <p className="text-base text-secondary mb-6">
              This is your wallet’s recovery phrase. Never share it with anyone. Anyone with access can control your funds.
            </p>
            <div className="p-4 mb-6 rounded-md" style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
                Write this down and store it securely. Do not take screenshots or store online.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <Input type="password" placeholder="Passphrase" value={revealPassphrase} onChange={(e) => setRevealPassphrase(e.target.value)} />
              <Button onClick={handleRevealDecrypt} disabled={revealPassphrase.length === 0}>Decrypt</Button>
              {revealError && <p className="text-red-500 text-sm">{revealError}</p>}
            </div>

            <div className="p-6 mb-6" style={{ background: 'var(--surface-hover)', border: '2px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', lineHeight: '1.8', wordSpacing: '8px', letterSpacing: '0.5px' }}>
              {mnemonic ? mnemonic : <span className="text-secondary">Enter your passphrase to reveal your secret phrase.</span>}
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setShowRevealModal(false)} style={{ flex: 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Passphrase Modal (for restoring plaintext backups) */}
      {showSetPassphraseModal && (
        <div className="modal-overlay" onClick={() => setShowSetPassphraseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-primary mb-4">🔐 Set Passphrase</h3>
            <p className="text-base text-secondary mb-6">Your backup contains an unencrypted secret phrase. Set a passphrase to encrypt and save it securely on this device.</p>
            <div className="space-y-3 mb-6">
              <Input type="password" placeholder="Passphrase (min 8 chars)" value={setPassphrase} onChange={(e) => setSetPassphrase(e.target.value)} />
              <Input type="password" placeholder="Confirm passphrase" value={setPassphraseConfirm} onChange={(e) => setSetPassphraseConfirm(e.target.value)} />
              {setPassphraseError && <p className="text-red-500 text-sm">{setPassphraseError}</p>}
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setShowSetPassphraseModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSetPassphraseConfirm} style={{ flex: 1 }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-primary mb-4">⚠️ Reset Wallet</h3>
            <p className="text-base text-secondary mb-6">
              This will permanently delete all wallet data from this device. Make sure you have backed up your seed phrases before proceeding.
            </p>
            <div
              className="p-4 mb-6 rounded-md"
              style={{ background: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.2)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>
                This action cannot be undone!
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setShowResetModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleReset} style={{ flex: 1, background: 'var(--error)', borderColor: 'var(--error)' }}>
                Reset Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
