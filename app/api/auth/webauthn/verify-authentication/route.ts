import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON, VerifiedAuthenticationResponse, AuthenticatorTransport } from '@simplewebauthn/server';
import { getAndConsumeChallenge } from '@/lib/auth/challenge';
import { serverAdmin } from '@/lib/appwrite/server-admin';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export async function POST(req: Request) {
  const body: AuthenticationResponseJSON & { challengeId: string } = await req.json();
  const { challengeId } = body;

  if (!challengeId) {
    return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
  }

  try {
    const expectedChallenge = await getAndConsumeChallenge(challengeId);
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Invalid or expired challenge.' }, { status: 400 });
    }

    const userId = body.response.userHandle;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userHandle from authenticator response.' }, { status: 400 });
    }

    const user = await serverAdmin.users.get(userId);
    const userCredentials = (user.prefs.credentials || []) as {
      id: string;
      publicKey: string;
      counter: number;
      transports: AuthenticatorTransport[];
      encryptedMnemonic?: string;
    }[];

    const credential = userCredentials.find((c) => c.id === body.id);
    if (!credential) {
      return NextResponse.json({ error: 'Credential not found for this user.' }, { status: 404 });
    }

    const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(credential.id, 'base64url'),
        credentialPublicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: credential.counter,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { verified, authenticationInfo } = verification;

    if (!verified) {
      return NextResponse.json({ error: 'Could not verify authentication.' }, { status: 400 });
    }

    // Update the credential counter to prevent cloning
    const { newCounter } = authenticationInfo;
    const updatedCredentials = userCredentials.map((c) =>
      c.id === body.id ? { ...c, counter: newCounter } : c
    );
    await serverAdmin.users.updatePrefs(userId, { ...user.prefs, credentials: updatedCredentials });

    // Return the encrypted mnemonic associated with this credential
    if (!credential.encryptedMnemonic) {
      return NextResponse.json({ error: 'No encrypted data found for this credential.' }, { status: 404 });
    }

    return NextResponse.json({ encryptedMnemonic: credential.encryptedMnemonic });

  } catch (e: unknown) {
    console.error('Error verifying authentication:', e);
    const message = e instanceof Error ? e.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Verification failed: ${message}` }, { status: 500 });
  }
}
