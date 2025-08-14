export default function Header() {
  return (
    <header className="flex items-center justify-between py-6 px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold">LW</div>
        <span className="font-semibold text-lg">LancerWallet</span>
      </div>
      <div>
        <a href="/home" className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700">Enter App</a>
      </div>
    </header>
  );
}
