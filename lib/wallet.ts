import { ethers } from 'ethers';

// --- Core Interfaces ---
export interface WalletKeys {
  address: string;
  privateKey: string;
  mnemonic: string;
}

export interface WalletData {
  address: string;
  name: string;
  network: string;
  balance?: string;
  balanceUSD?: number;
  privateKey?: string;
}

// --- Provider Configuration ---
const RPC_URLS = {
  ethereum: 'https://eth.llamarpc.com',
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed1.binance.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc'
};

export function getProvider(network: string = 'ethereum'): ethers.JsonRpcProvider {
  const rpcUrl = RPC_URLS[network as keyof typeof RPC_URLS] || RPC_URLS.ethereum;
  return new ethers.JsonRpcProvider(rpcUrl);
}

// --- Wallet Generation & Import ---

/**
 * Generates a new random mnemonic phrase.
 * @returns A 12-word mnemonic string.
 */
export function generateMnemonic(): string {
  const wallet = ethers.Wallet.createRandom();
  return wallet.mnemonic?.phrase || '';
}

/**
 * Validates a mnemonic phrase.
 * @param mnemonic The mnemonic phrase to validate.
 * @returns True if the mnemonic is valid, false otherwise.
 */
export function validateMnemonic(mnemonic: string): boolean {
  try {
    ethers.Mnemonic.fromPhrase(mnemonic);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a new wallet, generating a new mnemonic.
 * @returns A WalletKeys object containing the address, private key, and mnemonic.
 */
export function generateNewWallet(): WalletKeys {
    const mnemonic = generateMnemonic();
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: mnemonic,
    };
}

/**
 * Imports a wallet from an existing mnemonic phrase.
 * @param mnemonic The 12 or 24-word mnemonic phrase.
 * @returns A WalletKeys object. Throws an error if the mnemonic is invalid.
 */
export function importWalletFromMnemonic(mnemonic: string): WalletKeys {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase.');
  }
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: mnemonic,
  };
}

// --- Cryptographic Operations ---

/**
 * Signs an arbitrary message with a private key.
 * This is essential for nonce-based authentication.
 * @param privateKey The private key to sign with.
 * @param message The message to sign.
 * @returns The signature string.
 */
export async function signMessage(privateKey: string, message: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.signMessage(message);
}

/**
 * Recovers the address from a signature and message.
 * Used on the server to verify the sender's identity.
 * @param message The original message that was signed.
 * @param signature The signature to verify.
 * @returns The recovered Ethereum address.
 */
export function recoverAddress(message: string, signature: string): string {
    return ethers.verifyMessage(message, signature);
}


// --- On-Chain Interactions ---

export async function getWalletBalance(address: string, network: string = 'ethereum'): Promise<{ balance: string; balanceUSD: number }> {
  try {
    const provider = getProvider(network);
    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);
    // TODO: Replace with a real-time price feed
    const ethPrice = 2400;
    const balanceUSD = parseFloat(balanceEth) * ethPrice;
    return { balance: balanceEth, balanceUSD };
  } catch(e) {
    console.error("Failed to get wallet balance:", e);
    return { balance: '0', balanceUSD: 0 };
  }
}

export async function sendTransaction(
  privateKey: string,
  to: string,
  amount: string, // amount in ETH
  network: string = 'ethereum'
): Promise<string> {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    return tx.hash;
  } catch(e) {
    console.error("Failed to send transaction:", e);
    throw new Error('Failed to send transaction');
  }
}

// --- Wallet Storage & Management ---

/**
 * Creates a WalletData object from a mnemonic phrase
 * @param mnemonic The mnemonic phrase
 * @param network The network (default: ethereum)
 * @returns WalletData object
 */
export async function createWalletFromMnemonic(
  mnemonic: string, 
  network: string = 'ethereum'
): Promise<WalletData> {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase.');
  }
  
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return {
    address: wallet.address,
    name: `Wallet ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
    network: network
  };
}

/**
 * Saves a wallet to localStorage
 * @param wallet The wallet data to save
 */
export function saveWalletToLocal(wallet: WalletData): void {
  try {
    const existingWallets = getWalletsFromLocal();
    const updatedWallets = [...existingWallets, wallet];
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
  } catch (error) {
    console.error('Failed to save wallet to localStorage:', error);
    throw new Error('Failed to save wallet locally');
  }
}

/**
 * Gets wallets from localStorage
 * @returns Array of WalletData
 */
export function getWalletsFromLocal(): WalletData[] {
  try {
    if (typeof window === 'undefined') return [];
    const walletsJson = localStorage.getItem('wallets');
    if (!walletsJson) return [];
    return JSON.parse(walletsJson) as WalletData[];
  } catch (error) {
    console.error('Failed to get wallets from localStorage:', error);
    return [];
  }
}

/**
 * Gets decrypted wallets from Appwrite (placeholder implementation)
 * @param _password The decryption password (unused in current implementation)
 * @param userId The user ID
 * @returns Array of WalletData
 */
export async function getDecryptedWallets(
  _password: string, 
  userId: string
): Promise<WalletData[]> {
  // TODO: Implement Appwrite integration for encrypted wallet storage
  console.log('getDecryptedWallets called with userId:', userId);
  return [];
}

/**
 * Saves encrypted wallet to Appwrite (placeholder implementation)
 * @param wallet The wallet to save
 * @param _password The encryption password (unused in current implementation)
 * @param userId The user ID
 */
export async function saveEncryptedWallet(
  wallet: WalletData, 
  _password: string, 
  userId: string
): Promise<void> {
  // TODO: Implement Appwrite integration for encrypted wallet storage
  console.log('saveEncryptedWallet called for wallet:', wallet.address, 'userId:', userId);
}
