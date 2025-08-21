"use server";

import { getSessionAccount } from '@/lib/appwrite/server';
import { generateMnemonic, createWalletFromMnemonic, saveEncryptedWallet } from '@/lib/wallet';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { appwriteAccount } from '@/lib/appwrite';
import { ethers } from 'ethers';
import { recoverAddress } from '@/lib/appwrite/web3';
import { verifyAndConsumeNonceFromDB, generateNonceForDB } from '@/lib/auth/nonce';
import { AppwriteSDK } from '@/lib/appwrite';

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

    const walletData = await createWalletFromMnemonic(mnemonic);
    const address = walletData.address;

    // Generate nonce directly on server
    const { key, nonce } = await generateNonceForDB();
    const message = `Sign this nonce: ${nonce}`;
    
    // Create ethers wallet to sign the message
    const ethersWallet = ethers.Wallet.fromPhrase(mnemonic);
    const signature = await ethersWallet.signMessage(message);

    // Verify signature server-side
    let recovered: string;
    try {
      recovered = recoverAddress(message, signature);
    } catch {
      return { error: 'Invalid signature' };
    }

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return { error: 'Signature does not match address' };
    }

    // Verify and consume nonce
    const ok = await verifyAndConsumeNonceFromDB(key, nonce);
    if (!ok) {
      return { error: 'Invalid or expired nonce' };
    }

    // Create Appwrite user and token server-side
    const { adminClient } = AppwriteSDK;
    const nodeAppwrite = await import("node-appwrite");
    const NodeClient = nodeAppwrite.Client;
    const Users = nodeAppwrite.Users;
    
    const nodeClient = new NodeClient()
      .setEndpoint(adminClient.config.endpoint)
      .setProject(adminClient.config.project)
      .setKey(process.env.APPWRITE_API_KEY || process.env.APPWRITE_KEY || adminClient.config.devkey);
    
    const users = new Users(nodeClient);
    
    // Deterministic user ID
    const userId = `wallet:${address.toLowerCase()}`;
    
    // Try to get user by ID first
    let user;
    try {
      user = await users.get(userId);
    } catch (e) {
      // If not found, create the user
      user = await users.create(
        userId,
        undefined, // email
        undefined, // phone  
        undefined, // password
        address.toLowerCase() // name
      );
      
      // Set user preferences to store metadata
      try {
        await users.updatePrefs(userId, {
          provider: 'wallet',
          address: address.toLowerCase(),
        });
      } catch (prefError) {
        console.warn("Failed to set user preferences:", prefError);
      }
    }

    // Create a custom token
    const token = await users.createToken(user.$id, 60 * 60, 6); // 1 hour expiry

    // Create session with Appwrite using client SDK
    const session = await appwriteAccount.createSession(address, token.secret);
    
    // Set session cookie
    (await cookies()).set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(session.expire),
    });

    // Save encrypted wallet
    await saveEncryptedWallet(walletData, password, user.$id);

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
