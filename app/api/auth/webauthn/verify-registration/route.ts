import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { saveCredential } from '../store';

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: body.response.clientDataJSON, // in real code decode clientDataJSON and extract challenge
      expectedOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
      expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost',
    });

    if (!verification.verified) return NextResponse.json({ error: 'verification failed' }, { status: 400 });

    // Save credential for user mapping
    const cred = {
      id: body.id,
      publicKey: JSON.stringify(verification.registrationInfo?.credential),
      counter: 0, // TODO: inspect registrationInfo for actual counter property
      userId: body.response.userHandle || 'user:' + (Math.random().toString(36).slice(2, 8)),
    };
    saveCredential(cred);

    // TODO: create Appwrite user and mint custom token
    const token = `custom-passkey-${cred.userId}`;
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: 'invalid attestation' }, { status: 400 });
  }
}
