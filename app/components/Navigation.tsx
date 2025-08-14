"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Link from 'next/link';

const navItems = [
  { name: "Home", icon: "🏠", href: "/home" },
  { name: "Wallets", icon: "👛", href: "/wallets" },
  { name: "Send", icon: "💸", href: "/send" },
  { name: "DeFi", icon: "🌐", href: "/defi" },
  { name: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation entirely on landing page (/)
  if (pathname === "/") return null;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 md:hidden"
        style={{
          background: 'var(--surface-elevated)',
          borderTop: '1px solid var(--border-default)',
          boxShadow: '0 -2px 10px rgba(45, 27, 21, 0.1)',
          height: '80px',
          padding: 'var(--space-2) var(--space-4)'
        }}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo size={32} />
            </Link>
          </div>
          <div className="flex gap-6 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center text-xs transition-colors ${
                  pathname === item.href 
                    ? 'text-purple-500' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                style={{ 
                  color: pathname === item.href ? 'var(--purple-500)' : 'var(--text-secondary)',
                  minHeight: '44px',
                  minWidth: '44px',
                  justifyContent: 'center'
                }}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span style={{ fontSize: '10px' }}>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside 
        className="hidden md:flex fixed left-0 top-0 h-full z-50 flex-col"
        style={{
          width: '240px',
          background: 'var(--surface-elevated)',
          borderRight: '1px solid var(--border-default)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-2)'
        }}
      >
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Link href="/" className="flex items-center gap-3" aria-label="Lancer Wallet">
            <Logo size={44} />
            <span 
              style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                letterSpacing: '-0.25px'
              }}
            >
              Lancer
            </span>
          </Link>
        </div>
        
        <nav className="flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg transition-all duration-200 ${
                pathname === item.href ? 'font-semibold' : ''
              }`}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-2)',
                fontSize: '16px',
                color: pathname === item.href ? 'var(--purple-600)' : 'var(--text-secondary)',
                backgroundColor: pathname === item.href ? 'var(--surface-hover)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                minHeight: '48px'
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

