const features = [
  { title: 'Secure by design', desc: 'Local key storage, optional encryption, and clear backup flows.' },
  { title: 'Open source', desc: 'Transparent codebase with community contributions.' },
  { title: 'Multi-chain support', desc: 'Manage assets across multiple blockchains from one place.' },
];

export default function Features() {
  return (
    <section id="features" className="py-12 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold mb-2">{f.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
