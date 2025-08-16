"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  variant?: 'default' | 'elevated' | 'wallet' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false,
  children,
  className = '',
  onClick
}: CardProps) {
  const baseClasses = 'rounded-xl border transition-all';
  
  const variantClasses = {
    default: 'bg-surface-elevated border-border-default shadow-sm',
    elevated: 'bg-surface-elevated border-border-default shadow-md',
    wallet: 'bg-gradient-to-br from-purple-500 to-purple-700 border-none shadow-lg text-white',
    glass: 'glass border-white/20 shadow-lg'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:transform hover:scale-[1.02]' : '';
  const interactiveClasses = interactive ? 'cursor-pointer interactive' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    interactiveClasses,
    className
  ].filter(Boolean).join(' ');

  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  } : {};

  return (
    <Component
      className={classes}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}