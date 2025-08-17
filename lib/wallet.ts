import { ethers } from 'ethers';
import { AppwriteSDK, ID } from './appwrite';
import { encryptData, decryptData } from './crypto';
import { Query } from 'appwrite';

export interface WalletData {
  address: string;
  name: string;
  balance: string;
  balanceUSD: number;
  network: string;
  privateKey?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'send' | 'receive';
  gasUsed?: string;
  gasPrice?: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: number;
  decimals: number;
  contractAddress?: string;
}

// Default RPC providers for different networks
const RPC_URLS = {
  ethereum: 'https://eth.llamarpc.com',
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed1.binance.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc'
};

// Get provider for network
export function getProvider(network: string = 'ethereum'): ethers.JsonRpcProvider {
  const rpcUrl = RPC_URLS[network as keyof typeof RPC_URLS] || RPC_URLS.ethereum;
  return new ethers.JsonRpcProvider(rpcUrl);
}

// Generate a new wallet from mnemonic
export async function createWalletFromMnemonic(mnemonic: string, network: string = 'ethereum'): Promise<WalletData> {
  try {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const provider = getProvider(network);
    
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    
    // Mock USD conversion (in real app, fetch from price API)
    const ethPrice = 2400; // Placeholder
    const balanceUSD = parseFloat(balanceEth) * ethPrice;

    return {
      address: wallet.address,
      name: `Wallet ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
      balance: balanceEth,
      balanceUSD,
      network,
      privateKey: wallet.privateKey
    };
  } catch {
    throw new Error('Failed to create wallet from mnemonic');
  }
}

// Generate new mnemonic
export function generateMnemonic(): string {
  return ethers.Wallet.createRandom().mnemonic?.phrase || '';
}

// Validate mnemonic
export function validateMnemonic(mnemonic: string): boolean {
  try {
    ethers.Wallet.fromPhrase(mnemonic);
    return true;
  } catch {
    return false;
  }
}

// Get wallet balance
export async function getWalletBalance(address: string, network: string = 'ethereum'): Promise<{ balance: string; balanceUSD: number }> {
  try {
    const provider = getProvider(network);
    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);
    
    // Mock USD conversion
    const ethPrice = 2400;
    const balanceUSD = parseFloat(balanceEth) * ethPrice;
    
    return { balance: balanceEth, balanceUSD };
  } catch {
    return { balance: '0', balanceUSD: 0 };
  }
}

// Get transaction history for an address
export async function getTransactionHistory(): Promise<Transaction[]> {
  try {
    // In a real implementation, you'd use an indexing service like Etherscan API
    // For now, return empty array as getting full tx history requires external APIs
    return [];
  } catch {
    return [];
  }
}

// Send transaction
export async function sendTransaction(
  fromPrivateKey: string,
  to: string,
  amount: string,
  network: string = 'ethereum'
): Promise<string> {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    
    return tx.hash;
  } catch {
    throw new Error('Failed to send transaction');
  }
}

/**
 * Saves an encrypted wallet to the Appwrite database for the current user.
 * @param walletData The wallet data to save. The private key should be included.
 * @param userPassword The user's password, used for encryption.
 * @param userId The ID of the logged-in user.
 */
export async function saveEncryptedWallet(walletData: WalletData, userPassword: string, userId: string): Promise<void> {
  if (!walletData.privateKey) {
    throw new Error('Private key is required to save an encrypted wallet.');
  }

  const encryptedWallet = encryptData(walletData, userPassword);
  const databases = await AppwriteSDK.databases;

  await databases.createDocument(
    AppwriteSDK.config.databaseId,
    AppwriteSDK.config.collectionId,
    ID.unique(),
    {
      userId,
      address: walletData.address,
      network: walletData.network,
      encryptedWalletData: encryptedWallet,
    }
  );
}

/**
 * Retrieves and decrypts all wallets for the current user from Appwrite.
 * @param userPassword The user's password, used for decryption.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of wallet data.
 */
export async function getDecryptedWallets(userPassword: string, userId: string): Promise<WalletData[]> {
  const databases = await AppwriteSDK.databases;
  const response = await databases.listDocuments(
    AppwriteSDK.config.databaseId,
    AppwriteSDK.config.collectionId,
    [Query.equal('userId', userId)]
  );

  const decryptedWallets = response.documents.map(doc => {
    const decrypted = decryptData<WalletData>(doc.encryptedWalletData, userPassword);
    if (!decrypted) {
      // This can happen if the password is wrong or data is corrupt.
      // We'll log an error and filter this wallet out.
      console.error(`Failed to decrypt wallet ${doc.address}. The password may be incorrect.`);
      return null;
    }
    return decrypted;
  }).filter((w): w is WalletData => w !== null);

  return decryptedWallets;
}

/**
 * Deletes a wallet from the Appwrite database.
 * @param address The address of the wallet to delete.
 * @param userId The ID of the logged-in user.
 */
export async function deleteWallet(address: string, userId: string): Promise<void> {
    const databases = await AppwriteSDK.databases;
    const response = await databases.listDocuments(
        AppwriteSDK.config.databaseId,
        AppwriteSDK.config.collectionId,
        [
            Query.equal('userId', userId),
            Query.equal('address', address),
        ]
    );

    if (response.documents.length === 0) {
        throw new Error('Wallet not found for the current user.');
    }

    const documentId = response.documents[0].$id;
    await databases.deleteDocument(
        AppwriteSDK.config.databaseId,
        AppwriteSDK.config.collectionId,
        documentId
    );
}