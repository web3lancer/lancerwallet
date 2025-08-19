import { NextResponse } from 'next/server';
import { nonces } from '@/lib/appwrite/databases';
import { ID, Query } from 'appwrite';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const key = uuidv4();
  const nonce = uuidv4();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now
  const now = new Date().toISOString();

  await nonces.create(ID.unique(), {
    nonceId: key,
    key,
    nonce,
    expiresAt,
    used: false,
    createdAt: now,
  });

  return NextResponse.json({ key, nonce });
}

// helper not exported to avoid Next.js route type errors
async function verifyAndConsumeNonceFromDB(key: string, nonce: string): Promise<boolean> {
    const response = await nonces.list([
        Query.equal("key", key),
        Query.equal("nonce", nonce),
    ]);

    if (response.total === 0) {
        return false;
    }

    const nonceDoc = response.documents[0];

    if (nonceDoc.used) {
        return false;
    }

    const now = new Date();
    const expiresAt = new Date(nonceDoc.expiresAt);

    if (now > expiresAt) {
        return false;
    }

    await nonces.update(nonceDoc.$id, { used: true });

    return true;
}

// expose helper via a named module file instead to avoid Next route export conflicts
// Create a separate utils file will be used; for now export nothing from this route
