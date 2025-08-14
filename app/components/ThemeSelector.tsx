"use client";
import React from 'react';
import useTheme, { Theme } from '../utils/useTheme';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const options: Theme[] = ['system','light','dark'];
  return (
    <div className="flex items-center gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => setTheme(o)} className={`px-3 py-1 rounded ${theme===o? 'bg-purple-600 text-white' : 'border bg-white dark:bg-gray-800'}`}>
          {o[0].toUpperCase()+o.slice(1)}
        </button>
      ))}
    </div>
  );
}
