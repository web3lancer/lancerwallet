'use client';

import { motion } from 'framer-motion';
import Logo from "../Logo";

export default function Header() {
  return (
    <motion.header
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: 'var(--space-6)',
        background: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}
    >
      <div className="flex items-center gap-3">
        <Logo size={36} />
      </div>
      <div>
        <a 
          href="/onboarding" 
          className="btn-primary glass"
          style={{
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            boxShadow: 'var(--shadow-deep-1)'
          }}
        >
          Enter App
        </a>
      </div>
    </motion.header>
  );
}