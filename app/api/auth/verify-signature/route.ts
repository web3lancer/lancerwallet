import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverAdmin } from '@/lib/appwrite/server-admin';
import { appwriteAccount } from '@/lib/appwrite';
import { recoverAddress } from '@/lib/wallet';
import { verifyAndConsumeNonceMessage } from '@/lib/auth/nonce-manager';

interface VerifySignatureRequest {
  address: string;
  signature: string;
  message: string;
}

export async function POST(req: Request) {
  const { address, signature, message }: VerifySignatureRequest = await req.json();

  if (!address || !signature || !message) {
    return NextResponse.json({ error: 'Missing address, signature, or message.' }, { status: 400 });
  }

  try {
    // 1. Verify and consume the nonce from the message
    const isNonceValid = await verifyAndConsumeNonceMessage(message);
    if (!isNonceValid) {
      return NextResponse.json({ error: 'Invalid, expired, or used nonce.' }, { status: 403 });
    }

    // 2. Recover the signing address from the message and signature
    const recoveredAddress = recoverAddress(message, signature);

    // 3. Check if the recovered address matches the provided address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Signature does not match the provided address.' }, { status: 403 });
    }

    // 4. Find the user and create a session
    const userId = `wallet:${address.toLowerCase()}`;

    // Ensure user exists before creating a token
    try {
      await serverAdmin.users.get(userId);
    } catch (e: any) {
      if (e.code === 404) {
        return NextResponse.json({ error: 'User not found. Please sign up first.' }, { status: 404 });
      }
      throw e; // Re-throw other errors
    }

    const token = await serverAdmin.users.createToken(userId);
    const session = await appwriteAccount.createSession(userId, token.secret);

    cookies().set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(session.expire),
    });

    return NextResponse.json({ success: true, userId });

  } catch (e: any) {
    console.error('Error verifying signature:', e);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
