import { Client, Account, Databases, Avatars } from 'appwrite';

// Environment variables
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const appwriteCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!;

if (!appwriteEndpoint || !appwriteProjectId || !appwriteDatabaseId || !appwriteCollectionId) {
  throw new Error('Appwrite environment variables are not set. Please check your .env.local file.');
}

// Base client for client-side requests
const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

// Admin client for server-side requests (no API key in JS SDK)
const adminClient = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

// Appwrite services
const account = new Account(client);
const adminDatabases = new Databases(adminClient);

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

  // Services
  account,
  adminDatabases,
  avatars: new Avatars(client),
};



// For convenience, we can still export some commonly used services directly
export const appwriteClient = client;
export const appwriteAccount = account;
export { ID } from 'appwrite';
