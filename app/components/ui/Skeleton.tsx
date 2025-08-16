"use client";
import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'avatar' | 'card' | 'rectangle';
  width?: string | number;
  height?: string | number;
  className?: string;
  shimmer?: boolean;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  shimmer = true
}: SkeletonProps) {
  const baseClasses = 'bg-surface-pressed animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-32 rounded-xl',
    rectangle: 'rounded-lg'
  };
  
  const shimmerClasses = shimmer ? 'skeleton-shimmer' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    shimmerClasses,
    className
  ].filter(Boolean).join(' ');
  
  const style = {
    width: width,
    height: height
  };

  return <div className={classes} style={style} />;
}

// Skeleton group components
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="card" />
    </div>
  );
}

export function SkeletonWallet({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 space-y-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton variant="text" width="120px" height="24px" />
          <Skeleton variant="text" width="180px" height="16px" />
        </div>
        <Skeleton variant="text" width="80px" height="20px" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="text" width="100px" height="16px" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangle" width="80px" height="36px" />
        <Skeleton variant="rectangle" width="80px" height="36px" />
        <Skeleton variant="rectangle" width="80px" height="36px" />
      </div>
    </div>
  );
}