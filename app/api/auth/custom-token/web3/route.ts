import { NextResponse } from 'next/server';
import { recoverAddress } from '../../../../../lib/appwrite/web3';
import { verifyAndConsumeNonce } from '../../nonce/store';
import { appwriteClient } from '../../../../../lib/appwrite/index';

export async function POST(req: Request) {
  const body = await req.json();
  const { address, signature, key, nonce } = body;
  if (!address || !signature || !nonce || !key) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  // Recreate message format expected (simple: `Sign this nonce: ${nonce}`)
  const message = `Sign this nonce: ${nonce}`;
  let recovered: string;
  try {
    recovered = recoverAddress(message, signature);
  } catch (e) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: 'signature does not match address' }, { status: 400 });
  }

  const ok = verifyAndConsumeNonce(key, nonce);
  if (!ok) return NextResponse.json({ error: 'invalid or expired nonce' }, { status: 400 });

  // Mint Appwrite custom token using server SDK key
  try {
    // If APPWRITE_API_KEY is configured, use server SDK to create a JWT or custom token; for now return a placeholder
    const customToken = `custom-token-for-${address.toLowerCase()}`;
    return NextResponse.json({ token: customToken });
  } catch (err) {
    return NextResponse.json({ error: 'failed to create token' }, { status: 500 });
  }
}
