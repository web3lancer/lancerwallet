"use client";
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import React, { useState, useEffect } from 'react';

function WalletCard3D({ theme }: { theme: 'light' | 'dark' }) {
  // 3D wallet card mesh
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.8, 1.6, 0.18]} />
      <meshStandardMaterial
        color={theme === 'dark' ? '#7C5AFF' : '#B8A394'}
        metalness={0.7}
        roughness={0.3}
      />
      {/* Overlay wallet info in 3D */}
      <Html center style={{ width: '90%', height: '90%' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: theme === 'dark' ? '#FAF7F4' : '#2D1B15',
            fontWeight: 600,
            fontSize: 20,
            textShadow: '0 2px 8px rgba(45,27,21,0.15)',
          }}
        >
          <span>Wallet Name</span>
          <span style={{ fontSize: 14, opacity: 0.7 }}>0x1234...abcd</span>
          <span style={{ fontSize: 24, marginTop: 8 }}>$12,345.67</span>
        </div>
      </Html>
    </mesh>
  );
}

export default function WalletsPageClient() {
  // Simulate loading state
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    // Simulate loading for 1s
    const timer = setTimeout(() => setLoading(false), 1000);
    // Read theme/animation from localStorage or system
    const storedTheme = localStorage.getItem('lancerwallet-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') setTheme(storedTheme);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setAnimationsEnabled(!reducedMotion);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6" style={{ minHeight: '100vh', background: theme === 'dark' ? '#2D1B15' : '#FAF7F4' }}>
      <h2 className="text-2xl font-bold mb-8" style={{ color: theme === 'dark' ? '#FAF7F4' : '#2D1B15' }}>Wallets</h2>
      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animationsEnabled ? 0.3 : 0.01 }}
          style={{ maxWidth: 400, margin: '0 auto' }}
        >
          <Skeleton height={120} className="rounded-2xl mb-6" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animationsEnabled ? 0.3 : 0.01 }}
          style={{ maxWidth: 400, margin: '0 auto', boxShadow: '0 10px 20px rgba(45,27,21,0.19), 0 6px 6px rgba(45,27,21,0.23)' }}
        >
          <Canvas
            style={{ width: '100%', height: 220, borderRadius: 20, background: theme === 'dark' ? '#1F1611' : '#FFFFFF' }}
            shadows
            camera={{ position: [0, 0, 5], fov: 50 }}
          >
            <ambientLight intensity={0.7} />
            <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={1.2} castShadow />
            <WalletCard3D theme={theme} />
          </Canvas>
        </motion.div>
      )}
      {/* Accessibility: ARIA label for wallet card */}
      <div aria-label="Wallet card" tabIndex={0} style={{ outline: 'none', marginTop: 32 }} />
    </div>
  );
}
