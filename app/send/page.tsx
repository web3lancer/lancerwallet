import { Suspense } from 'react';
import SendPageClient from './pageClient';

export default function SendPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendPageClient />
    </Suspense>
  );
}
