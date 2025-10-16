'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Code, Link } from 'lucide-react';

const features = [
  {
    title: 'Secure by design',
    desc: 'Local key storage, optional encryption, and clear backup flows.',
    icon: <ShieldCheck size={32} />
  },
  {
    title: 'Open source',
    desc: 'Transparent codebase with community contributions.',
    icon: <Code size={32} />
  },
  {
    title: 'Multi-chain support',
    desc: 'Manage assets across multiple blockchains from one place.',
    icon: <Link size={32} />
  },
];

export default function Features() {
  return (
    <section id="features" style={{
      padding: 'var(--space-16) var(--space-6)',
      background: 'var(--bg-tertiary)'
    }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="p-6 rounded-xl glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            whileHover={{ y: -5 }}
            style={{
              boxShadow: 'var(--shadow-deep-2)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full mb-4"
              style={{
                background: 'var(--purple-500)',
                color: 'var(--text-inverse)'
              }}
            >
              {f.icon}
            </div>
            <h4 className="font-semibold mb-2" style={{
              color: 'var(--text-primary)'
            }}>{f.title}</h4>
            <p className="text-sm" style={{
              color: 'var(--text-secondary)'
            }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}