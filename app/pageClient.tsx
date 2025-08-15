"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getWalletsFromStorage, getPortfolioValue } from "../lib/wallet";

export default function HomeClient() {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    change24h: 0,
    walletCount: 0,
    activePositions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id: number;
    type: string;
    amount: string;
    to?: string;
    from?: string;
    time: string;
    status: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get wallets and portfolio data
        const wallets = getWalletsFromStorage();
        const { totalValue, change24h } = await getPortfolioValue();
        
        setPortfolioData({
          totalValue,
          change24h,
          walletCount: wallets.length,
          activePositions: 0 // DeFi positions to be implemented
        });

        // Get recent transactions (placeholder until transaction indexing is implemented)
        const mockTransactions = [
          { id: 1, type: 'send', amount: '-0.1 ETH', to: '0x1234...5678', time: '2 hours ago', status: 'completed' },
          { id: 2, type: 'receive', amount: '+100 USDC', from: '0x8765...4321', time: '5 hours ago', status: 'completed' },
        ];
        setRecentTransactions(mockTransactions);
      } catch (error) {
        console.error('Error loading portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="fade-in container" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: '👛',
      title: 'My Wallets',
      description: `${portfolioData.walletCount} active wallets`,
      href: '/wallets',
      variant: 'primary'
    },
    {
      icon: '🖼️',
      title: 'NFT Gallery',
      description: 'View your NFTs',
      href: '/nft',
      variant: 'secondary'
    },
    {
      icon: '🌐',
      title: 'DeFi Hub',
      description: `${portfolioData.activePositions} active positions`,
      href: '/defi',
      variant: 'secondary'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Portfolio insights',
      href: '/analytics',
      variant: 'secondary'
    }
  ];

  return (
    <div 
      className="fade-in container"
      style={{
        paddingBottom: 'var(--space-20)' // Extra space for mobile bottom nav
      }}
    >
      {/* Page Header */}
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome back
            </h1>
            <p className="text-base text-secondary">
              Manage your digital assets with security and simplicity
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn-ghost btn-sm"
              style={{ padding: 'var(--space-2)' }}
              aria-label="Notifications"
            >
              🔔
            </button>
            <button 
              className="btn-ghost btn-sm"
              style={{ padding: 'var(--space-2)' }}
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Portfolio Overview Card */}
      <div 
        className="card-wallet"
        style={{
          marginBottom: 'var(--space-8)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background pattern overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            transform: 'translateX(25%) translateY(-25%)',
            pointerEvents: 'none'
          }}
        />
        
        <div className="flex justify-between items-start mb-6" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <p className="text-sm mb-1" style={{ opacity: 0.8 }}>
              Total Portfolio Value
            </p>
            <h2 className="text-4xl font-bold" style={{ letterSpacing: '-0.5px' }}>
              ${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span 
                className={`text-sm font-medium px-2 py-1 rounded-md ${
                  portfolioData.change24h >= 0 ? 'status-success' : 'status-error'
                }`}
                style={{
                  background: portfolioData.change24h >= 0 
                    ? 'rgba(76, 175, 80, 0.2)' 
                    : 'rgba(244, 67, 54, 0.2)',
                  color: portfolioData.change24h >= 0 ? 'var(--success)' : 'var(--error)'
                }}
              >
                {portfolioData.change24h >= 0 ? '+' : ''}{portfolioData.change24h}% (24h)
              </span>
            </div>
          </div>
        </div>
        
         <div className="flex gap-3" style={{ position: 'relative', zIndex: 1 }}>
           <Link href="/nft" className="btn-secondary" style={{
             background: 'rgba(255, 255, 255, 0.15)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             color: 'var(--text-inverse)',
             flex: 1,
             textAlign: 'center',
             textDecoration: 'none'
           }}>
             🖼️ NFT
           </Link>
           <button 
             className="btn-secondary"
             style={{
               background: 'rgba(255, 255, 255, 0.15)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               color: 'var(--text-inverse)',
               flex: 1
             }}
           >
             📥 Receive
           </button>
           <Link href="/defi" className="btn-secondary" style={{
             background: 'rgba(255, 255, 255, 0.15)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             color: 'var(--text-inverse)',
             flex: 1,
             textAlign: 'center',
             textDecoration: 'none'
           }}>
             🌐 DeFi
           </Link>
         </div>
      </div>

      {/* Quick Actions Grid */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="text-xl font-semibold text-primary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
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
              <div className="flex flex-col items-center text-center">
                <div 
                  style={{
                    fontSize: '2rem',
                    marginBottom: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    background: action.variant === 'primary' 
                      ? 'rgba(124, 90, 255, 0.1)' 
                      : 'var(--surface-hover)'
                  }}
                >
                  {action.icon}
                </div>
                <h3 className="text-base font-semibold text-primary mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-secondary">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary">
            Recent Activity
          </h2>
          <Link 
            href="/activity" 
            className="text-sm font-medium"
            style={{ 
              color: 'var(--purple-500)',
              textDecoration: 'none'
            }}
          >
            View All
          </Link>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3"
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    background: tx.type === 'send' ? 'rgba(244, 67, 54, 0.1)' 
                              : tx.type === 'receive' ? 'rgba(76, 175, 80, 0.1)'
                              : 'rgba(124, 90, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}
                >
                  {tx.type === 'send' ? '📤' : tx.type === 'receive' ? '📥' : '🔄'}
                </div>
                <div>
                  <p className="text-base font-medium text-primary">
                    {tx.amount}
                  </p>
                  <p className="text-sm text-secondary">
                    {tx.type === 'send' ? `To ${tx.to}` 
                     : tx.type === 'receive' ? `From ${tx.from}`
                     : 'Token Swap'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="text-xs px-2 py-1 rounded-md"
                  style={{
                    background: 'rgba(76, 175, 80, 0.1)',
                    color: 'var(--success)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  {tx.status}
                </div>
                <p className="text-xs text-tertiary">
                  {tx.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
