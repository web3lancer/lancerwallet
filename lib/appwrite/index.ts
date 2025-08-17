import { Client, Account, Databases, Avatars } from 'appwrite';
import { cookies } from 'next/headers';

// Environment variables
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
const appwriteApiKey = process.env.APPWRITE_API_KEY!;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const appwriteCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!;


if (!appwriteEndpoint || !appwriteProjectId || !appwriteDatabaseId || !appwriteCollectionId) {
  throw new Error('Appwrite environment variables are not set. Please check your .env.local file.');
}

// Base client for client-side requests
const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

// Admin client for server-side requests that require admin privileges
const adminClient = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId)
  .setKey(appwriteApiKey);

// Function to get a client with an active user session
async function getSessionClient() {
  const sessionCookie = cookies().get('appwrite-session');
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


// Appwrite services
const account = new Account(client);
const adminDatabases = new Databases(adminClient);

// A helper function to create a session-aware account object
async function getSessionAccount() {
    const sessionClient = await getSessionClient();
    return new Account(sessionClient);
}

// Export a structured SDK object
export const AppwriteSDK = {
  // Config
  config: {
    databaseId: appwriteDatabaseId,
    collectionId: appwriteCollectionId,
  },

  // Base clients
  client,
  adminClient,
  getSessionClient,

  // Services
  account,
  adminDatabases,
  avatars: new Avatars(client),

  // Session-aware services
  getSessionAccount,
  get databases() {
      // Lazy getter for session-aware database client
      return (async () => {
          const sessionClient = await getSessionClient();
          return new Databases(sessionClient);
      })();
  }
};

// For convenience, we can still export some commonly used services directly
export const appwriteClient = client;
export const appwriteAccount = account;
export { ID } from 'appwrite';
