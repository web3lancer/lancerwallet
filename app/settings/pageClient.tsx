"use client";
import React, { useState } from 'react';
import ThemeSelector from "../components/ThemeSelector";

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

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const sections = [
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
    // Mock backup functionality
    alert('Backup functionality would be implemented here');
  };

  const handleRestore = () => {
    // Mock restore functionality
    alert('Restore functionality would be implemented here');
  };

  const handleReset = () => {
    setShowResetModal(false);
    // Mock reset functionality
    alert('Wallet reset functionality would be implemented here');
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Settings
        </h1>
        <p className="text-base text-secondary">
          Customize your wallet preferences and security settings
        </p>
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
                    activeSection === section.id
                      ? 'bg-purple-500 text-white'
                      : 'text-secondary hover:bg-surface-hover'
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
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">
                      Theme
                    </label>
                    <ThemeSelector />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">
                      Currency
                    </label>
                    <select className="input" style={{ maxWidth: '200px' }}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary mb-2 block">
                      Language
                    </label>
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
                    <label className="text-sm font-medium text-secondary mb-2 block">
                      Default Network
                    </label>
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
                          style={{
                            background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)'
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-primary mb-4">Backup & Recovery</h3>
                <div className="space-y-4">
                  <button 
                    className="btn-secondary"
                    onClick={handleBackup}
                    style={{ width: '100%' }}
                  >
                    💾 Backup Wallet
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleRestore}
                    style={{ width: '100%' }}
                  >
                    📥 Restore from Backup
                  </button>
                  <button 
                    className="btn-secondary"
                    style={{ 
                      width: '100%',
                      background: 'rgba(244, 67, 54, 0.1)',
                      borderColor: 'rgba(244, 67, 54, 0.2)',
                      color: 'var(--error)'
                    }}
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
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={() => toggleSetting(setting.id)}
                        className="sr-only peer"
                      />
                      <div 
                        className="w-11 h-6 rounded-full peer-checked:bg-purple-500 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{
                          background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)'
                        }}
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
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={() => toggleSetting(setting.id)}
                        className="sr-only peer"
                      />
                      <div 
                        className="w-11 h-6 rounded-full peer-checked:bg-purple-500 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{
                          background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)'
                        }}
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
                        <input
                          type="checkbox"
                          checked={setting.enabled}
                          onChange={() => toggleSetting(setting.id)}
                          className="sr-only peer"
                        />
                        <div 
                          className="w-11 h-6 rounded-full peer-checked:bg-purple-500 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            background: setting.enabled ? 'var(--purple-500)' : 'var(--surface-pressed)'
                          }}
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
                    <label className="text-sm font-medium text-secondary mb-2 block">
                      Default Gas Price
                    </label>
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

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-primary mb-4">
              ⚠️ Reset Wallet
            </h3>
            <p className="text-base text-secondary mb-6">
              This will permanently delete all wallet data from this device. Make sure you have backed up your seed phrases before proceeding.
            </p>
            <div 
              className="p-4 mb-6 rounded-md"
              style={{
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.2)'
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>
                This action cannot be undone!
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                className="btn-secondary"
                onClick={() => setShowResetModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleReset}
                style={{ 
                  flex: 1,
                  background: 'var(--error)',
                  borderColor: 'var(--error)'
                }}
              >
                Reset Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
