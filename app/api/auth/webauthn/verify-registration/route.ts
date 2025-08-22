import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { VerifiedRegistrationResponse, RegistrationResponseJSON, AuthenticatorTransport } from '@simplewebauthn/server';
import { AppwriteServerClient } from '@/lib/appwrite/server';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export async function POST(req: Request) {
  const body: RegistrationResponseJSON & { userId: string; encryptedMnemonic: string } = await req.json();
  const { userId, encryptedMnemonic } = body;

  if (!userId || !encryptedMnemonic) {
    return NextResponse.json({ error: 'userId and encryptedMnemonic are required.' }, { status: 400 });
  }

  const { users } = new AppwriteServerClient();

  let user;
  let expectedChallenge: string | undefined;

  try {
    user = await users.get(userId);
    expectedChallenge = user.prefs.currentChallenge;
  } catch (e: unknown) {
    // A user might not exist yet if this is their first passkey registration.
    // However, the challenge should have been set in a temporary record or cache.
    // In our case, we upsert prefs, so a user object should exist if options were generated.
    if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code === 404) {
      return NextResponse.json({ error: 'User not found or challenge expired.' }, { status: 404 });
    }
    console.error('Appwrite error fetching user or challenge', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Challenge not found. Please try again.' }, { status: 400 });
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Credential verification failed.' }, { status: 400 });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credential } = registrationInfo;
    const { id, publicKey, counter } = credential;
    const existingCredentials = user.prefs.credentials || [];

    const newCredential: {
      id: string;
      publicKey: Uint8Array;
      counter: number;
      transports: AuthenticatorTransport[];
      encryptedMnemonic?: string;
    } = {
      id: id,
      publicKey: publicKey,
      counter: counter,
      transports: body.response.transports || [],
      encryptedMnemonic: encryptedMnemonic,
    };

    try {
      // Create user if they don't exist, otherwise update prefs
      let finalUser;
      try {
        finalUser = await users.get(userId);
      } catch (e: unknown) {
        if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code === 404) {
          finalUser = await users.create(userId, undefined, undefined, undefined, userId.split(':')[1]);
        } else {
          throw e;
        }
      }

      await users.updatePrefs(finalUser.$id, {
        ...user.prefs,
        credentials: [...existingCredentials, newCredential],
        currentChallenge: null, // Clear the challenge
      });

      // Create a custom token for the user to create a session
      const token = await users.createToken(finalUser.$id);
      return NextResponse.json({ token: token.secret });

    } catch (e: unknown) {
      console.error('Appwrite error saving credential or creating token', e);
      return NextResponse.json({ error: 'Error saving credential.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Could not verify registration.' }, { status: 400 });
}
