'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: 'var(--space-8) var(--space-6)',
        background: 'transparent',
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center gap-6 mb-4">
          <a href="https://github.com/your-repo" className="text-gray-500 hover:text-gray-700">
            <Github size={24} />
          </a>
          <a href="https://twitter.com/your-handle" className="text-gray-500 hover:text-gray-700">
            <Twitter size={24} />
          </a>
          <a href="https://discord.gg/your-server" className="text-gray-500 hover:text-gray-700">
            <MessageSquare size={24} />
          </a>
        </div>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-tertiary)'
        }}>
          © {new Date().getFullYear()} LancerWallet — Open source and community maintained.
        </p>
      </div>
    </motion.footer>
  );
}