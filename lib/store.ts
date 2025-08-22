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

  setUser: (user: Models.User<Models.Preferences> | null) => void;
  loadActiveWallet: (mnemonic: string) => void;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  activeWallet: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  loadActiveWallet: (mnemonic: string) => {
    set({ isLoading: true, error: null });
    try {
      const walletKeys = importWalletFromMnemonic(mnemonic);
      const walletData: WalletData = {
        address: walletKeys.address,
        privateKey: walletKeys.privateKey,
        mnemonic: walletKeys.mnemonic, // Store mnemonic for the session
        name: `Wallet ${walletKeys.address.slice(0, 6)}...`,
        network: 'ethereum', // Default network
      };
      set({ activeWallet: walletData, isLoading: false });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error: `Failed to load wallet: ${errorMessage}`, isLoading: false });
    }
  },

  logout: async () => {
    await serverLogout();
    // Clear all sensitive user and wallet state
    set({ user: null, activeWallet: null, error: null, isAuthenticated: false });
  },
}));
