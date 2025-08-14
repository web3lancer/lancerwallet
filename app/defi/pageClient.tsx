"use client";
import React, { useState, useEffect } from 'react';
import { getWalletsFromStorage } from '../../lib/wallet';

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
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    const loadWallets = () => {
      const storedWallets = getWalletsFromStorage();
      setWallets(storedWallets);
    };
    loadWallets();
  }, []);

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
    {
      id: 'uniswap',
      name: 'Uniswap V3',
      description: 'Decentralized exchange and liquidity provision',
      icon: '🦄',
      tvl: 6500000000,
      apy: 12.5,
      category: 'dex',
      userPosition: {
        deposited: 2500,
        earned: 125.50,
        apr: 12.5
      }
    },
    {
      id: 'aave',
      name: 'Aave',
      description: 'Lending and borrowing protocol',
      icon: '👻',
      tvl: 8200000000,
      apy: 8.2,
      category: 'lending',
      userPosition: {
        deposited: 5000,
        earned: 410.00,
        apr: 8.2
      }
    },
    {
      id: 'compound',
      name: 'Compound',
      description: 'Algorithmic money market protocol',
      icon: '🏛️',
      tvl: 3100000000,
      apy: 6.8,
      category: 'lending'
    },
    {
      id: 'lido',
      name: 'Lido',
      description: 'Liquid staking for Ethereum 2.0',
      icon: '🌊',
      tvl: 32000000000,
      apy: 5.4,
      category: 'staking',
      userPosition: {
        deposited: 8000,
        earned: 432.00,
        apr: 5.4
      }
    },
    {
      id: 'yearn',
      name: 'Yearn Finance',
      description: 'Automated yield farming strategies',
      icon: '💰',
      tvl: 850000000,
      apy: 15.2,
      category: 'yield'
    },
    {
      id: 'curve',
      name: 'Curve Finance',
      description: 'Stablecoin and low-slippage trading',
      icon: '〰️',
      tvl: 4200000000,
      apy: 9.8,
      category: 'dex'
    }
  ];

  const userPositions: UserPosition[] = [
    {
      protocol: 'Uniswap V3',
      type: 'LP Position',
      amount: 2.5,
      value: 2625.50,
      rewards: 125.50,
      apy: 12.5
    },
    {
      protocol: 'Aave',
      type: 'Lending',
      amount: 5000,
      value: 5410.00,
      rewards: 410.00,
      apy: 8.2
    },
    {
      protocol: 'Lido',
      type: 'ETH Staking',
      amount: 8.0,
      value: 8432.00,
      rewards: 432.00,
      apy: 5.4
    }
  ];

  const categories = [
    { id: 'all', name: 'All Protocols', icon: '🔄' },
    { id: 'lending', name: 'Lending', icon: '🏦' },
    { id: 'dex', name: 'DEX', icon: '🔄' },
    { id: 'yield', name: 'Yield Farming', icon: '🌾' },
    { id: 'staking', name: 'Staking', icon: '🔒' }
  ];

  const filteredProtocols = protocols.filter(protocol => {
    const categoryMatch = selectedCategory === 'all' || protocol.category === selectedCategory;
    const positionMatch = !showPositionsOnly || protocol.userPosition;
    return categoryMatch && positionMatch;
  });

  const totalDeposited = userPositions.reduce((sum, pos) => sum + pos.value, 0);
  const totalEarned = userPositions.reduce((sum, pos) => sum + pos.rewards, 0);
  const avgApy = userPositions.reduce((sum, pos) => sum + pos.apy, 0) / userPositions.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatCompact = (amount: number) => {
    if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(1)}B`;
    } else if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(1)}M`;
    } else if (amount >= 1e3) {
      return `$${(amount / 1e3).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            DeFi Hub
          </h1>
          <p className="text-base text-secondary">
            Explore and manage your DeFi positions across protocols
          </p>
        </div>
        <button className="btn-primary">
          ➕ New Position
        </button>
      </header>

      {/* Portfolio Summary */}
      <div className="card-wallet mb-8" style={{ position: 'relative', overflow: 'hidden' }}>
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '140%',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm mb-1" style={{ opacity: 0.8 }}>
                Total DeFi Value
              </p>
              <h2 className="text-3xl font-bold" style={{ letterSpacing: '-0.5px' }}>
                {formatCurrency(totalDeposited)}
              </h2>
              <p className="text-sm mt-1" style={{ opacity: 0.9 }}>
                Across {userPositions.length} positions
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ opacity: 0.8 }}>
                Total Earned
              </p>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                +{formatCurrency(totalEarned)}
              </h3>
              <p className="text-sm mt-1" style={{ opacity: 0.9 }}>
                All time rewards
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ opacity: 0.8 }}>
                Average APY
              </p>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--info)' }}>
                {avgApy.toFixed(1)}%
              </h3>
              <p className="text-sm mt-1" style={{ opacity: 0.9 }}>
                Weighted average
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              className={selectedCategory === category.id ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                background: selectedCategory === category.id 
                  ? 'var(--purple-500)' 
                  : 'transparent'
              }}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPositionsOnly}
              onChange={(e) => setShowPositionsOnly(e.target.checked)}
              style={{
                accentColor: 'var(--purple-500)'
              }}
            />
            <span className="text-sm text-secondary">Show only my positions</span>
          </label>
        </div>
      </section>

      {/* User Positions */}
      {userPositions.length > 0 && !showPositionsOnly && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Your Active Positions
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userPositions.map((position, index) => (
              <div
                key={index}
                className="card"
                style={{
                  border: '2px solid var(--purple-500)',
                  background: 'linear-gradient(135deg, rgba(124, 90, 255, 0.05), rgba(124, 90, 255, 0.02))'
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {position.protocol}
                    </h3>
                    <p className="text-sm text-secondary">
                      {position.type}
                    </p>
                  </div>
                  <div 
                    className="px-2 py-1 rounded-md text-xs font-medium"
                    style={{
                      background: 'rgba(76, 175, 80, 0.1)',
                      color: 'var(--success)'
                    }}
                  >
                    {position.apy.toFixed(1)}% APY
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Position Value</span>
                    <span className="text-sm font-medium text-primary">
                      {formatCurrency(position.value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Rewards Earned</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                      +{formatCurrency(position.rewards)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="btn-secondary btn-sm" style={{ flex: 1 }}>
                    Manage
                  </button>
                  <button className="btn-ghost btn-sm" style={{ flex: 1 }}>
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Protocol Grid */}
      <section>
        <h2 className="text-xl font-semibold text-primary mb-4">
          {showPositionsOnly ? 'Your DeFi Positions' : 'Available Protocols'}
        </h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProtocols.map((protocol) => (
            <div
              key={protocol.id}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all var(--transition-normal) ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-3)';
              }}
            >
              {/* Protocol Header */}
              <div className="flex justify-between items-start mb-4">
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
                    <p className="text-sm text-secondary">
                      {protocol.description}
                    </p>
                  </div>
                </div>
                
                {protocol.userPosition && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: 'var(--success)' }}
                    title="You have an active position"
                  />
                )}
              </div>

              {/* Protocol Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-secondary mb-1">TVL</p>
                  <p className="text-sm font-medium text-primary">
                    {formatCompact(protocol.tvl)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary mb-1">APY</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                    {protocol.apy.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* User Position (if exists) */}
              {protocol.userPosition && (
                <div 
                  className="p-3 mb-4 rounded-md"
                  style={{ 
                    background: 'rgba(124, 90, 255, 0.05)',
                    border: '1px solid rgba(124, 90, 255, 0.1)'
                  }}
                >
                  <p className="text-xs text-secondary mb-2">Your Position</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-primary">
                      {formatCurrency(protocol.userPosition.deposited)}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                      +{formatCurrency(protocol.userPosition.earned)}
                    </span>
                  </div>
                </div>
              )}

              {/* Category Badge */}
              <div className="flex justify-between items-center">
                <span 
                  className="px-2 py-1 rounded-md text-xs font-medium"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {protocol.category.charAt(0).toUpperCase() + protocol.category.slice(1)}
                </span>
                
                <button 
                  className={protocol.userPosition ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
                >
                  {protocol.userPosition ? 'Manage' : 'Enter'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProtocols.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              No protocols found
            </h3>
            <p className="text-base text-secondary">
              Try adjusting your filters or browse all available protocols.
            </p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          DeFi Tools
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button className="card text-center" style={{ cursor: 'pointer' }}>
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm font-medium text-primary">Analytics</p>
          </button>
          
          <button className="card text-center" style={{ cursor: 'pointer' }}>
            <div className="text-2xl mb-2">🔄</div>
            <p className="text-sm font-medium text-primary">Swap</p>
          </button>
          
          <button className="card text-center" style={{ cursor: 'pointer' }}>
            <div className="text-2xl mb-2">🌉</div>
            <p className="text-sm font-medium text-primary">Bridge</p>
          </button>
          
          <button className="card text-center" style={{ cursor: 'pointer' }}>
            <div className="text-2xl mb-2">📚</div>
            <p className="text-sm font-medium text-primary">Learn</p>
          </button>
        </div>
      </section>
    </div>
  );
}
