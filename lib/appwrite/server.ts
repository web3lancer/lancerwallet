import {
  Account,
  Client,
  Databases,
} from 'appwrite';
import { cookies } from 'next/headers';

// Environment variables
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

if (!appwriteEndpoint || !appwriteProjectId || !appwriteDatabaseId) {
  throw new Error('Appwrite environment variables are not set. Please check your .env.local file.');
}

// Function to get a client with an active user session
export async function getSessionClient() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('appwrite-session');
  if (!sessionCookie) {
    // Return a new client instance if no session
    return new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId);
  }
  // Create a new client and set the session from the cookie
  const sessionClient = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setSession(sessionCookie.value);
  return sessionClient;
}

// A helper function to create a session-aware account object
export async function getSessionAccount() {
  const sessionClient = await getSessionClient();
  return new Account(sessionClient);
}

// Lazy getter for session-aware database client
export async function getSessionDatabases() {
  const sessionClient = await getSessionClient();
  return new Databases(sessionClient);
}
