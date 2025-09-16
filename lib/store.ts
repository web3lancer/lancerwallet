import { create } from 'zustand';
import { Models } from 'appwrite';
import { WalletData, importWalletFromMnemonic } from './wallet';
import { logout as serverLogout } from '@/app/auth/actions';

interface AppState {
  user: Models.User<Models.Preferences> | null;
  activeWallet: WalletData | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isLocked: boolean;

  setUser: (user: Models.User<Models.Preferences> | null) => void;
  loadActiveWallet: (mnemonic: string) => void;
  unlockWithPassphrase: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  activeWallet: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isLocked: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  loadActiveWallet: (mnemonic: string) => {
    set({ isLoading: true, error: null });
    try {
      const walletKeys = importWalletFromMnemonic(mnemonic);
      const walletData: WalletData = {
        address: walletKeys.address,
        privateKey: walletKeys.privateKey,
        name: `Wallet ${walletKeys.address.slice(0, 6)}...`,
        network: 'ethereum', // Default network
      };
      set({ activeWallet: walletData, isLoading: false, isLocked: false });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error: `Failed to load wallet: ${errorMessage}`, isLoading: false });
    }
  },

  unlockWithPassphrase: async (passphrase: string) => {
    try {
      set({ isLoading: true, error: null });
      if (typeof window === 'undefined') {
        set({ isLoading: false });
        return false;
      }
      const enc = localStorage.getItem('mnemonic.enc');
      if (!enc) {
        set({ error: 'No encrypted seed found on this device.', isLoading: false });
        return false;
      }
      const { decryptWithPassphrase } = await import('./crypto');
      const data = decryptWithPassphrase<{ mnemonic: string }>(enc, passphrase);
      if (!data?.mnemonic) {
        set({ error: 'Invalid passphrase. Unable to decrypt.', isLoading: false });
        return false;
      }
      const keys = importWalletFromMnemonic(data.mnemonic);
      const walletData: WalletData = {
        address: keys.address,
        privateKey: keys.privateKey,
        name: `Wallet ${keys.address.slice(0, 6)}...`,
        network: 'ethereum',
      };
      set({ activeWallet: walletData, isLocked: false, isLoading: false });
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error: `Failed to unlock: ${errorMessage}`, isLoading: false });
      return false;
    }
  },

  lock: () => {
    set({ activeWallet: null, isLocked: true });
  },

  logout: async () => {
    await serverLogout();
    // Clear all sensitive user and wallet state
    set({ user: null, activeWallet: null, error: null, isAuthenticated: false, isLocked: true });
  },
}));
