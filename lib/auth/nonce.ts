import { nonces } from '@/lib/appwrite/databases';
import { Query } from 'appwrite';

export async function verifyAndConsumeNonceFromDB(key: string, nonce: string): Promise<boolean> {
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
