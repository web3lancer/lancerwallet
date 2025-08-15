"use client";
import React, { useState } from 'react';

interface DeFiProtocol {
  id: string;
  name: string;
  description: string;
  icon: string;
  tvl: number;
  apy: number;
  category: 'lending' | 'dex' | 'yield' | 'staking';
  website: string;
}

export default function DeFiPageClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Real DeFi protocols (static data, could be fetched from DeFiPulse API)
  const protocols: DeFiProtocol[] = [
    {
      id: 'uniswap',
      name: 'Uniswap V3',
      description: 'Decentralized exchange and automated market maker',
      icon: '🦄',
      tvl: 6500000000,
      apy: 12.5,
      category: 'dex',
      website: 'https://app.uniswap.org'
    },
    {
      id: 'aave',
      name: 'Aave',
      description: 'Decentralized lending and borrowing protocol',
      icon: '👻',
      tvl: 11200000000,
      apy: 8.2,
      category: 'lending',
      website: 'https://app.aave.com'
    },
    {
      id: 'compound',
      name: 'Compound',
      description: 'Algorithmic money markets protocol',
      icon: '🏛️',
      tvl: 3200000000,
      apy: 6.8,
      category: 'lending',
      website: 'https://app.compound.finance'
    },
    {
      id: 'yearn',
      name: 'Yearn Finance',
      description: 'Yield optimization strategies',
      icon: '🔵',
      tvl: 850000000,
      apy: 15.3,
      category: 'yield',
      website: 'https://yearn.finance'
    },
    {
      id: 'lido',
      name: 'Lido',
      description: 'Liquid staking for Ethereum 2.0',
      icon: '🌊',
      tvl: 32000000000,
      apy: 4.5,
      category: 'staking',
      website: 'https://lido.fi'
    },
    {
      id: 'curve',
      name: 'Curve Finance',
      description: 'Exchange liquidity pool for stablecoins',
      icon: '📈',
      tvl: 4800000000,
      apy: 9.7,
      category: 'dex',
      website: 'https://curve.fi'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Protocols', icon: '🌐' },
    { id: 'lending', name: 'Lending', icon: '🏦' },
    { id: 'dex', name: 'DEX', icon: '🔄' },
    { id: 'yield', name: 'Yield Farming', icon: '🌾' },
    { id: 'staking', name: 'Staking', icon: '🔒' }
  ];

  const filteredProtocols = protocols.filter(protocol => 
    selectedCategory === 'all' || protocol.category === selectedCategory
  );

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`;
    return `$${tvl.toLocaleString()}`;
  };

  const formatAPY = (apy: number) => {
    return `${apy.toFixed(1)}%`;
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          DeFi Hub
        </h1>
        <p className="text-base text-secondary">
          Explore decentralized finance protocols and opportunities
        </p>
      </header>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💰</span>
            <span className="text-sm font-medium text-secondary">Total Value Locked</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {formatTVL(protocols.reduce((sum, p) => sum + p.tvl, 0))}
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📈</span>
            <span className="text-sm font-medium text-secondary">Average APY</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {formatAPY(protocols.reduce((sum, p) => sum + p.apy, 0) / protocols.length)}
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔗</span>
            <span className="text-sm font-medium text-secondary">Protocols</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {protocols.length}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Categories
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-surface-hover text-secondary hover:bg-surface-pressed'
              }`}
              style={{
                background: selectedCategory === category.id ? 'var(--purple-500)' : 'var(--surface-hover)',
                color: selectedCategory === category.id ? 'var(--text-inverse)' : 'var(--text-secondary)'
              }}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Protocols Grid */}
      <section>
        <h2 className="text-xl font-semibold text-primary mb-4">
          Available Protocols
        </h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProtocols.map((protocol) => (
            <div
              key={protocol.id}
              className="card"
              style={{
                transition: 'all var(--transition-normal) ease-in-out',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-2)';
              }}
            >
              {/* Protocol Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--surface-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}
                  >
                    {protocol.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {protocol.name}
                    </h3>
                    <span 
                      className="text-xs px-2 py-1 rounded-md"
                      style={{
                        background: 'rgba(124, 90, 255, 0.1)',
                        color: 'var(--purple-500)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {protocol.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-secondary mb-4">
                {protocol.description}
              </p>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">TVL:</span>
                  <span className="text-sm font-medium text-primary">
                    {formatTVL(protocol.tvl)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">APY:</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--success)' }}
                  >
                    {formatAPY(protocol.apy)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn-primary btn-sm"
                style={{ width: '100%' }}
                onClick={() => window.open(protocol.website, '_blank')}
              >
                🚀 Visit Protocol
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Info Card */}
      <section className="mt-8">
        <div 
          className="card"
          style={{
            background: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.2)'
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--warning)' }}>
                DeFi Safety Notice
              </h3>
              <p className="text-sm" style={{ color: 'var(--warning)' }}>
                DeFi protocols carry risks including smart contract vulnerabilities, impermanent loss, and market volatility. 
                Always do your own research and never invest more than you can afford to lose.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}