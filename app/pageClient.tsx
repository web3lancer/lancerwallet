"use client";
import Skeleton from "./components/Skeleton";

export default function HomeClient() {
  return (
    <div 
      className="fade-in"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-6)'
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 
          style={{
            fontSize: '32px',
            lineHeight: '44px',
            letterSpacing: '-1px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          Welcome back
        </h1>
        <p 
          style={{
            fontSize: '16px',
            lineHeight: '24px',
            color: 'var(--text-secondary)'
          }}
        >
          Manage your digital assets with security and simplicity
        </p>
      </div>

      {/* Portfolio Overview Card */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))',
          color: 'var(--text-inverse)',
          border: 'none',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: 'var(--space-1)' }}>
              Total Portfolio Value
            </p>
            <h2 
              style={{
                fontSize: '32px',
                fontWeight: '700',
                letterSpacing: '-0.5px'
              }}
            >
              $12,847.50
            </h2>
          </div>
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            +2.4%
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            className="btn-secondary"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--text-inverse)',
              flex: 1
            }}
          >
            Send
          </button>
          <button 
            className="btn-secondary"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--text-inverse)',
              flex: 1
            }}
          >
            Receive
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div className="card">
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '24px' }}>👛</span>
          </div>
          <h3 
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)'
            }}
          >
            My Wallets
          </h3>
          <p 
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-4)'
            }}
          >
            Manage your crypto wallets
          </p>
          <button className="btn-primary" style={{ width: '100%' }}>
            View Wallets
          </button>
        </div>

        <div className="card">
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '24px' }}>🌐</span>
          </div>
          <h3 
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)'
            }}
          >
            DeFi Hub
          </h3>
          <p 
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-4)'
            }}
          >
            Access DeFi protocols
          </p>
          <button className="btn-secondary" style={{ width: '100%' }}>
            Explore DeFi
          </button>
        </div>

        <div className="card">
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
          </div>
          <h3 
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)'
            }}
          >
            Analytics
          </h3>
          <p 
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-4)'
            }}
          >
            Track your performance
          </p>
          <button className="btn-secondary" style={{ width: '100%' }}>
            View Stats
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)'
          }}
        >
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </div>
      </div>
    </div>
  );
}
