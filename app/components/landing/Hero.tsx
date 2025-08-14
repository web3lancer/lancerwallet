export default function Hero() {
  return (
    <section className="py-16 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-4">A beautiful, secure open-source crypto wallet</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">LancerWallet is a community-driven wallet focused on security, simplicity, and a delightful user experience across devices.</p>
      <div className="flex justify-center gap-4">
        <a href="/home" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-purple-700">Enter App</a>
        <a href="#features" className="border px-6 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Learn more</a>
      </div>
    </section>
  );
}
