import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createNonce } from './store';

export async function GET() {
  const nonce = randomBytes(16).toString('hex');
  const key = cryptoRandomKey();
  createNonce(key, nonce);
  // Return both key and nonce; client must send both back when signing
  return NextResponse.json({ key, nonce });
}

function cryptoRandomKey() {
  return randomBytes(8).toString('hex');
}
