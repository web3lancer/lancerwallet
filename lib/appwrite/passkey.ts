/* Client-side WebAuthn (Passkey) helpers

Expectations:
- Server endpoints:
  - POST /api/auth/webauthn/registration-options  => returns PublicKeyCredentialCreationOptions (challenge, rp, user, pubKeyCredParams, etc.) encoded as JSON with ArrayBuffers as base64url strings
  - POST /api/auth/webauthn/verify-registration => accepts attestation response from client, verifies server-side, and returns Appwrite custom token or success
  - POST /api/auth/webauthn/authentication-options => returns PublicKeyCredentialRequestOptions (challenge, allowCredentials, etc.)
  - POST /api/auth/webauthn/verify-authentication => accepts assertion response from client, verifies, returns Appwrite custom token

This file provides helper wrappers to call those endpoints and to convert ArrayBuffer <-> base64url which is required for WebAuthn.
*/

export type RegistrationOptionsResponse = unknown;
export type AuthenticationOptionsResponse = unknown;

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const pad = 4 - (base64url.length % 4);
  const base64 = (base64url + (pad === 4 ? '' : '='.repeat(pad))).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function fetchJson(url: string, body?: Record<string, unknown>) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function requestRegistrationOptions(displayName = 'Lancer User') {
  // ask server for creation options
  const data = await fetchJson('/api/auth/webauthn/registration-options', { displayName });
  // convert base64url strings back to ArrayBuffers for navigator
  // expected fields: challenge, user.id, maybe excludeCredentials[].id
  if (data.publicKey) {
const pk = data.publicKey as PublicKeyCredentialCreationOptions;
pk.challenge = base64urlToBuffer(pk.challenge as unknown as string);
if (pk.user && typeof pk.user.id === 'string') pk.user.id = base64urlToBuffer(pk.user.id as unknown as string);
if (Array.isArray(pk.excludeCredentials)) {
  pk.excludeCredentials = pk.excludeCredentials.map((c: PublicKeyCredentialDescriptor) => ({ ...c, id: base64urlToBuffer(c.id as unknown as string) }));
}
return pk;
  }
  throw new Error('Invalid registration options from server');
}

export async function finalizeRegistration(attestation: PublicKeyCredential) {
  // Convert ArrayBuffers in attestation to base64url strings and POST to server
  const clientDataJSON = bufferToBase64url(attestation.response.clientDataJSON);
  const attestationObject = bufferToBase64url((attestation.response as AuthenticatorAttestationResponse).attestationObject);
  const rawId = bufferToBase64url(attestation.rawId);
  const payload = {
    id: attestation.id,
    rawId,
    type: attestation.type,
    response: { clientDataJSON, attestationObject },
  };
  return await fetchJson('/api/auth/webauthn/verify-registration', payload);
}

export async function requestAuthenticationOptions() {
  const data = await fetchJson('/api/auth/webauthn/authentication-options');
  if (data.publicKey) {
const pk = data.publicKey as PublicKeyCredentialRequestOptions;
pk.challenge = base64urlToBuffer(pk.challenge as unknown as string);
if (Array.isArray(pk.allowCredentials)) {
  pk.allowCredentials = pk.allowCredentials.map((c: PublicKeyCredentialDescriptor) => ({ ...c, id: base64urlToBuffer(c.id as unknown as string) }));
}
return pk;
  }
  throw new Error('Invalid authentication options from server');
}

export async function finalizeAuthentication(assertion: PublicKeyCredential) {
  const clientDataJSON = bufferToBase64url(assertion.response.clientDataJSON);
  const resp = assertion.response as AuthenticatorAssertionResponse;
  const authenticatorData = bufferToBase64url(resp.authenticatorData);
  const signature = bufferToBase64url(resp.signature);
  const userHandle = resp.userHandle ? bufferToBase64url(resp.userHandle) : null;
  const payload = {
    id: assertion.id,
    rawId: bufferToBase64url(assertion.rawId),
    type: assertion.type,
    response: { clientDataJSON, authenticatorData, signature, userHandle },
  };
  return await fetchJson('/api/auth/webauthn/verify-authentication', payload);
}

/* Example usage (client):

const options = await requestRegistrationOptions('Alice');
const cred = await navigator.credentials.create({ publicKey: options });
await finalizeRegistration(cred as PublicKeyCredential);

*/
