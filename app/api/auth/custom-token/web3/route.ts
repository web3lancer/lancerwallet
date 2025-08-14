import { NextResponse } from 'next/server';
import { recoverAddress } from '../../../../lib/appwrite/web3';
import { appwriteClient } from '../../../../lib/appwrite/index';

export async function POST(req: Request) {
  const body = await req.json();
  const { address, signature, nonce } = body;
  if (!address || !signature || !nonce) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

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

  // TODO: verify nonce server-side; for now accept

  // Mint Appwrite custom token using server SDK key
  try {
    // Appwrite's SDK requires calling a server endpoint to create sessions; alternatively use custom JWT creation if configured
    // Here we'll return a placeholder token for client to exchange with Appwrite
    const customToken = `custom-token-for-${address.toLowerCase()}`;
    return NextResponse.json({ token: customToken });
  } catch (err) {
    return NextResponse.json({ error: 'failed to create token' }, { status: 500 });
  }
}
