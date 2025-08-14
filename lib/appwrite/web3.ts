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

export async function requestSignature(_address: string, message: string): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Must be used in browser');
  const anyWindow = window as any;
  if (!anyWindow.ethereum) throw new Error('No injected provider');
  const provider = new (ethers as any).providers.Web3Provider(anyWindow.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const sig = await signer.signMessage(message);
  return sig;
}

export function recoverAddress(message: string, signature: string) {
  // ethers may have different exports depending on build; access utils dynamically
  const utils = (ethers as any).utils || (ethers as any).ethers?.utils;
  if (!utils) throw new Error('ethers.utils not available');
  return utils.verifyMessage(message, signature);
}
