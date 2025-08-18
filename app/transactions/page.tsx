import { Suspense } from 'react';
import TransactionsPageClient from './pageClient';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsPageClient />
    </Suspense>
  );
}
