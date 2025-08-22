import { NextResponse } from 'next/server';
import { recoverAddress } from '@/lib/wallet';
import { serverAdmin } from '@/lib/appwrite/server-admin';

export async function POST(req: Request) {
  try {
    const { address, signature, nonce } = await req.json();

    if (!address || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields: address, signature, and nonce are required.' },
        { status: 400 }
      );
    }

    // Verify and consume the nonce
    const { verifyAndConsumeNonceMessage } = await import('@/lib/auth/nonce-manager');
    const isNonceValid = await verifyAndConsumeNonceMessage(nonce);
    if (!isNonceValid) {
      return NextResponse.json({ error: 'Invalid or expired nonce.' }, { status: 401 });
    }

    // 1. Verify signature
    let recoveredAddress: string;
    try {
      recoveredAddress = recoverAddress(nonce, signature);
    } catch (error) {
      console.error('Signature recovery error:', error);
      return NextResponse.json({ error: 'Invalid signature format.' }, { status: 400 });
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Signature does not match address.' },
        { status: 401 }
      );
    }

    // 2. Determine user ID
    const userId = `wallet:${address.toLowerCase()}`;
    const userName = address.toLowerCase();

    // 3. Create or retrieve Appwrite user
    let user;
    try {
      user = await serverAdmin.users.get(userId);
    } catch (e: unknown) {
      // Check if it's an AppwriteException
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code === 404) {
        // User not found, create a new one
        try {
          user = await serverAdmin.users.create(
            userId,
            undefined, // email
            undefined, // phone
            undefined, // password
            userName
          );
        } catch (creationError) {
          console.error('Appwrite user creation error:', creationError);
          return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
        }
      } else {
        // Different error, e.g., network issue or Appwrite server problem
        console.error('Appwrite user fetch error:', e);
        return NextResponse.json({ error: 'An error occurred while fetching user information.' }, { status: 500 });
      }
    }

    // 4. Issue custom token
    const token = await serverAdmin.users.createToken(user.$id);

    // 5. Return token secret
    return NextResponse.json({ token: token.secret });

  } catch (error: unknown) {
    console.error('Custom token endpoint error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'An unexpected error occurred.', details: message }, { status: 500 });
  }
}