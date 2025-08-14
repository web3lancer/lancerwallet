type Cred = {
  id: string;
  publicKey: string;
  counter: number;
  userId: string;
};

const creds = new Map<string, Cred>();

export function saveCredential(cred: Cred) {
  creds.set(cred.id, cred);
}

export function getCredential(id: string) {
  return creds.get(id) || null;
}

export function updateCounter(id: string, counter: number) {
  const c = creds.get(id);
  if (!c) return false;
  c.counter = counter;
  creds.set(id, c);
  return true;
}

export function findByUserId(userId: string) {
  const res: Cred[] = [];
  for (const v of creds.values()) if (v.userId === userId) res.push(v);
  return res;
}
