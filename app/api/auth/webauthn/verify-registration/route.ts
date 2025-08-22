import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { VerifiedRegistrationResponse, RegistrationResponseJSON } from '@simplewebauthn/server';
import { AppwriteServerClient } from '@/lib/appwrite/server';
import { ID } from 'node-appwrite';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export async function POST(req: Request) {
  const body: RegistrationResponseJSON & { userId: string } = await req.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  }

  const { users } = new AppwriteServerClient();

  let user;
  let expectedChallenge: string | undefined;

  try {
    user = await users.get(userId);
    expectedChallenge = user.prefs.currentChallenge;
  } catch (e: any) {
    // A user might not exist yet if this is their first passkey registration.
    // However, the challenge should have been set in a temporary record or cache.
    // In our case, we upsert prefs, so a user object should exist if options were generated.
    if (e.code === 404) {
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
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    const existingCredentials = user.prefs.credentials || [];

    const newCredential = {
      id: Buffer.from(credentialID).toString('base64url'),
      publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      transports: body.response.transports,
    };

    try {
      // Create user if they don't exist, otherwise update prefs
      let finalUser;
      try {
        finalUser = await users.get(userId);
      } catch (e: any) {
        if (e.code === 404) {
          finalUser = await users.create(userId, undefined, undefined, undefined, userId.split(':')[1]);
        } else {
          throw e;
        }
      }

      await users.updatePrefs(finalUser.$id, {
        credentials: [...existingCredentials, newCredential],
        currentChallenge: null, // Clear the challenge
      });

      // Create a custom token for the user to create a session
      const token = await users.createToken(finalUser.$id);
      return NextResponse.json({ token: token.secret });

    } catch (e: any) {
      console.error('Appwrite error saving credential or creating token', e);
      return NextResponse.json({ error: 'Error saving credential.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Could not verify registration.' }, { status: 400 });
}
