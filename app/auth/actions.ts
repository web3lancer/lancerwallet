"use server";

import { AppwriteSDK, ID } from '@/lib/appwrite';
import { getSessionAccount } from '@/lib/appwrite/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AppwriteException } from 'appwrite';

export async function signup(email: string, password: string) {
  try {
    await AppwriteSDK.account.create(ID.unique(), email, password);
    const session = await AppwriteSDK.account.createEmailPasswordSession(email, password);

    (await cookies()).set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(session.expire),
    });

  } catch (error: unknown) {
    if (error instanceof AppwriteException && error.code === 409) {
        return { error: 'A user with this email already exists. Please sign in.' };
    }
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'An unknown error occurred during sign up.' };
  }

  redirect('/home');
}

export async function login(email: string, password: string) {
  try {
    const session = await AppwriteSDK.account.createEmailPasswordSession(email, password);

    (await cookies()).set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(session.expire),
    });

  } catch (_error: unknown) {
    return { error: 'Failed to log in. Please check your email and password.' };
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
