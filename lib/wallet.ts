import { ethers } from 'ethers';

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

// Storage utilities for wallets
export function saveWalletToStorage(wallet: WalletData): void {
  const wallets = getWalletsFromStorage();
  const updatedWallets = wallets.filter(w => w.address !== wallet.address);
  updatedWallets.push(wallet);
  localStorage.setItem('wallets', JSON.stringify(updatedWallets));
}

export function getWalletsFromStorage(): WalletData[] {
  try {
    const walletsData = localStorage.getItem('wallets');
    return walletsData ? JSON.parse(walletsData) : [];
  } catch {
    return [];
  }
}

export function removeWalletFromStorage(address: string): void {
  const wallets = getWalletsFromStorage();
  const updatedWallets = wallets.filter(w => w.address !== address);
  localStorage.setItem('wallets', JSON.stringify(updatedWallets));
}

// Get total portfolio value
export async function getPortfolioValue(): Promise<{ totalValue: number; change24h: number }> {
  const wallets = getWalletsFromStorage();
  let totalValue = 0;
  
  for (const wallet of wallets) {
    const { balanceUSD } = await getWalletBalance(wallet.address, wallet.network);
    totalValue += balanceUSD;
  }
  
  // Mock 24h change (in real app, compare with stored historical data)
  const change24h = Math.random() * 10 - 5; // Random between -5% and +5%
  
  return { totalValue, change24h };
}

// Get token balances for an address (requires token contract calls)
export async function getTokenBalances(): Promise<TokenBalance[]> {
  // This would require calling various token contracts
  // For now, return common tokens with zero balance
  return [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '0',
      balanceUSD: 0,
      decimals: 6,
      contractAddress: '0xA0b86a33E6441e81Ac966eeD02C5E57c7d0fB5E5'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      balance: '0',
      balanceUSD: 0,
      decimals: 6,
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
  ];
}