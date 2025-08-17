import { create } from 'zustand';
import { Models } from 'appwrite';
import { WalletData, getDecryptedWallets, saveEncryptedWallet, createWalletFromMnemonic, generateMnemonic } from './wallet';
import { logout as serverLogout } from '@/app/auth/actions';

interface AppState {
  user: Models.User<Models.Preferences> | null;
  wallets: WalletData[];
  password?: string; // Stored in memory for the session
  isLoading: boolean;
  error: string | null;

  setUser: (user: Models.User<Models.Preferences> | null) => void;
  unlockWallets: (password: string) => Promise<boolean>;
  lockWallets: () => void;
  createNewWallet: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  wallets: [],
  password: undefined,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  unlockWallets: async (password: string) => {
    const { user } = get();
    if (!user) {
      set({ error: 'User not logged in.' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const wallets = await getDecryptedWallets(password, user.$id);
      set({ wallets, password, isLoading: false });
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error: `Failed to decrypt wallets. ${errorMessage}`, isLoading: false });
      return false;
    }
  },

  lockWallets: () => {
    set({ wallets: [], password: undefined, error: null });
  },

  createNewWallet: async () => {
    const { user, password } = get();
    if (!user || !password) {
      set({ error: 'User is not logged in or wallet is locked.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const mnemonic = generateMnemonic();
      const newWallet = await createWalletFromMnemonic(mnemonic, 'ethereum');

      // Save to Appwrite
      await saveEncryptedWallet(newWallet, password, user.$id);

      // Update state
      set(state => ({
        wallets: [...state.wallets, newWallet],
        isLoading: false,
      }));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error: `Failed to create wallet. ${errorMessage}`, isLoading: false });
    }
  },

  logout: async () => {
    await serverLogout();
    set({ user: null, wallets: [], password: undefined, error: null });
  },
}));
