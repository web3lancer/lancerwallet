// Bootstrap complete Appwrite database, collections, storage, and config data
// Load environment variables from .env
require('dotenv').config();
// Requires env: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY, NEXT_PUBLIC_APPWRITE_DATABASE_ID

// Use the Node.js server SDK for administrative operations
// and CommonJS require so this file runs with `node` without ESM config
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, Databases, Storage, Permission, Role } = require('node-appwrite');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "lancerwallet_db";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing required env: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const db = new Databases(client);
const storage = new Storage(client);

// Small helper to wait for Appwrite to finish creating attributes and indexes
async function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

async function waitForAttributeAvailable(collectionId, key, { timeoutMs = 60000, intervalMs = 500 } = {}) {
  const start = Date.now();
  // Poll until attribute status becomes 'available'
  // This avoids race conditions where indexing starts before attribute is ready
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const attr = await db.getAttribute(databaseId, collectionId, key);
      if (attr && attr.status === 'available') return;
    } catch (e) {
      // Swallow transient not-found during propagation
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for attribute ${collectionId}.${key} to become available`);
    }
    await sleep(intervalMs);
  }
}

async function waitForIndexAvailable(collectionId, key, { timeoutMs = 60000, intervalMs = 500 } = {}) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const idx = await db.getIndex(databaseId, collectionId, key);
      if (idx && idx.status === 'available') return;
    } catch (e) {
      // ignore until exists
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for index ${collectionId}.${key} to become available`);
    }
    await sleep(intervalMs);
  }
}

async function ensureDatabase() {
  try {
    await db.get(databaseId);
    console.log(`Database exists: ${databaseId}`);
  } catch (e) {
    console.log(`Creating database: ${databaseId}`);
    await db.create(databaseId, "LancerWallet Database");
  }
}

async function ensureCollection(collectionId, name, permissions = undefined, documentSecurity = true) {
  try {
    await db.getCollection(databaseId, collectionId);
    console.log(`Collection exists: ${collectionId}`);
  } catch (e) {
    console.log(`Creating collection: ${collectionId}`);
  await db.createCollection(databaseId, collectionId, name, permissions, documentSecurity);
  }
}

