export default function Footer() {
  return (
    <footer className="py-8 px-6 text-center text-sm text-gray-500">
      <div className="max-w-3xl mx-auto">
        <p>© {new Date().getFullYear()} LancerWallet — Open source and community maintained.</p>
      </div>
    </footer>
  );
}
