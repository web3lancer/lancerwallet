'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative text-center fade-in overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center noise-bg"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
        }}
      />
      <div className="relative z-10" style={{
        padding: 'var(--space-16) var(--space-6)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <motion.h1
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            lineHeight: '52px',
            letterSpacing: '-1.25px',
            color: 'var(--text-primary)'
          }}
        >
          A beautiful, secure open-source crypto wallet
        </motion.h1>
        <motion.p
          className="text-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            lineHeight: '28px',
            letterSpacing: '-0.25px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto var(--space-8) auto'
          }}
        >
          LancerWallet is a community-driven wallet focused on security,
          simplicity, and a delightful user experience across devices.
        </motion.p>
        <motion.div
          className="flex justify-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a
            href="/onboarding"
            className="btn-primary glass"
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '18px',
              padding: 'var(--space-5) var(--space-8)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-deep-2)',
            }}
          >
            Enter App
          </a>
          <a
            href="#features"
            className="btn-secondary glass"
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '18px',
              padding: 'var(--space-5) var(--space-8)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-deep-2)',
            }}
          >
            Learn more
          </a>
        </motion.div>
      </div>
      <motion.div
        className="relative z-0"
        animate={{
          translateY: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img
          src="https://firebasestorage.googleapis.com/v0/b/lancer-39631.appspot.com/o/app-mockup.png?alt=media&token=e47c1b17-a060-4416-a791-7d1a52f4a56c"
          alt="LancerWallet app mockup"
          width={800}
          height={600}
        />
      </motion.div>
    </section>
  );
}