import { ethers } from 'ethers';

export type Web3ProviderInfo = {
  name: string;
  id: string;
  available: boolean;
};

export function detectInjectedProviders(): Web3ProviderInfo[] {
  const providers: Web3ProviderInfo[] = [];
  if (typeof window === 'undefined') return providers;
  // Basic injected provider detection
  const anyWindow = window as any;
  if (anyWindow.ethereum) {
    // metaMask, etc.
    providers.push({ name: 'Injected', id: 'injected', available: true });
  } else {
    providers.push({ name: 'Injected', id: 'injected', available: false });
  }
  return providers;
}

export async function requestSignature(address: string, message: string): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Must be used in browser');
  const anyWindow = window as any;
  if (!anyWindow.ethereum) throw new Error('No injected provider');
  const provider = new ethers.providers.Web3Provider(anyWindow.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const sig = await signer.signMessage(message);
  return sig;
}

export function recoverAddress(message: string, signature: string) {
  return ethers.utils.verifyMessage(message, signature);
}
