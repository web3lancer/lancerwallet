import { Suspense } from 'react';
import NFTPageClient from './pageClient';

export default function NFTPage() {
  return (
    <Suspense fallback={
      <div className="container fade-in" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p>Loading NFTs...</p>
        </div>
      </div>
    }>
      <NFTPageClient />
    </Suspense>
  );
}