async function ensureStringAttribute(collectionId, key, size, required = true, array = false, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding string attribute: ${collectionId}.${key}`);
    await db.createStringAttribute(databaseId, collectionId, key, size, required, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureIntegerAttribute(collectionId, key, required = true, array = false, min = undefined, max = undefined, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding integer attribute: ${collectionId}.${key}`);
    await db.createIntegerAttribute(databaseId, collectionId, key, required, min, max, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureBooleanAttribute(collectionId, key, required = true, array = false, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding boolean attribute: ${collectionId}.${key}`);
    await db.createBooleanAttribute(databaseId, collectionId, key, required, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureEmailAttribute(collectionId, key, required = true, array = false, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding email attribute: ${collectionId}.${key}`);
    await db.createEmailAttribute(databaseId, collectionId, key, required, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureUrlAttribute(collectionId, key, required = true, array = false, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding URL attribute: ${collectionId}.${key}`);
    await db.createUrlAttribute(databaseId, collectionId, key, required, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureDatetimeAttribute(collectionId, key, required = true, array = false, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding datetime attribute: ${collectionId}.${key}`);
    await db.createDatetimeAttribute(databaseId, collectionId, key, required, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureFloatAttribute(collectionId, key, required = true, array = false, min = undefined, max = undefined, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding float attribute: ${collectionId}.${key}`);
    await db.createFloatAttribute(databaseId, collectionId, key, required, min, max, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureEnumAttribute(collectionId, key, elements, required = true, array = false, defaultValue = undefined, encrypt = false) {
  try {
    const existing = await db.getAttribute(databaseId, collectionId, key);
    if (!existing || existing.status !== 'available') {
      await waitForAttributeAvailable(collectionId, key);
    }
  } catch (e) {
    console.log(`Adding enum attribute: ${collectionId}.${key}`);
    await db.createEnumAttribute(databaseId, collectionId, key, elements, required, defaultValue, array, encrypt);
    await waitForAttributeAvailable(collectionId, key);
  }
}

async function ensureIndex(collectionId, key, type, attributes, orders = undefined) {
  try {
    await db.getIndex(databaseId, collectionId, key);
  } catch (e) {
    console.log(`Creating index: ${collectionId}.${key}`);
    await db.createIndex(databaseId, collectionId, key, type, attributes, orders);
  await waitForIndexAvailable(collectionId, key);
  }
}

async function ensureStorageBucket(bucketId, name, permissions, fileSecurity = true, enabled = true, maximumFileSize = undefined, allowedFileExtensions = undefined, compression = "none", encryption = true, antivirus = true) {
  try {
    await storage.getBucket(bucketId);
    console.log(`Storage bucket exists: ${bucketId}`);
  } catch (e) {
    console.log(`Creating storage bucket: ${bucketId}`);
    await storage.createBucket(bucketId, name, permissions, fileSecurity, enabled, maximumFileSize, allowedFileExtensions, compression, encryption, antivirus);
  }
}

async function seedDocuments(collectionId, docs, idKey = "key") {
  for (const doc of docs) {
    const docId = doc[idKey];
    try {
      await db.getDocument(databaseId, collectionId, docId);
      console.log(`Document exists: ${collectionId}/${docId}`);
    } catch (e) {
      console.log(`Creating document: ${collectionId}/${docId}`);
      await db.createDocument(databaseId, collectionId, docId, doc);
    }
  }
}

async function bootstrap() {
  // Step 1: Ensure database exists
  await ensureDatabase();

  // Step 2: Create main collections
  await createMainCollections();

  // Step 3: Create storage buckets
  await createStorageBuckets();

  // Step 4: Create and seed config collections
  await createConfigCollections();

  console.log("Complete bootstrap finished successfully!");
}

async function createMainCollections() {
  console.log("Creating main collections...");

  // 1. Users Collection
  await ensureCollection("users", "Users", [
    Permission.read(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.team("admin"))
  ]);
  // userId is a plain string (not encrypted). Size 100 per schema.
  await ensureStringAttribute("users", "userId", 100, true, false, undefined, false);
  // email is encrypted for user privacy
  await ensureEmailAttribute("users", "email", true, false, undefined, true);
  // displayName is encrypted for user privacy
  await ensureStringAttribute("users", "displayName", 100, false, false, undefined, true);
  // profileImage URL is encrypted for user privacy
  await ensureUrlAttribute("users", "profileImage", false, false, undefined, true);
  // lastLogin is not encrypted - needed for functionality
  await ensureDatetimeAttribute("users", "lastLogin", false);
  // Appwrite does not allow setting a default on a required attribute.
  // Make accountStatus non-required so we can set a default value safely.
  // accountStatus is not encrypted - needed for filtering/status checks
  await ensureEnumAttribute("users", "accountStatus", ["active", "suspended", "deleted"], false, false, "active", false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("users", "createdAt", true);
  await ensureDatetimeAttribute("users", "updatedAt", true);
  
  await ensureIndex("users", "userId_idx", "unique", ["userId"]);
  await ensureIndex("users", "email_idx", "unique", ["email"]);
  await ensureIndex("users", "accountStatus_idx", "key", ["accountStatus"]);
  await ensureIndex("users", "createdAt_idx", "key", ["createdAt"]);

  // 2. Wallets Collection
  await ensureCollection("wallets", "Wallets", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // walletId is a system ID, not encrypted
  await ensureStringAttribute("wallets", "walletId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("wallets", "userId", 100, true, false, undefined, false);
  // address is public blockchain data, not encrypted
  await ensureStringAttribute("wallets", "address", 100, true, false, undefined, false);
  // name is encrypted for user privacy
  await ensureStringAttribute("wallets", "name", 100, true, false, undefined, true);
  // network is public blockchain data, not encrypted
  await ensureStringAttribute("wallets", "network", 50, true, false, undefined, false);
  // Store encrypted wallet data using Appwrite's encrypted attribute (requires size >= 150)
  await ensureStringAttribute("wallets", "encryptedWalletData", 5000, true, false, undefined, true);
  // walletType is not encrypted - needed for filtering
  await ensureStringAttribute("wallets", "walletType", 50, true, false, "imported", false);
  // isActive is not encrypted - needed for filtering
  await ensureBooleanAttribute("wallets", "isActive", true, false, true, false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("wallets", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("wallets", "updatedAt", true, false, undefined, false);

  await ensureIndex("wallets", "userId_idx", "key", ["userId"]);
  await ensureIndex("wallets", "address_idx", "unique", ["address"]);
  await ensureIndex("wallets", "network_idx", "key", ["network"]);
  await ensureIndex("wallets", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("wallets", "walletId_idx", "unique", ["walletId"]);
  await ensureIndex("wallets", "createdAt_idx", "key", ["createdAt"]);

  // 3. Transactions Collection
  await ensureCollection("transactions", "Transactions", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // transactionId is a system ID, not encrypted
  await ensureStringAttribute("transactions", "transactionId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("transactions", "userId", 100, true, false, undefined, false);
  // walletId is a system reference, not encrypted
  await ensureStringAttribute("transactions", "walletId", 100, true, false, undefined, false);
  // hash is public blockchain data, not encrypted
  await ensureStringAttribute("transactions", "hash", 100, true, false, undefined, false);
  // addresses are public blockchain data, not encrypted
  await ensureStringAttribute("transactions", "fromAddress", 100, true, false, undefined, false);
  await ensureStringAttribute("transactions", "toAddress", 100, true, false, undefined, false);
  // value is financial data, encrypted for privacy
  await ensureStringAttribute("transactions", "value", 100, true, false, undefined, true);
  // network is public blockchain data, not encrypted
  await ensureStringAttribute("transactions", "network", 50, true, false, undefined, false);
  // status is not encrypted - needed for filtering
  await ensureStringAttribute("transactions", "status", 20, true, false, undefined, false);
  // type is not encrypted - needed for filtering
  await ensureStringAttribute("transactions", "type", 20, true, false, undefined, false);
  // timestamp is not encrypted - needed for filtering/sorting
  await ensureDatetimeAttribute("transactions", "timestamp", true, false, undefined, false);
  // notes are encrypted for user privacy
  await ensureStringAttribute("transactions", "notes", 500, false, false, undefined, true);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("transactions", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("transactions", "updatedAt", true, false, undefined, false);

  await ensureIndex("transactions", "userId_idx", "key", ["userId"]);
  await ensureIndex("transactions", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("transactions", "hash_idx", "unique", ["hash"]);
  await ensureIndex("transactions", "fromAddress_idx", "key", ["fromAddress"]);
  await ensureIndex("transactions", "toAddress_idx", "key", ["toAddress"]);
  await ensureIndex("transactions", "status_idx", "key", ["status"]);
  await ensureIndex("transactions", "type_idx", "key", ["type"]);
  await ensureIndex("transactions", "network_idx", "key", ["network"]);
  await ensureIndex("transactions", "timestamp_idx", "key", ["timestamp"]);
  await ensureIndex("transactions", "transactionId_idx", "unique", ["transactionId"]);
  await ensureIndex("transactions", "createdAt_idx", "key", ["createdAt"]);

  // 4. Tokens Collection
  await ensureCollection("tokens", "Tokens", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // tokenId is a system ID, not encrypted
  await ensureStringAttribute("tokens", "tokenId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("tokens", "userId", 100, true, false, undefined, false);
  // walletId is a system reference, not encrypted
  await ensureStringAttribute("tokens", "walletId", 100, true, false, undefined, false);
  // contractAddress is public blockchain data, not encrypted
  await ensureStringAttribute("tokens", "contractAddress", 100, true, false, undefined, false);
  // symbol is public blockchain data, not encrypted
  await ensureStringAttribute("tokens", "symbol", 20, true, false, undefined, false);
  // name is public blockchain data, not encrypted
  await ensureStringAttribute("tokens", "name", 100, true, false, undefined, false);
  // decimals is public blockchain data, not encrypted
  await ensureIntegerAttribute("tokens", "decimals", true, false, undefined, undefined, undefined, false);
  // balance is financial data, encrypted for privacy
  await ensureStringAttribute("tokens", "balance", 100, true, false, undefined, true);
  // network is public blockchain data, not encrypted
  await ensureStringAttribute("tokens", "network", 50, true, false, undefined, false);
  // isNative is not encrypted - needed for filtering
  await ensureBooleanAttribute("tokens", "isNative", true, false, false, false);
  // isActive is not encrypted - needed for filtering
  await ensureBooleanAttribute("tokens", "isActive", true, false, true, false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("tokens", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("tokens", "updatedAt", true, false, undefined, false);

  await ensureIndex("tokens", "userId_idx", "key", ["userId"]);
  await ensureIndex("tokens", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("tokens", "contractAddress_idx", "key", ["contractAddress"]);
  await ensureIndex("tokens", "symbol_idx", "key", ["symbol"]);
  await ensureIndex("tokens", "network_idx", "key", ["network"]);
  await ensureIndex("tokens", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("tokens", "tokenId_idx", "unique", ["tokenId"]);
  await ensureIndex("tokens", "createdAt_idx", "key", ["createdAt"]);

  // 5. NFTs Collection
  await ensureCollection("nfts", "NFTs", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // nftId is a system ID, not encrypted
  await ensureStringAttribute("nfts", "nftId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("nfts", "userId", 100, true, false, undefined, false);
  // walletId is a system reference, not encrypted
  await ensureStringAttribute("nfts", "walletId", 100, true, false, undefined, false);
  // contractAddress is public blockchain data, not encrypted
  await ensureStringAttribute("nfts", "contractAddress", 100, true, false, undefined, false);
  // tokenId is public blockchain data, not encrypted
  await ensureStringAttribute("nfts", "tokenId", 100, true, false, undefined, false);
  // name is public but can be filtered, not encrypted for functionality
  await ensureStringAttribute("nfts", "name", 200, true, false, undefined, false);
  // description is encrypted for user privacy
  await ensureStringAttribute("nfts", "description", 2000, false, false, undefined, true);
  // imageStorageId is encrypted for user privacy
  await ensureStringAttribute("nfts", "imageStorageId", 100, false, false, undefined, true);
  // collection is public but can be filtered, not encrypted for functionality
  await ensureStringAttribute("nfts", "collection", 100, true, false, undefined, false);
  // standard is public blockchain data, not encrypted
  await ensureStringAttribute("nfts", "standard", 20, true, false, "ERC721", false);
  // network is public blockchain data, not encrypted
  await ensureStringAttribute("nfts", "network", 50, true, false, undefined, false);
  // metadata is encrypted for user privacy
  await ensureStringAttribute("nfts", "metadata", 5000, false, false, undefined, true);
  // isActive is not encrypted - needed for filtering
  await ensureBooleanAttribute("nfts", "isActive", true, false, true, false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("nfts", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("nfts", "updatedAt", true, false, undefined, false);

  await ensureIndex("nfts", "userId_idx", "key", ["userId"]);
  await ensureIndex("nfts", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("nfts", "contractAddress_idx", "key", ["contractAddress"]);
  await ensureIndex("nfts", "tokenId_idx", "key", ["tokenId"]);
  await ensureIndex("nfts", "collection_idx", "key", ["collection"]);
  await ensureIndex("nfts", "network_idx", "key", ["network"]);
  await ensureIndex("nfts", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("nfts", "nftId_idx", "unique", ["nftId"]);
  await ensureIndex("nfts", "createdAt_idx", "key", ["createdAt"]);

  // 6. WebAuthn Credentials Collection
  await ensureCollection("webauthn_credentials", "WebAuthn Credentials", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // credentialId is not encrypted - needed for authentication lookups
  await ensureStringAttribute("webauthn_credentials", "credentialId", 200, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("webauthn_credentials", "userId", 100, true, false, undefined, false);
  // publicKey is encrypted for user security
  await ensureStringAttribute("webauthn_credentials", "publicKey", 1000, true, false, undefined, true);
  // counter is not encrypted - needed for security validation
  await ensureIntegerAttribute("webauthn_credentials", "counter", true, false, undefined, undefined, 0, false);
  // deviceName is encrypted for user privacy
  await ensureStringAttribute("webauthn_credentials", "deviceName", 100, false, false, undefined, true);
  // deviceType is not encrypted - needed for filtering
  await ensureEnumAttribute("webauthn_credentials", "deviceType", ["platform", "cross-platform"], false, false, undefined, false);
  // isActive is not encrypted - needed for filtering
  await ensureBooleanAttribute("webauthn_credentials", "isActive", true, false, true, false);
  // lastUsed is not encrypted - needed for functionality
  await ensureDatetimeAttribute("webauthn_credentials", "lastUsed", false, false, undefined, false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("webauthn_credentials", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("webauthn_credentials", "updatedAt", true, false, undefined, false);

  await ensureIndex("webauthn_credentials", "userId_idx", "key", ["userId"]);
  await ensureIndex("webauthn_credentials", "credentialId_idx", "unique", ["credentialId"]);
  await ensureIndex("webauthn_credentials", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("webauthn_credentials", "lastUsed_idx", "key", ["lastUsed"]);
  await ensureIndex("webauthn_credentials", "createdAt_idx", "key", ["createdAt"]);

  // 7. DeFi Positions Collection
  await ensureCollection("defi_positions", "DeFi Positions", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // positionId is a system ID, not encrypted
  await ensureStringAttribute("defi_positions", "positionId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("defi_positions", "userId", 100, true, false, undefined, false);
  // walletId is a system reference, not encrypted
  await ensureStringAttribute("defi_positions", "walletId", 100, true, false, undefined, false);
  // protocol is not encrypted - needed for filtering
  await ensureStringAttribute("defi_positions", "protocol", 50, true, false, undefined, false);
  // positionType is not encrypted - needed for filtering
  await ensureStringAttribute("defi_positions", "positionType", 30, true, false, undefined, false);
  // contractAddress is public blockchain data, not encrypted
  await ensureStringAttribute("defi_positions", "contractAddress", 100, true, false, undefined, false);
  // tokenA is public blockchain data, not encrypted
  await ensureStringAttribute("defi_positions", "tokenA", 20, false, false, undefined, false);
  // tokenB is public blockchain data, not encrypted
  await ensureStringAttribute("defi_positions", "tokenB", 20, false, false, undefined, false);
  // amount is financial data, encrypted for privacy
  await ensureStringAttribute("defi_positions", "amount", 100, true, false, undefined, true);
  // network is public blockchain data, not encrypted
  await ensureStringAttribute("defi_positions", "network", 50, true, false, undefined, false);
  // isActive is not encrypted - needed for filtering
  await ensureBooleanAttribute("defi_positions", "isActive", true, false, true, false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("defi_positions", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("defi_positions", "updatedAt", true, false, undefined, false);

  await ensureIndex("defi_positions", "userId_idx", "key", ["userId"]);
  await ensureIndex("defi_positions", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("defi_positions", "protocol_idx", "key", ["protocol"]);
  await ensureIndex("defi_positions", "positionType_idx", "key", ["positionType"]);
  await ensureIndex("defi_positions", "network_idx", "key", ["network"]);
  await ensureIndex("defi_positions", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("defi_positions", "positionId_idx", "unique", ["positionId"]);
  await ensureIndex("defi_positions", "createdAt_idx", "key", ["createdAt"]);

  // 8. App Settings Collection
  await ensureCollection("app_settings", "App Settings", [
    Permission.read(Role.any()),
    Permission.create(Role.team("admin")),
    Permission.update(Role.team("admin")),
    Permission.delete(Role.team("admin"))
  ]);
  await ensureStringAttribute("app_settings", "settingId", 100, true, false, undefined, false);
  await ensureStringAttribute("app_settings", "key", 100, true, false, undefined, true);
  await ensureStringAttribute("app_settings", "value", 5000, true);
  await ensureStringAttribute("app_settings", "category", 50, true);
  await ensureStringAttribute("app_settings", "description", 200, false);
  await ensureBooleanAttribute("app_settings", "isPublic", true, false, false);
  await ensureDatetimeAttribute("app_settings", "createdAt", true);
  await ensureDatetimeAttribute("app_settings", "updatedAt", true);

  await ensureIndex("app_settings", "key_idx", "unique", ["key"]);
  await ensureIndex("app_settings", "category_idx", "key", ["category"]);
  await ensureIndex("app_settings", "isPublic_idx", "key", ["isPublic"]);
  await ensureIndex("app_settings", "settingId_idx", "unique", ["settingId"]);

  // 9. User Settings Collection
  await ensureCollection("user_settings", "User Settings", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // settingId is a system ID, not encrypted
  await ensureStringAttribute("user_settings", "settingId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("user_settings", "userId", 100, true, false, undefined, false);
  // theme is encrypted for user privacy
  await ensureStringAttribute("user_settings", "theme", 20, true, false, "auto", true);
  // currency is encrypted for user privacy
  await ensureStringAttribute("user_settings", "currency", 10, true, false, "USD", true);
  // language is encrypted for user privacy
  await ensureStringAttribute("user_settings", "language", 10, true, false, "en", true);
  // defaultNetwork is encrypted for user privacy
  await ensureStringAttribute("user_settings", "defaultNetwork", 50, true, false, "ethereum", true);
  // notifications are encrypted for user privacy
  await ensureStringAttribute("user_settings", "notifications", 5000, true, false, undefined, true);
  // security settings are encrypted for user privacy
  await ensureStringAttribute("user_settings", "security", 5000, true, false, undefined, true);
  // advanced settings are encrypted for user privacy
  await ensureStringAttribute("user_settings", "advanced", 5000, false, false, undefined, true);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("user_settings", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("user_settings", "updatedAt", true, false, undefined, false);

  await ensureIndex("user_settings", "userId_idx", "unique", ["userId"]);
  await ensureIndex("user_settings", "settingId_idx", "unique", ["settingId"]);

  // 10. Price Alerts Collection
  await ensureCollection("price_alerts", "Price Alerts", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // alertId is a system ID, not encrypted
  await ensureStringAttribute("price_alerts", "alertId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("price_alerts", "userId", 100, true, false, undefined, false);
  // symbol is not encrypted - needed for filtering
  await ensureStringAttribute("price_alerts", "symbol", 20, true, false, undefined, false);
  // contractAddress is public blockchain data, not encrypted
  await ensureStringAttribute("price_alerts", "contractAddress", 100, false, false, undefined, false);
  // network is public blockchain data, not encrypted
  await ensureStringAttribute("price_alerts", "network", 50, true, false, undefined, false);
  // alertType is not encrypted - needed for filtering
  await ensureStringAttribute("price_alerts", "alertType", 30, true, false, undefined, false);
  // targetPrice is financial data, encrypted for privacy
  await ensureFloatAttribute("price_alerts", "targetPrice", false, false, undefined, undefined, undefined, true);
  // changePercent is financial data, encrypted for privacy
  await ensureFloatAttribute("price_alerts", "changePercent", false, false, undefined, undefined, undefined, true);
  // currentPrice is public market data, not encrypted
  await ensureFloatAttribute("price_alerts", "currentPrice", false, false, undefined, undefined, undefined, false);
  // isActive is not encrypted - needed for filtering
  await ensureBooleanAttribute("price_alerts", "isActive", true, false, true, false);
  // triggered is not encrypted - needed for filtering
  await ensureBooleanAttribute("price_alerts", "triggered", true, false, false, false);
  // triggeredAt is not encrypted - needed for functionality
  await ensureDatetimeAttribute("price_alerts", "triggeredAt", false, false, undefined, false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("price_alerts", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("price_alerts", "updatedAt", true, false, undefined, false);

  await ensureIndex("price_alerts", "userId_idx", "key", ["userId"]);
  await ensureIndex("price_alerts", "symbol_idx", "key", ["symbol"]);
  await ensureIndex("price_alerts", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("price_alerts", "triggered_idx", "key", ["triggered"]);
  await ensureIndex("price_alerts", "alertId_idx", "unique", ["alertId"]);

  // 11. Hardware Wallets Collection
  await ensureCollection("hardware_wallets", "Hardware Wallets", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // hardwareWalletId is a system ID, not encrypted
  await ensureStringAttribute("hardware_wallets", "hardwareWalletId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("hardware_wallets", "userId", 100, true, false, undefined, false);
  // deviceType is not encrypted - needed for filtering
  await ensureStringAttribute("hardware_wallets", "deviceType", 50, true, false, undefined, false);
  // deviceModel is public hardware info, not encrypted
  await ensureStringAttribute("hardware_wallets", "deviceModel", 50, false, false, undefined, false);
  // deviceId is encrypted for user security
  await ensureStringAttribute("hardware_wallets", "deviceId", 100, true, false, undefined, true);
  // publicKey is encrypted for user security
  await ensureStringAttribute("hardware_wallets", "publicKey", 1000, true, false, undefined, true);
  // derivationPath is encrypted for user security
  await ensureStringAttribute("hardware_wallets", "derivationPath", 100, true, false, undefined, true);
  // addresses are encrypted for user privacy
  await ensureStringAttribute("hardware_wallets", "addresses", 5000, true, false, undefined, true);
  // name is encrypted for user privacy
  await ensureStringAttribute("hardware_wallets", "name", 100, true, false, undefined, true);
  // isActive is not encrypted - needed for filtering
  await ensureBooleanAttribute("hardware_wallets", "isActive", true, false, true, false);
  // lastConnected is not encrypted - needed for functionality
  await ensureDatetimeAttribute("hardware_wallets", "lastConnected", false, false, undefined, false);
  // Timestamps are not encrypted - needed for system functionality
  await ensureDatetimeAttribute("hardware_wallets", "createdAt", true, false, undefined, false);
  await ensureDatetimeAttribute("hardware_wallets", "updatedAt", true, false, undefined, false);

  await ensureIndex("hardware_wallets", "userId_idx", "key", ["userId"]);
  await ensureIndex("hardware_wallets", "deviceId_idx", "key", ["deviceId"]);
  await ensureIndex("hardware_wallets", "deviceType_idx", "key", ["deviceType"]);
  await ensureIndex("hardware_wallets", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("hardware_wallets", "hardwareWalletId_idx", "unique", ["hardwareWalletId"]);

  // 12. Plugin Configurations Collection
  await ensureCollection("plugin_configurations", "Plugin Configurations", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("plugin_configurations", "configId", 100, true, false, undefined, false);
  await ensureStringAttribute("plugin_configurations", "userId", 100, true);
  await ensureStringAttribute("plugin_configurations", "pluginId", 100, true);
  await ensureStringAttribute("plugin_configurations", "pluginName", 100, true);
  await ensureStringAttribute("plugin_configurations", "version", 20, true);
  await ensureBooleanAttribute("plugin_configurations", "enabled", true, false, true);
  await ensureStringAttribute("plugin_configurations", "configuration", 20000, true);
  await ensureStringAttribute("plugin_configurations", "permissions", 5000, false);
  await ensureDatetimeAttribute("plugin_configurations", "lastUsed", false);
  await ensureDatetimeAttribute("plugin_configurations", "createdAt", true);
  await ensureDatetimeAttribute("plugin_configurations", "updatedAt", true);

  await ensureIndex("plugin_configurations", "userId_idx", "key", ["userId"]);
  await ensureIndex("plugin_configurations", "pluginId_idx", "key", ["pluginId"]);
  await ensureIndex("plugin_configurations", "enabled_idx", "key", ["enabled"]);
  await ensureIndex("plugin_configurations", "lastUsed_idx", "key", ["lastUsed"]);
  await ensureIndex("plugin_configurations", "configId_idx", "unique", ["configId"]);

  // 13. Backups Collection
  await ensureCollection("backups", "Backups", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  // backupId is a system ID, not encrypted
  await ensureStringAttribute("backups", "backupId", 100, true, false, undefined, false);
  // userId is a system reference, not encrypted
  await ensureStringAttribute("backups", "userId", 100, true, false, undefined, false);
  // fileId is encrypted for user privacy
  await ensureStringAttribute("backups", "fileId", 100, true, false, undefined, true);
  // backupType is not encrypted - needed for filtering
  await ensureStringAttribute("backups", "backupType", 30, true, false, undefined, false);
  // timestamp is not encrypted - needed for functionality
  await ensureDatetimeAttribute("backups", "timestamp", true, false, undefined, false);
  // size is encrypted for user privacy
  await ensureIntegerAttribute("backups", "size", true, false, undefined, undefined, undefined, true);
  // notes are encrypted for user privacy
  await ensureStringAttribute("backups", "notes", 500, false, false, undefined, true);

  await ensureIndex("backups", "userId_idx", "key", ["userId"]);
  await ensureIndex("backups", "fileId_idx", "key", ["fileId"]);
  await ensureIndex("backups", "backupType_idx", "key", ["backupType"]);
  await ensureIndex("backups", "timestamp_idx", "key", ["timestamp"]);
  await ensureIndex("backups", "backupId_idx", "unique", ["backupId"]);

  // 14. Nonces Collection
  await ensureCollection("nonces", "Nonces", [
    Permission.read(Role.any()),
    Permission.create(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.team("admin"))
  ]);
  await ensureStringAttribute("nonces", "nonceId", 100, true, false, undefined, false);
  await ensureStringAttribute("nonces", "key", 100, true, false, undefined, false);
  await ensureStringAttribute("nonces", "nonce", 100, true);
  await ensureDatetimeAttribute("nonces", "expiresAt", true);
  await ensureBooleanAttribute("nonces", "used", true, false, false);
  await ensureDatetimeAttribute("nonces", "createdAt", true);

  await ensureIndex("nonces", "key_idx", "unique", ["key"]);
  await ensureIndex("nonces", "expiresAt_idx", "key", ["expiresAt"]);
  await ensureIndex("nonces", "used_idx", "key", ["used"]);
  await ensureIndex("nonces", "createdAt_idx", "key", ["createdAt"]);
  await ensureIndex("nonces", "nonceId_idx", "unique", ["nonceId"]);

  console.log("Main collections created successfully!");
}

async function createStorageBuckets() {
  console.log("Creating storage buckets...");

  // 1. User Avatars Bucket (public read via signed URLs; writes scoped to user)
  await ensureStorageBucket(
    "user-avatars",
    "User Avatars",
    [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.user("USER_ID")),
      Permission.delete(Role.user("USER_ID"))
    ],
  true, // fileSecurity (enforce per-file permissions even though read can be public via signed URLs)
    true, // enabled
    5242880, // 5MB max
    ["jpg", "jpeg", "png", "gif", "webp"],
    "gzip", // compression
    true, // encryption
    true // antivirus
  );

  // 2. NFT Images Bucket
  await ensureStorageBucket(
    "nft-images",
    "NFT Images",
    [
      Permission.read(Role.user("USER_ID")),
      Permission.create(Role.user("USER_ID")),
      Permission.update(Role.user("USER_ID")),
      Permission.delete(Role.user("USER_ID"))
    ],
    true,
    true,
    20971520, // 20MB max
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm"],
    "gzip",
    true,
    true
  );

  // 3. Transaction Receipts Bucket
  await ensureStorageBucket(
    "transaction-receipts",
    "Transaction Receipts",
    [
      Permission.read(Role.user("USER_ID")),
      Permission.create(Role.user("USER_ID")),
      Permission.update(Role.user("USER_ID")),
      Permission.delete(Role.user("USER_ID"))
    ],
    true,
    true,
    10485760, // 10MB max
    ["pdf", "jpg", "jpeg", "png", "txt"],
    "none", // no compression for documents
    true,
    true
  );

  // 4. Backup Data Bucket
  await ensureStorageBucket(
    "backup-data",
    "Backup Data",
    [
      Permission.read(Role.user("USER_ID")),
      Permission.create(Role.user("USER_ID")),
      Permission.delete(Role.user("USER_ID"))
    ],
    true,
    true,
    52428800, // 50MB max
    ["json", "txt", "bin"],
    "gzip",
    true,
    true
  );

  // 5. App Assets Bucket
  await ensureStorageBucket(
    "app-assets",
    "App Assets",
    [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin"))
    ],
    false, // public assets
    true,
    104857600, // 100MB max
    ["jpg", "jpeg", "png", "svg", "json", "css", "js"],
    "gzip",
    false, // no encryption for public assets
    true
  );

  // 6. Plugin Assets Bucket (public assets for discovery)
  await ensureStorageBucket(
    "plugin-assets",
    "Plugin Assets",
    [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin"))
    ],
  false, // fileSecurity disabled for public assets
    true,
    104857600, // 100MB max
    ["jpg", "jpeg", "png", "svg", "json", "js", "zip"],
    "gzip",
    true,
    true
  );

  console.log("Storage buckets created successfully!");
}

async function createConfigCollections() {
  console.log("Creating and seeding config collections...");

  // Networks
  await ensureCollection("networks", "Networks", [
    Permission.read(Role.any()),
    Permission.create(Role.team("admin")),
    Permission.update(Role.team("admin")),
    Permission.delete(Role.team("admin"))
  ]);
  await ensureStringAttribute("networks", "key", 50, true, false, undefined, true);
  await ensureStringAttribute("networks", "name", 100, true);
  await ensureIntegerAttribute("networks", "chainId", false);
  await ensureStringAttribute("networks", "type", 30, true);
  await ensureStringAttribute("networks", "rpcUrl", 500, false);
  await ensureStringAttribute("networks", "explorerUrl", 500, false);
  await ensureStringAttribute("networks", "nativeSymbol", 20, false);
  await ensureBooleanAttribute("networks", "enabled", true, false, true);
  await ensureIntegerAttribute("networks", "order", false);
  await ensureStringAttribute("networks", "metadata", 5000, false);

  await seedDocuments("networks", [
    { key: "ethereum", name: "Ethereum", chainId: 1, type: "evm", nativeSymbol: "ETH", enabled: true, order: 1 },
    { key: "polygon", name: "Polygon", chainId: 137, type: "evm", nativeSymbol: "MATIC", enabled: true, order: 2 },
    { key: "bsc", name: "BNB Smart Chain", chainId: 56, type: "evm", nativeSymbol: "BNB", enabled: true, order: 3 },
    { key: "arbitrum", name: "Arbitrum One", chainId: 42161, type: "evm", nativeSymbol: "ETH", enabled: true, order: 4 },
  ]);

  // Languages
  await ensureCollection("languages", "Languages");
  await ensureStringAttribute("languages", "code", 10, true, false, undefined, true);
  await ensureStringAttribute("languages", "name", 100, true);
  await ensureBooleanAttribute("languages", "enabled", true, false, true);
  await ensureIntegerAttribute("languages", "order", false);

  await seedDocuments("languages", [
    { code: "en", name: "English", enabled: true, order: 1 },
    { code: "es", name: "Spanish", enabled: true, order: 2 },
  ], "code");

  // Currencies
  await ensureCollection("currencies", "Currencies");
  await ensureStringAttribute("currencies", "code", 10, true, false, undefined, true);
  await ensureStringAttribute("currencies", "symbol", 10, true);
  await ensureStringAttribute("currencies", "name", 100, true);
  await ensureIntegerAttribute("currencies", "decimals", true, false, 0, 18, 2);
  await ensureBooleanAttribute("currencies", "enabled", true, false, true);
  await ensureIntegerAttribute("currencies", "order", false);

  await seedDocuments("currencies", [
    { code: "USD", symbol: "$", name: "US Dollar", decimals: 2, enabled: true, order: 1 },
    { code: "EUR", symbol: "€", name: "Euro", decimals: 2, enabled: true, order: 2 },
    { code: "GBP", symbol: "£", name: "British Pound", decimals: 2, enabled: true, order: 3 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0, enabled: true, order: 4 },
  ], "code");

  // Token standards
  await ensureCollection("token_standards", "Token Standards");
  await ensureStringAttribute("token_standards", "key", 20, true, false, undefined, true);
  await ensureStringAttribute("token_standards", "name", 100, true);
  await ensureBooleanAttribute("token_standards", "enabled", true, false, true);
  await ensureIntegerAttribute("token_standards", "order", false);

  await seedDocuments("token_standards", [
    { key: "ERC20", name: "ERC-20", enabled: true, order: 1 },
    { key: "ERC721", name: "ERC-721", enabled: true, order: 2 },
    { key: "ERC1155", name: "ERC-1155", enabled: true, order: 3 },
  ]);

  // Alert types
  await ensureCollection("alert_types", "Alert Types");
  await ensureStringAttribute("alert_types", "key", 30, true, false, undefined, true);
  await ensureStringAttribute("alert_types", "name", 100, true);
  await ensureBooleanAttribute("alert_types", "enabled", true, false, true);
  await ensureIntegerAttribute("alert_types", "order", false);

  await seedDocuments("alert_types", [
    { key: "above", name: "Price Above", enabled: true, order: 1 },
    { key: "below", name: "Price Below", enabled: true, order: 2 },
    { key: "change_percent", name: "Change Percent", enabled: true, order: 3 },
  ]);

  console.log("Bootstrap complete.");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
