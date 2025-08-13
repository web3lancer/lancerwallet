import Image from "next/image";

import Skeleton from "./components/Skeleton";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">LancerWallet</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Welcome to LancerWallet, the open-source crypto wallet inspired by TrustWallet. Securely manage your digital assets with a modern, community-driven interface.
      </p>
      <Skeleton height={40} className="mb-4" />
      <Skeleton height={80} />
    </div>
  );
}
