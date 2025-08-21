"use server";

import { getSessionAccount } from '@/lib/appwrite/server';
import { generateMnemonic, createWalletFromMnemonic, saveEncryptedWallet } from '@/lib/wallet';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { appwriteAccount } from '@/lib/appwrite';

interface WalletAuthParams {
  method: 'create' | 'import';
  password: string;
  seedPhrase?: string;
}

export async function passkeyAuth() {
  try {
    // Register passkey on client side, then verify server-side
    // This will be implemented with the passkey flow
    // For now, return error to indicate not implemented
    return { error: 'Passkey authentication not yet implemented' };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred during passkey authentication.' };
  }
}

export async function walletAuth({ method, password, seedPhrase }: WalletAuthParams) {
  try {
    let mnemonic: string;
    
    if (method === 'import') {
      if (!seedPhrase) {
        return { error: 'Seed phrase is required for import' };
      }
      mnemonic = seedPhrase.trim();
    } else {
      mnemonic = generateMnemonic();
    }

    const wallet = await createWalletFromMnemonic(mnemonic);
    const address = wallet.address;

    // Get nonce for signature
    const nonceRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/nonce`);
    if (!nonceRes.ok) {
      return { error: 'Failed to get authentication nonce' };
    }
    
    const { key, nonce } = await nonceRes.json();
    const message = `Sign this nonce: ${nonce}`;
    const signature = await wallet.signMessage(message);

    // Get custom token from server
    const tokenRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/custom-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'wallet',
        address,
        signature,
        key,
        nonce,
      }),
    });

    if (!tokenRes.ok) {
      const { error } = await tokenRes.json();
      return { error: error || 'Failed to get session token' };
    }

    const { token } = await tokenRes.json();

    // Create session with Appwrite
    const session = await appwriteAccount.createSession(address, token);
    
    // Set session cookie
    (await cookies()).set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(session.expire),
    });

    // Get user to determine userId for wallet storage
    const user = await appwriteAccount.get();
    
    // Save encrypted wallet
    await saveEncryptedWallet(wallet, password, user.$id);

  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred during wallet authentication.' };
  }

  redirect('/home');
}

export async function logout() {
  try {
    const sessionAccount = await getSessionAccount();
    await sessionAccount.deleteSession('current');
  } catch (_error: unknown) {
    // We can ignore the error, as we are deleting the cookie anyway
  } finally {
    // Always attempt to delete the cookie and redirect
    (await cookies()).delete('appwrite-session');
    redirect('/auth');
  }
}

export async function getLoggedInUser() {
    try {
        const sessionAccount = await getSessionAccount();
        const user = await sessionAccount.get();
        return { user };
    } catch (_error) {
        return { user: null };
    }
}
