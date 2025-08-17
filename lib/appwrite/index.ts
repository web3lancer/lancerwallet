import {
  Account,
  Avatars,
  Client,
  Databases,
  Storage,
} from 'appwrite';

// Environment variables
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

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
const storage = new Storage(client);

// Export a structured SDK object
export const AppwriteSDK = {
  config: {
    databaseId: appwriteDatabaseId,
    collections: {
      users: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
      wallets: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WALLETS!,
      transactions: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS!,
      tokens: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOKENS!,
      nfts: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NFTS!,
      webauthnCredentials: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WEBAUTHN_CREDENTIALS!,
      defiPositions: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DEFI_POSITIONS!,
      appSettings: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_SETTINGS!,
      userSettings: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_SETTINGS!,
      priceAlerts: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRICE_ALERTS!,
      hardwareWallets: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_HARDWARE_WALLETS!,
      pluginConfigurations: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLUGIN_CONFIGURATIONS!,
      backups: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BACKUPS!,
      nonces: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NONCES!,
      networks: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NETWORKS!,
      languages: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LANGUAGES!,
      currencies: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CURRENCIES!,
      tokenStandards: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOKEN_STANDARDS!,
      alertTypes: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ALERT_TYPES!,
    },
    buckets: {
      userAvatars: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_USER_AVATARS!,
      nftImages: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_NFT_IMAGES!,
      transactionReceipts: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TRANSACTION_RECEIPTS!,
      backupData: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BACKUP_DATA!,
      appAssets: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_APP_ASSETS!,
      pluginAssets: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PLUGIN_ASSETS!,
    }
  },
  client,
  adminClient,
  account,
  adminDatabases,
  storage,
  avatars: new Avatars(client),
};



// For convenience, we can still export some commonly used services directly
export const appwriteClient = client;
export const appwriteAccount = account;
export { ID } from 'appwrite';
