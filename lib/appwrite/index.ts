import {
  Account,
  Avatars,
  Client,
  Databases,
} from 'appwrite';

// Environment variables
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// Remove appwriteCollectionId, collections are now referenced by ID per schema

if (!appwriteEndpoint || !appwriteProjectId || !appwriteDatabaseId) {
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
  config: {
    databaseId: appwriteDatabaseId,
    // Add collection IDs as needed, e.g. users, wallets, etc.
    usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    walletsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_WALLETS_COLLECTION_ID!,
    transactionsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
    tokensCollectionId: process.env.NEXT_PUBLIC_APPWRITE_TOKENS_COLLECTION_ID!,
    nftsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_NFTS_COLLECTION_ID!,
    // Add others as needed
  },
  client,
  adminClient,
  account,
  adminDatabases,
  avatars: new Avatars(client),
};



// For convenience, we can still export some commonly used services directly
export const appwriteClient = client;
export const appwriteAccount = account;
export { ID } from 'appwrite';
