import { create } from 'zustand';
import { Models } from 'appwrite';
import { 
  WalletData, 
  getDecryptedWallets, 
  saveEncryptedWallet, 
  createWalletFromMnemonic, 
  generateMnemonic,
  saveWalletToLocal,
  getWalletsFromLocal
} from './wallet';
import { logout as serverLogout } from '@/app/auth/actions';

interface AppState {
  user: Models.User<Models.Preferences> | null;
  wallets: WalletData[];
  password?: string; // Stored in memory for the session
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setUser: (user: Models.User<Models.Preferences> | null) => void;
  unlockWallets: (password: string) => Promise<boolean>;
  lockWallets: () => void;
  loadLocalWallets: () => void;
  createNewWallet: () => Promise<void>;
  logout: () => Promise<void>;
  backupWalletsToAppwrite: (password: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  wallets: [],
  password: undefined,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  unlockWallets: async (password: string) => {
    const { user } = get();
    
    set({ isLoading: true, error: null });
    try {
      let wallets: WalletData[] = [];
      
      if (user) {
        // User is authenticated - load from Appwrite
        wallets = await getDecryptedWallets(password, user.$id);
      } else {
        // User is not authenticated - load from localStorage
        wallets = getWalletsFromLocal();
      }
      
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

  loadLocalWallets: () => {
    const wallets = getWalletsFromLocal();
    set({ wallets });
  },

  createNewWallet: async () => {
    const { user, password } = get();

    set({ isLoading: true, error: null });
    try {
      const mnemonic = generateMnemonic();
      const newWallet = await createWalletFromMnemonic(mnemonic, 'ethereum');

      if (user && password) {
        // Save to Appwrite if authenticated
        await saveEncryptedWallet(newWallet, password, user.$id);
      } else {
        // Save to localStorage if not authenticated
        saveWalletToLocal(newWallet);
      }

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

  backupWalletsToAppwrite: async (password: string) => {
    const { user, wallets } = get();
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      for (const wallet of wallets) {
        await saveEncryptedWallet(wallet, password, user.$id);
      }
      set({ isLoading: false });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error: `Failed to backup wallets. ${errorMessage}`, isLoading: false });
    }
  },

  logout: async () => {
    await serverLogout();
    set({ user: null, wallets: [], password: undefined, error: null, isAuthenticated: false });
  },
}));
