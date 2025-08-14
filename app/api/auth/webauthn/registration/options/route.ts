import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';

const rpName = process.env.WEBAUTHN_RP_NAME || 'LancerWallet';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';

export async function GET() {
  const options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(cryptoRandomId()),
    userName: 'user',
    attestationType: 'none',
    authenticatorSelection: { userVerification: 'preferred' },
  });
  return NextResponse.json(options);
}

function cryptoRandomId() {
  return Math.random().toString(36).substring(2, 12);
}
