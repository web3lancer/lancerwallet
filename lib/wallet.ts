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

// ...rest of your wallet logic, all functions should be exported...
