"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Link from 'next/link';

const navItems = [
  { name: "Home", icon: "🏠", href: "/home", description: "Main dashboard with portfolio overview" },
  { name: "Wallets", icon: "👛", href: "/wallets", description: "Manage multiple wallets and accounts" },
  { name: "Send", icon: "💸", href: "/send", description: "Send and receive cryptocurrency" },
  { name: "DeFi", icon: "🌐", href: "/defi", description: "Decentralized finance protocols" },
  { name: "Settings", icon: "⚙️", href: "/settings", description: "App settings and preferences" },
];

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation entirely on landing page and onboarding
  if (pathname === "/" || pathname === "/onboarding") return null;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 md:hidden"
        style={{
          background: 'var(--surface-elevated)',
          borderTop: '1px solid var(--border-default)',
          boxShadow: '0 -2px 10px rgba(45, 27, 21, 0.1)',
          height: 'var(--bottombar-height)',
          padding: 'var(--space-2) var(--space-4)'
        }}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" aria-label="Lancer Wallet Home">
              <Logo size={32} />
            </Link>
          </div>
          <div className="flex gap-2 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center transition-all"
                  style={{
                    color: isActive ? 'var(--purple-500)' : 'var(--text-secondary)',
                    minHeight: '48px',
                    minWidth: '48px',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-1)',
                    backgroundColor: isActive ? 'rgba(124, 90, 255, 0.1)' : 'transparent',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all var(--transition-normal) ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  aria-label={item.description}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside 
        className="hidden md:flex fixed left-0 top-0 h-full z-50 flex-col"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--surface-elevated)',
          borderRight: '1px solid var(--border-default)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-2)'
        }}
      >
        {/* Logo section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-all hover:scale-105" 
            aria-label="Lancer Wallet Home"
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--transition-normal) ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Logo size={44} />
            <span 
              style={{ 
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.25px'
              }}
            >
              Lancer
            </span>
          </Link>
        </div>
        
        {/* Navigation items */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="nav-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--purple-500)' : 'transparent',
                  boxShadow: isActive ? 'var(--shadow-2)' : 'none',
                  transition: 'all var(--transition-normal) ease-in-out',
                  textDecoration: 'none',
                  minHeight: '48px',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-1)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--purple-600)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--purple-500)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-2)';
                  }
                }}
                aria-label={item.description}
                title={item.description}
              >
                <span 
                  className="text-xl" 
                  style={{ 
                    opacity: isActive ? 1 : 0.8,
                    transition: 'opacity var(--transition-normal) ease-in-out'
                  }}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section - could add user profile or quick actions */}
        <div 
          style={{ 
            marginTop: 'auto', 
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border-default)'
          }}
        >
          <div 
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-hover)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

