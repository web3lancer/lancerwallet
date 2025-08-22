import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { AuthenticatorTransport } from '@simplewebauthn/server';
import { AppwriteServerClient } from '@/lib/appwrite/server';

const rpName = process.env.WEBAUTHN_RP_NAME || 'LancerWallet';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';

export async function POST(req: Request) {
  const { userId, userName } = await req.json();

  if (!userId || !userName) {
    return NextResponse.json({ error: 'Missing userId or userName' }, { status: 400 });
  }

  const { users } = new AppwriteServerClient();
  let user;
  try {
    user = await users.get(userId);
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code !== 404) {
      return NextResponse.json({ error: 'Error finding user' }, { status: 500 });
    }
    // User not found, which is expected for a new registration.
  }

  const existingCredentials = user?.prefs?.credentials || [];

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: userId,
    userName: userName,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map((cred: { id: string; transports: AuthenticatorTransport[] }) => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports,
    })),
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'required',
    },
    extensions: {
      credProps: true,
    },
  });

  // Temporarily store the challenge for verification
  // In a real app, this should be stored in a short-lived, secure cache like Redis
  // For now, we'll store it in the user's prefs, which is not ideal but works for this scope.
  await users.updatePrefs(userId, {
    ...user?.prefs,
    currentChallenge: options.challenge,
  });

  return NextResponse.json(options);
}
