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
  const win = window as Window & { ethereum?: import('ethers').Eip1193Provider };
  if (win.ethereum) {
    // metaMask, etc.
    providers.push({ name: 'Injected', id: 'injected', available: true });
  } else {
    providers.push({ name: 'Injected', id: 'injected', available: false });
  }
  return providers;
}

export async function requestSignature(_address: string, message: string): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Must be used in browser');
  const win = window as Window & { ethereum?: import('ethers').Eip1193Provider };
  if (!win.ethereum) throw new Error('No injected provider');
  const provider = new ethers.BrowserProvider(win.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const sig = await (await signer).signMessage(message);
  return sig;
}

export function recoverAddress(message: string, signature: string) {
  // ethers may have different exports depending on build; access utils dynamically
  return ethers.verifyMessage(message, signature);
}
