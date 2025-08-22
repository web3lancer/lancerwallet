"use server";

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionAccount } from '@/lib/appwrite/server';
import { serverAdmin } from '@/lib/appwrite/server-admin';
import { AppwriteSDK, appwriteAccount } from '@/lib/appwrite';
import {
  generateNewWallet,
  importWalletFromMnemonic,
  signMessage,
  recoverAddress,
  validateMnemonic
} from '@/lib/wallet';
import { encryptDataWithPassword } from '@/lib/crypto';

interface WalletAuthParams {
  method: 'create' | 'import';
  password: string;
  seedPhrase?: string;
}

export async function walletAuth({ method, password, seedPhrase }: WalletAuthParams) {
  try {
    let walletKeys;
    
    if (method === 'import') {
      if (!seedPhrase || !validateMnemonic(seedPhrase)) {
        return { error: 'A valid 12 or 24-word seed phrase is required for import.' };
      }
      walletKeys = importWalletFromMnemonic(seedPhrase);
    } else {
      walletKeys = generateNewWallet();
    }

    const { address, privateKey, mnemonic } = walletKeys;
    const userId = `wallet:${address.toLowerCase()}`;

    // --- Perform self-contained signature to prove ownership ---
    // This happens on the server during the initial creation flow.
    const nonce = `Welcome to LancerWallet! Sign this message to create your account. Nonce: ${serverAdmin.ID.unique()}`;
    const signature = await signMessage(privateKey, nonce);
    const recovered = recoverAddress(nonce, signature);

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return { error: 'Wallet ownership verification failed. Could not recover address from signature.' };
    }
    // --- Verification complete ---

    // --- Find or Create Appwrite User ---
    let user;
    try {
      user = await serverAdmin.users.get(userId);
    } catch (e: any) {
      if (e.code === 404) {
        user = await serverAdmin.users.create(
          userId,
          undefined, // email
          undefined, // phone
          undefined, // password
          address.toLowerCase() // name
        );
      } else {
        console.error("Error fetching user:", e);
        return { error: "An error occurred while setting up your account." };
      }
    }

    // --- Create Wallet Document in Database ---
    const encryptedMnemonic = encryptDataWithPassword({ mnemonic }, password);

    await serverAdmin.databases.createDocument(
      serverAdmin.dbId,
      AppwriteSDK.config.collections.wallets,
      serverAdmin.ID.unique(),
      {
        userId: user.$id,
        address: address,
        name: `Wallet ${address.slice(0, 6)}...`,
        network: 'ethereum', // default network
        encryptedMnemonic: encryptedMnemonic,
      }
    );

    // --- Create Session ---
    const token = await serverAdmin.users.createToken(user.$id);
    const session = await appwriteAccount.createSession(user.$id, token.secret);
    
    cookies().set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(session.expire),
    });

  } catch (error: unknown) {
    console.error("Wallet Auth Error:", error);
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
    if (sessionAccount) {
      await sessionAccount.deleteSession('current');
    }
  } catch (_error: unknown) {
    // We can ignore the error, as we are deleting the cookie anyway
  } finally {
    cookies().delete('appwrite-session');
    redirect('/auth');
  }
}

export async function getLoggedInUser() {
    try {
        const sessionAccount = await getSessionAccount();
        if (!sessionAccount) return { user: null };
        const user = await sessionAccount.get();
        return { user };
    } catch (_error) {
        return { user: null };
    }
}
