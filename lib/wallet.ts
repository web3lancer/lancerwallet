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
  return ethers.Mnemonic.isValid(mnemonic);
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
