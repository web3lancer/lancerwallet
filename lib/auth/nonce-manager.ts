import { serverAdmin } from '@/lib/appwrite/server-admin';
import { AppwriteSDK } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

const NONCE_COLLECTION_ID = AppwriteSDK.config.collections.nonces;
const DB_ID = serverAdmin.dbId;

/**
 * Creates and stores a new nonce message for signing.
 * @returns The full message to be signed by the user's wallet.
 */
export async function createNonceMessage(): Promise<string> {
  const nonce = serverAdmin.ID.unique();
  const message = `Welcome to LancerWallet. Please sign this message to prove you own this wallet. This request will expire in 5 minutes. Nonce: ${nonce}`;

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

  await serverAdmin.databases.createDocument(
    DB_ID,
    NONCE_COLLECTION_ID,
    nonce, // Use the nonce itself as the document ID for easy lookup
    {
      message: message,
      expiresAt: expiresAt,
      used: false,
    }
  );
  return message;
}

/**
 * Verifies that a signed message corresponds to a valid, un-used, and un-expired nonce.
 * Consumes the nonce to prevent replay attacks.
 * @param message The full message that was signed by the user.
 * @returns True if the nonce is valid, false otherwise.
 */
export async function verifyAndConsumeNonceMessage(message: string): Promise<boolean> {
  const nonceMatch = message.match(/Nonce: (.+)$/);
  if (!nonceMatch || !nonceMatch[1]) {
    return false; // Message format is incorrect
  }
  const nonce = nonceMatch[1];

  let nonceDoc;
  try {
    nonceDoc = await serverAdmin.databases.getDocument(DB_ID, NONCE_COLLECTION_ID, nonce);
  } catch (e: any) {
    if (e.code === 404) {
      return false; // Nonce not found
    }
    throw e;
  }

  // Double-check the message matches exactly to prevent tampering
  if (nonceDoc.message !== message) {
    return false;
  }

  if (nonceDoc.used) {
    return false; // Replay attack detected
  }

  const now = new Date();
  const expiresAt = new Date(nonceDoc.expiresAt);
  if (now > expiresAt) {
    return false; // Expired
  }

  // Mark as used to prevent replay
  await serverAdmin.databases.updateDocument(DB_ID, NONCE_COLLECTION_ID, nonce, {
    used: true,
  });

  return true;
}
