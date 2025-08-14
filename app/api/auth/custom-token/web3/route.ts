import { NextResponse } from 'next/server';
import { recoverAddress } from '../../../../../lib/appwrite/web3';
import { verifyAndConsumeNonce } from '../../nonce/store';

export async function POST(req: Request) {
  const body = await req.json();
  const { address, signature, key, nonce } = body;
  if (!address || !signature || !nonce || !key) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  const message = `Sign this nonce: ${nonce}`;
  let recovered: string;
  try {
    recovered = recoverAddress(message, signature);
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: 'signature does not match address' }, { status: 400 });
  }

  const ok = verifyAndConsumeNonce(key, nonce);
  if (!ok) return NextResponse.json({ error: 'invalid or expired nonce' }, { status: 400 });

  // If APPWRITE_API_KEY present, attempt to create a JWT for the user
  const apiKey = process.env.APPWRITE_API_KEY;
  const project = process.env.APPWRITE_PROJECT;

  if (apiKey && project) {
    try {
      // create a server-side client with key
      // appwrite SDK exposes createJWT on Users in some versions; we will call REST fallback
            // For now return token-like object
      const token = `appwrite-token:${address.toLowerCase()}`;
      return NextResponse.json({ token });
    } catch {
      return NextResponse.json({ error: 'failed to mint token' }, { status: 500 });
    }
  }

  // Fallback placeholder token
  const customToken = `custom-token-for-${address.toLowerCase()}`;
  return NextResponse.json({ token: customToken });
}
