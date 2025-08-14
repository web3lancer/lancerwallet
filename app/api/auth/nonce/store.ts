const nonces = new Map<string, { nonce: string; createdAt: number }>();

export function createNonce(key: string, nonce: string) {
  nonces.set(key, { nonce, createdAt: Date.now() });
}

export function verifyAndConsumeNonce(key: string, nonce: string) {
  const entry = nonces.get(key);
  if (!entry) return false;
  // expire after 5 minutes
  if (Date.now() - entry.createdAt > 5 * 60 * 1000) {
    nonces.delete(key);
    return false;
  }
  if (entry.nonce !== nonce) return false;
  nonces.delete(key);
  return true;
}
