"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Link from 'next/link';

const navItems = [
  { name: "Home", icon: "🏠", href: "/home" },
  { name: "Wallets", icon: "👛", href: "/wallets" },
  { name: "Send/Receive", icon: "💸", href: "/send" },
  { name: "DeFi", icon: "🌐", href: "/defi" },
  { name: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation entirely on landing page (/)
  if (pathname === "/") return null;

  return (
    <>
      {/* Mobile bottom nav: visible on small screens, hidden on md+ */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-between px-4 py-2 z-50 md:hidden">
        <div className="flex items-center px-3">
          <Link href="/" className="flex items-center">
            <Logo size={36} />
          </Link>
        </div>
        <div className="flex gap-4 flex-1 justify-center">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center text-xs ${pathname === item.href ? "text-blue-600" : "text-gray-500"}`}
            >
              <span className="text-2xl">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </div>
        <div className="w-10" />
      </nav>

      {/* Desktop aside nav: hidden on small screens, visible on md+ */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex-col py-8 px-4 z-50">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={44} />
            <span className="font-bold text-lg">Lancer</span>
          </Link>
        </div>
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 mb-6 text-base ${pathname === item.href ? "text-blue-600 font-bold" : "text-gray-700 dark:text-gray-300"}`}
          >
            <span className="text-2xl">{item.icon}</span>
            {item.name}
          </a>
        ))}
      </aside>
    </>
  );
}

