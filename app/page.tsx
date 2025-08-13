import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold mb-4">LancerWallet</h1>
        <p className="text-lg mb-8 text-center max-w-xl">
          Welcome to LancerWallet, the open-source crypto wallet inspired by TrustWallet. Securely manage your digital assets with a modern, community-driven interface.
        </p>
        <ul className="font-mono list-inside list-disc text-sm/6 text-center sm:text-left mb-8">
          <li>Multi-chain support (EVM, Solana, and more)</li>
          <li>Secure key management</li>
          <li>Send, receive, and swap tokens</li>
          <li>Open-source and privacy-focused</li>
        </ul>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://github.com/lancerwallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-xs text-gray-500">&copy; {new Date().getFullYear()} LancerWallet. Open-source. MIT License.</span>
      </footer>
    </div>
  );
}
