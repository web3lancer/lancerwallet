import Link from 'next/link';

export default function Landing() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-6">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4">LancerWallet</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          A modern, community-driven open-source crypto wallet. Securely manage your digital assets with a simple, beautiful interface.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/home" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm hover:bg-purple-700">
            Enter App
          </Link>
          <a href="#" className="border border-gray-200 px-6 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
            Learn more
          </a>
        </div>
      </div>
    </main>
  );
}
