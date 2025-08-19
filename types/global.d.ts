declare global {
  interface EthereumProvider {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
  }

  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
