import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { createChallenge } from '@/lib/auth/challenge';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';

export async function GET() {
  try {
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    });

    // Store the challenge for the verification step
    const challengeId = await createChallenge(options.challenge);

    // Return the options along with our challenge ID
    return NextResponse.json({ ...options, challengeId });
  } catch (e) {
    console.error('Error generating authentication options:', e);
    return NextResponse.json({ error: 'Could not generate authentication options.' }, { status: 500 });
  }
}
