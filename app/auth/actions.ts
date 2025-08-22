"use server";

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionAccount } from '@/lib/appwrite/server';

export async function logout() {
  try {
    const sessionAccount = await getSessionAccount();
    if (sessionAccount) {
      await sessionAccount.deleteSession('current');
    }
  } catch (_error: unknown) {
    // We can ignore the error, as we are deleting the cookie anyway
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');
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
