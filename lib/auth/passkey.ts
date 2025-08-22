import { generateNewWallet, importWalletFromMnemonic, signMessage } from '@/lib/wallet';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { encryptDataWithPassword, decryptDataWithPassword } from '@/lib/crypto';
import { appwriteAccount } from '@/lib/appwrite';

/**
 * Implements the passkey registration flow.
 */
export async function registerWithPasskey(): Promise<boolean> {
  // 1. Generate a new wallet client-side
  const wallet = generateNewWallet();
  const userId = `wallet:${wallet.address.toLowerCase()}`;
  const userName = wallet.address.toLowerCase();

  // 2. Get registration options from the server
  const optionsRes = await fetch('/api/auth/webauthn/registration/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userName }),
  });
  const options = await optionsRes.json();
  if (!optionsRes.ok) throw new Error(options.error || 'Failed to get registration options.');

  options.extensions = { credProps: true };

  // 3. Start WebAuthn registration
  const attestation = await startRegistration(options);

  // 4. Get the PRF results
  const clientExtensionResults = attestation.clientExtensionResults;
  if (!clientExtensionResults.credProps?.prf) {
    throw new Error('PRF extension was not supported by the authenticator.');
  }
  const prfSecret = btoa(String.fromCharCode(...new Uint8Array(clientExtensionResults.credProps.prf.first)));

  // 5. Encrypt the mnemonic with the PRF secret
  const encryptedMnemonic = encryptDataWithPassword({ mnemonic: wallet.mnemonic }, prfSecret);

  // 6. Verify registration on the server
  const verificationRes = await fetch('/api/auth/webauthn/verify-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...attestation, userId, encryptedMnemonic }),
  });
  const verificationData = await verificationRes.json();
  if (!verificationRes.ok) throw new Error(verificationData.error || 'Failed to verify passkey registration.');

  // 7. Create session with the token from the server
  const { token } = verificationData;
  await appwriteAccount.createSession(userId, token);


  // 8. Return success status
  return true;
}

/**
 * Implements the passkey authentication (login) flow.
 */
export async function loginWithPasskey(): Promise<boolean> {
  // 1. Get authentication options from the server
  const optionsRes = await fetch('/api/auth/webauthn/authentication/options');
  const options = await optionsRes.json();
  if (!optionsRes.ok) throw new Error(options.error || 'Failed to get authentication options.');

  // 2. Start WebAuthn authentication, requesting PRF results
  const assertion = await startAuthentication(options);

  // 3. Get the PRF results for decryption
  const clientExtensionResults = assertion.clientExtensionResults;
  if (!clientExtensionResults.prf) {
    throw new Error('PRF extension results not found in assertion response.');
  }
  const prfSecret = btoa(String.fromCharCode(...new Uint8Array(clientExtensionResults.prf.first)));

  // 4. Verify the authentication on the server
  const verificationRes = await fetch('/api/auth/webauthn/verify-authentication', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...assertion, challengeId: options.challengeId }),
  });
  const verificationData = await verificationRes.json();
  if (!verificationRes.ok) throw new Error(verificationData.error || 'Failed to verify authentication.');

  // 5. Get the encrypted mnemonic from the server's response
  const { encryptedMnemonic } = verificationData;
  if (!encryptedMnemonic) {
    throw new Error('Encrypted wallet data not found on server.');
  }

  // 6. Decrypt the mnemonic with the PRF secret
  const decryptedData = decryptDataWithPassword<{ mnemonic: string }>(encryptedMnemonic, prfSecret);
  if (!decryptedData?.mnemonic) {
    throw new Error('Failed to decrypt wallet. The passkey may not be the one used for registration.');
  }

  // 7. Now that we have the mnemonic, perform the standard wallet login flow
  const wallet = importWalletFromMnemonic(decryptedData.mnemonic);
  const userId = `wallet:${wallet.address.toLowerCase()}`;

  const nonceRes = await fetch('/api/auth/nonce');
  if (!nonceRes.ok) throw new Error('Failed to get nonce.');
  const { message: nonce } = await nonceRes.json();

  const signature = await signMessage(wallet.privateKey, nonce);

  const tokenRes = await fetch('/api/auth/custom-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: wallet.address, signature, nonce }),
  });
  if (!tokenRes.ok) throw new Error((await tokenRes.json()).error || 'Failed to get session token.');
  const { token } = await tokenRes.json();

  await appwriteAccount.createSession(userId, token);

  // Load the wallet into the global state
  const { useStore } = await import('@/lib/store');
  useStore.getState().loadActiveWallet(decryptedData.mnemonic);

  // 8. Return success status
  return true;
}
