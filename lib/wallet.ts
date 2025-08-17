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

export async function createWalletFromMnemonic(mnemonic: string, network: string = 'ethereum'): Promise<WalletData> {
  try {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const provider = getProvider(network);
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
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

export function generateMnemonic(): string {
  return ethers.Wallet.createRandom().mnemonic?.phrase || '';
}

export function validateMnemonic(mnemonic: string): boolean {
  try {
    ethers.Wallet.fromPhrase(mnemonic);
    return true;
  } catch {
    return false;
  }
}

export async function getWalletBalance(address: string, network: string = 'ethereum'): Promise<{ balance: string; balanceUSD: number }> {
  try {
    const provider = getProvider(network);
    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);
    const ethPrice = 2400;
    const balanceUSD = parseFloat(balanceEth) * ethPrice;
    return { balance: balanceEth, balanceUSD };
  } catch {
    return { balance: '0', balanceUSD: 0 };
  }
}

export async function getTransactionHistory(): Promise<Transaction[]> {
  try {
    return [];
  } catch {
    return [];
  }
}

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

export async function saveEncryptedWallet(walletData: WalletData, userPassword: string, userId: string): Promise<void> {
  if (!walletData.privateKey) {
    throw new Error('Private key is required to save an encrypted wallet.');
  }
  const encryptedWallet = encryptData(walletData, userPassword);
  const databases = AppwriteSDK.adminDatabases;
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

export async function getDecryptedWallets(userPassword: string, userId: string): Promise<WalletData[]> {
  const databases = AppwriteSDK.adminDatabases;
  const response = await databases.listDocuments(
    AppwriteSDK.config.databaseId,
    AppwriteSDK.config.collectionId,
    [Query.equal('userId', userId)]
  );
  const decryptedWallets = response.documents.map((doc: any) => {
    const decrypted = decryptData<WalletData>(doc.encryptedWalletData, userPassword);
    if (!decrypted) {
      console.error(`Failed to decrypt wallet ${doc.address}. The password may be incorrect.`);
      return null;
    }
    return decrypted;
  }).filter((w: WalletData | null): w is WalletData => w !== null);
  return decryptedWallets;
}

export function saveWalletToLocal(wallet: WalletData) {
  const wallets: WalletData[] = JSON.parse(localStorage.getItem('wallets') || '[]');
  if (!wallets.find((w: WalletData) => w.address === wallet.address)) {
    wallets.push(wallet);
    localStorage.setItem('wallets', JSON.stringify(wallets));
  }
}

export function getWalletsFromLocal(): WalletData[] {
  return JSON.parse(localStorage.getItem('wallets') || '[]');
}
