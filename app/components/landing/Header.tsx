import Logo from "../Logo";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-6 px-6">
      <div className="flex items-center gap-3">
        <Logo size={36} />
      </div>
      <div>
        <a href="/onboarding" className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700">Enter App</a>
      </div>
    </header>
  );
}
