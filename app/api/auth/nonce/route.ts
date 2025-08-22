import { NextResponse } from 'next/server';
import { createNonceMessage } from '@/lib/auth/nonce-manager';

export async function GET() {
  try {
    const message = await createNonceMessage();
    return NextResponse.json({ message });
  } catch (e) {
    console.error('Error creating nonce message:', e);
    return NextResponse.json({ error: 'Could not create nonce.' }, { status: 500 });
  }
}
