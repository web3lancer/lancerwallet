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

async function ensureStringAttribute(collectionId, key, size, required = true, array = false, defaultValue = undefined, isUnique = false) {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (e) {
    console.log(`Adding string attribute: ${collectionId}.${key}`);
    await db.createStringAttribute(databaseId, collectionId, key, size, required, defaultValue, array, isUnique);
  }
}

async function ensureIntegerAttribute(collectionId, key, required = true, array = false, min = undefined, max = undefined, defaultValue = undefined) {
  try { await db.getAttribute(databaseId, collectionId, key); } catch (e) {
    console.log(`Adding integer attribute: ${collectionId}.${key}`);
    await db.createIntegerAttribute(databaseId, collectionId, key, required, min, max, defaultValue, array);
  }
}

async function ensureBooleanAttribute(collectionId, key, required = true, array = false, defaultValue = undefined) {
  try { await db.getAttribute(databaseId, collectionId, key); } catch (e) {
    console.log(`Adding boolean attribute: ${collectionId}.${key}`);
    await db.createBooleanAttribute(databaseId, collectionId, key, required, defaultValue, array);
  }
}

async function ensureEmailAttribute(collectionId, key, required = true, array = false, defaultValue = undefined) {
  try { await db.getAttribute(databaseId, collectionId, key); } catch (e) {
    console.log(`Adding email attribute: ${collectionId}.${key}`);
    await db.createEmailAttribute(databaseId, collectionId, key, required, defaultValue, array);
  }
}

async function ensureUrlAttribute(collectionId, key, required = true, array = false, defaultValue = undefined) {
  try { await db.getAttribute(databaseId, collectionId, key); } catch (e) {
    console.log(`Adding URL attribute: ${collectionId}.${key}`);
    await db.createUrlAttribute(databaseId, collectionId, key, required, defaultValue, array);
  }
}

async function ensureDatetimeAttribute(collectionId, key, required = true, array = false, defaultValue = undefined) {
  try { await db.getAttribute(databaseId, collectionId, key); } catch (e) {
    console.log(`Adding datetime attribute: ${collectionId}.${key}`);
    await db.createDatetimeAttribute(databaseId, collectionId, key, required, defaultValue, array);
  }
}

async function ensureFloatAttribute(collectionId, key, required = true, array = false, min = undefined, max = undefined, defaultValue = undefined) {
  try { await db.getAttribute(databaseId, collectionId, key); } catch (e) {
    console.log(`Adding float attribute: ${collectionId}.${key}`);
    await db.createFloatAttribute(databaseId, collectionId, key, required, min, max, defaultValue, array);
  }
}

async function ensureEnumAttribute(collectionId, key, elements, required = true, array = false, defaultValue = undefined) {
  try { await db.getAttribute(databaseId, collectionId, key); } catch (e) {
    console.log(`Adding enum attribute: ${collectionId}.${key}`);
    await db.createEnumAttribute(databaseId, collectionId, key, elements, required, defaultValue, array);
  }
}

async function ensureIndex(collectionId, key, type, attributes, orders = undefined) {
  try {
    await db.getIndex(databaseId, collectionId, key);
  } catch (e) {
    console.log(`Creating index: ${collectionId}.${key}`);
    await db.createIndex(databaseId, collectionId, key, type, attributes, orders);
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
  await ensureStringAttribute("users", "userId", 100, true, false, undefined, true);
  await ensureEmailAttribute("users", "email", true, false, undefined);
  await ensureStringAttribute("users", "displayName", 100, false);
  await ensureUrlAttribute("users", "profileImage", false);
  await ensureDatetimeAttribute("users", "lastLogin", false);
  await ensureEnumAttribute("users", "accountStatus", ["active", "suspended", "deleted"], true, false, "active");
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
  await ensureStringAttribute("wallets", "walletId", 100, true, false, undefined, true);
  await ensureStringAttribute("wallets", "userId", 100, true);
  await ensureStringAttribute("wallets", "address", 100, true);
  await ensureStringAttribute("wallets", "name", 100, true);
  await ensureStringAttribute("wallets", "network", 50, true);
  await ensureStringAttribute("wallets", "encryptedWalletData", 5000, true);
  await ensureStringAttribute("wallets", "walletType", 50, true, false, "imported");
  await ensureBooleanAttribute("wallets", "isActive", true, false, true);
  await ensureDatetimeAttribute("wallets", "createdAt", true);
  await ensureDatetimeAttribute("wallets", "updatedAt", true);

  await ensureIndex("wallets", "userId_idx", "key", ["userId"]);
  await ensureIndex("wallets", "address_idx", "unique", ["address"]);
  await ensureIndex("wallets", "network_idx", "key", ["network"]);
  await ensureIndex("wallets", "isActive_idx", "key", ["isActive"]);

  // 3. Transactions Collection
  await ensureCollection("transactions", "Transactions", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("transactions", "transactionId", 100, true, false, undefined, true);
  await ensureStringAttribute("transactions", "userId", 100, true);
  await ensureStringAttribute("transactions", "walletId", 100, true);
  await ensureStringAttribute("transactions", "hash", 100, true, false, undefined, true);
  await ensureStringAttribute("transactions", "fromAddress", 100, true);
  await ensureStringAttribute("transactions", "toAddress", 100, true);
  await ensureStringAttribute("transactions", "value", 100, true);
  await ensureStringAttribute("transactions", "network", 50, true);
  await ensureStringAttribute("transactions", "status", 20, true);
  await ensureStringAttribute("transactions", "type", 20, true);
  await ensureDatetimeAttribute("transactions", "timestamp", true);
  await ensureStringAttribute("transactions", "notes", 500, false);
  await ensureDatetimeAttribute("transactions", "createdAt", true);
  await ensureDatetimeAttribute("transactions", "updatedAt", true);

  await ensureIndex("transactions", "userId_idx", "key", ["userId"]);
  await ensureIndex("transactions", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("transactions", "hash_idx", "unique", ["hash"]);
  await ensureIndex("transactions", "fromAddress_idx", "key", ["fromAddress"]);
  await ensureIndex("transactions", "toAddress_idx", "key", ["toAddress"]);
  await ensureIndex("transactions", "status_idx", "key", ["status"]);
  await ensureIndex("transactions", "type_idx", "key", ["type"]);
  await ensureIndex("transactions", "network_idx", "key", ["network"]);
  await ensureIndex("transactions", "timestamp_idx", "key", ["timestamp"]);

  // 4. Tokens Collection
  await ensureCollection("tokens", "Tokens", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("tokens", "tokenId", 100, true, false, undefined, true);
  await ensureStringAttribute("tokens", "userId", 100, true);
  await ensureStringAttribute("tokens", "walletId", 100, true);
  await ensureStringAttribute("tokens", "contractAddress", 100, true);
  await ensureStringAttribute("tokens", "symbol", 20, true);
  await ensureStringAttribute("tokens", "name", 100, true);
  await ensureIntegerAttribute("tokens", "decimals", true);
  await ensureStringAttribute("tokens", "balance", 100, true);
  await ensureStringAttribute("tokens", "network", 50, true);
  await ensureBooleanAttribute("tokens", "isNative", true, false, false);
  await ensureBooleanAttribute("tokens", "isActive", true, false, true);
  await ensureDatetimeAttribute("tokens", "createdAt", true);
  await ensureDatetimeAttribute("tokens", "updatedAt", true);

  await ensureIndex("tokens", "userId_idx", "key", ["userId"]);
  await ensureIndex("tokens", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("tokens", "contractAddress_idx", "key", ["contractAddress"]);
  await ensureIndex("tokens", "symbol_idx", "key", ["symbol"]);
  await ensureIndex("tokens", "network_idx", "key", ["network"]);
  await ensureIndex("tokens", "isActive_idx", "key", ["isActive"]);

  // 5. NFTs Collection
  await ensureCollection("nfts", "NFTs", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("nfts", "nftId", 100, true, false, undefined, true);
  await ensureStringAttribute("nfts", "userId", 100, true);
  await ensureStringAttribute("nfts", "walletId", 100, true);
  await ensureStringAttribute("nfts", "contractAddress", 100, true);
  await ensureStringAttribute("nfts", "tokenId", 100, true);
  await ensureStringAttribute("nfts", "name", 200, true);
  await ensureStringAttribute("nfts", "description", 2000, false);
  await ensureStringAttribute("nfts", "imageStorageId", 100, false);
  await ensureStringAttribute("nfts", "collection", 100, true);
  await ensureStringAttribute("nfts", "standard", 20, true, false, "ERC721");
  await ensureStringAttribute("nfts", "network", 50, true);
  await ensureStringAttribute("nfts", "metadata", 5000, false);
  await ensureBooleanAttribute("nfts", "isActive", true, false, true);
  await ensureDatetimeAttribute("nfts", "createdAt", true);
  await ensureDatetimeAttribute("nfts", "updatedAt", true);

  await ensureIndex("nfts", "userId_idx", "key", ["userId"]);
  await ensureIndex("nfts", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("nfts", "contractAddress_idx", "key", ["contractAddress"]);
  await ensureIndex("nfts", "tokenId_idx", "key", ["tokenId"]);
  await ensureIndex("nfts", "collection_idx", "key", ["collection"]);
  await ensureIndex("nfts", "network_idx", "key", ["network"]);
  await ensureIndex("nfts", "isActive_idx", "key", ["isActive"]);

  // 6. WebAuthn Credentials Collection
  await ensureCollection("webauthn_credentials", "WebAuthn Credentials", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("webauthn_credentials", "credentialId", 200, true, false, undefined, true);
  await ensureStringAttribute("webauthn_credentials", "userId", 100, true);
  await ensureStringAttribute("webauthn_credentials", "publicKey", 1000, true);
  await ensureIntegerAttribute("webauthn_credentials", "counter", true, false, undefined, undefined, 0);
  await ensureStringAttribute("webauthn_credentials", "deviceName", 100, false);
  await ensureEnumAttribute("webauthn_credentials", "deviceType", ["platform", "cross-platform"], false);
  await ensureBooleanAttribute("webauthn_credentials", "isActive", true, false, true);
  await ensureDatetimeAttribute("webauthn_credentials", "lastUsed", false);
  await ensureDatetimeAttribute("webauthn_credentials", "createdAt", true);
  await ensureDatetimeAttribute("webauthn_credentials", "updatedAt", true);

  await ensureIndex("webauthn_credentials", "userId_idx", "key", ["userId"]);
  await ensureIndex("webauthn_credentials", "credentialId_idx", "unique", ["credentialId"]);
  await ensureIndex("webauthn_credentials", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("webauthn_credentials", "lastUsed_idx", "key", ["lastUsed"]);

  // 7. DeFi Positions Collection
  await ensureCollection("defi_positions", "DeFi Positions", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("defi_positions", "positionId", 100, true, false, undefined, true);
  await ensureStringAttribute("defi_positions", "userId", 100, true);
  await ensureStringAttribute("defi_positions", "walletId", 100, true);
  await ensureStringAttribute("defi_positions", "protocol", 50, true);
  await ensureStringAttribute("defi_positions", "positionType", 30, true);
  await ensureStringAttribute("defi_positions", "contractAddress", 100, true);
  await ensureStringAttribute("defi_positions", "tokenA", 20, false);
  await ensureStringAttribute("defi_positions", "tokenB", 20, false);
  await ensureStringAttribute("defi_positions", "amount", 100, true);
  await ensureStringAttribute("defi_positions", "network", 50, true);
  await ensureBooleanAttribute("defi_positions", "isActive", true, false, true);
  await ensureDatetimeAttribute("defi_positions", "createdAt", true);
  await ensureDatetimeAttribute("defi_positions", "updatedAt", true);

  await ensureIndex("defi_positions", "userId_idx", "key", ["userId"]);
  await ensureIndex("defi_positions", "walletId_idx", "key", ["walletId"]);
  await ensureIndex("defi_positions", "protocol_idx", "key", ["protocol"]);
  await ensureIndex("defi_positions", "positionType_idx", "key", ["positionType"]);
  await ensureIndex("defi_positions", "network_idx", "key", ["network"]);
  await ensureIndex("defi_positions", "isActive_idx", "key", ["isActive"]);

  // 8. App Settings Collection
  await ensureCollection("app_settings", "App Settings", [
    Permission.read(Role.any()),
    Permission.create(Role.team("admin")),
    Permission.update(Role.team("admin")),
    Permission.delete(Role.team("admin"))
  ]);
  await ensureStringAttribute("app_settings", "settingId", 100, true, false, undefined, true);
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

  // 9. User Settings Collection
  await ensureCollection("user_settings", "User Settings", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("user_settings", "settingId", 100, true, false, undefined, true);
  await ensureStringAttribute("user_settings", "userId", 100, true, false, undefined, true);
  await ensureStringAttribute("user_settings", "theme", 20, true, false, "auto");
  await ensureStringAttribute("user_settings", "currency", 10, true, false, "USD");
  await ensureStringAttribute("user_settings", "language", 10, true, false, "en");
  await ensureStringAttribute("user_settings", "defaultNetwork", 50, true, false, "ethereum");
  await ensureStringAttribute("user_settings", "notifications", 5000, true);
  await ensureStringAttribute("user_settings", "security", 5000, true);
  await ensureStringAttribute("user_settings", "advanced", 5000, false);
  await ensureDatetimeAttribute("user_settings", "createdAt", true);
  await ensureDatetimeAttribute("user_settings", "updatedAt", true);

  await ensureIndex("user_settings", "userId_idx", "unique", ["userId"]);

  // 10. Price Alerts Collection
  await ensureCollection("price_alerts", "Price Alerts", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("price_alerts", "alertId", 100, true, false, undefined, true);
  await ensureStringAttribute("price_alerts", "userId", 100, true);
  await ensureStringAttribute("price_alerts", "symbol", 20, true);
  await ensureStringAttribute("price_alerts", "contractAddress", 100, false);
  await ensureStringAttribute("price_alerts", "network", 50, true);
  await ensureStringAttribute("price_alerts", "alertType", 30, true);
  await ensureFloatAttribute("price_alerts", "targetPrice", false);
  await ensureFloatAttribute("price_alerts", "changePercent", false);
  await ensureFloatAttribute("price_alerts", "currentPrice", false);
  await ensureBooleanAttribute("price_alerts", "isActive", true, false, true);
  await ensureBooleanAttribute("price_alerts", "triggered", true, false, false);
  await ensureDatetimeAttribute("price_alerts", "triggeredAt", false);
  await ensureDatetimeAttribute("price_alerts", "createdAt", true);
  await ensureDatetimeAttribute("price_alerts", "updatedAt", true);

  await ensureIndex("price_alerts", "userId_idx", "key", ["userId"]);
  await ensureIndex("price_alerts", "symbol_idx", "key", ["symbol"]);
  await ensureIndex("price_alerts", "isActive_idx", "key", ["isActive"]);
  await ensureIndex("price_alerts", "triggered_idx", "key", ["triggered"]);

  // 11. Hardware Wallets Collection
  await ensureCollection("hardware_wallets", "Hardware Wallets", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("hardware_wallets", "hardwareWalletId", 100, true, false, undefined, true);
  await ensureStringAttribute("hardware_wallets", "userId", 100, true);
  await ensureStringAttribute("hardware_wallets", "deviceType", 50, true);
  await ensureStringAttribute("hardware_wallets", "deviceModel", 50, false);
  await ensureStringAttribute("hardware_wallets", "deviceId", 100, true);
  await ensureStringAttribute("hardware_wallets", "publicKey", 1000, true);
  await ensureStringAttribute("hardware_wallets", "derivationPath", 100, true);
  await ensureStringAttribute("hardware_wallets", "addresses", 5000, true);
  await ensureStringAttribute("hardware_wallets", "name", 100, true);
  await ensureBooleanAttribute("hardware_wallets", "isActive", true, false, true);
  await ensureDatetimeAttribute("hardware_wallets", "lastConnected", false);
  await ensureDatetimeAttribute("hardware_wallets", "createdAt", true);
  await ensureDatetimeAttribute("hardware_wallets", "updatedAt", true);

  await ensureIndex("hardware_wallets", "userId_idx", "key", ["userId"]);
  await ensureIndex("hardware_wallets", "deviceId_idx", "key", ["deviceId"]);
  await ensureIndex("hardware_wallets", "deviceType_idx", "key", ["deviceType"]);
  await ensureIndex("hardware_wallets", "isActive_idx", "key", ["isActive"]);

  // 12. Plugin Configurations Collection
  await ensureCollection("plugin_configurations", "Plugin Configurations", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.update(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("plugin_configurations", "configId", 100, true, false, undefined, true);
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

  // 13. Backups Collection
  await ensureCollection("backups", "Backups", [
    Permission.read(Role.user("USER_ID")),
    Permission.create(Role.user("USER_ID")),
    Permission.delete(Role.user("USER_ID"))
  ]);
  await ensureStringAttribute("backups", "backupId", 100, true, false, undefined, true);
  await ensureStringAttribute("backups", "userId", 100, true);
  await ensureStringAttribute("backups", "fileId", 100, true);
  await ensureStringAttribute("backups", "backupType", 30, true);
  await ensureDatetimeAttribute("backups", "timestamp", true);
  await ensureIntegerAttribute("backups", "size", true);
  await ensureStringAttribute("backups", "notes", 500, false);

  await ensureIndex("backups", "userId_idx", "key", ["userId"]);
  await ensureIndex("backups", "fileId_idx", "key", ["fileId"]);
  await ensureIndex("backups", "backupType_idx", "key", ["backupType"]);
  await ensureIndex("backups", "timestamp_idx", "key", ["timestamp"]);

  // 14. Nonces Collection
  await ensureCollection("nonces", "Nonces", [
    Permission.read(Role.any()),
    Permission.create(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.team("admin"))
  ]);
  await ensureStringAttribute("nonces", "nonceId", 100, true, false, undefined, true);
  await ensureStringAttribute("nonces", "key", 100, true, false, undefined, true);
  await ensureStringAttribute("nonces", "nonce", 100, true);
  await ensureDatetimeAttribute("nonces", "expiresAt", true);
  await ensureBooleanAttribute("nonces", "used", true, false, false);
  await ensureDatetimeAttribute("nonces", "createdAt", true);

  await ensureIndex("nonces", "key_idx", "unique", ["key"]);
  await ensureIndex("nonces", "expiresAt_idx", "key", ["expiresAt"]);
  await ensureIndex("nonces", "used_idx", "key", ["used"]);
  await ensureIndex("nonces", "createdAt_idx", "key", ["createdAt"]);

  console.log("Main collections created successfully!");
}

async function createStorageBuckets() {
  console.log("Creating storage buckets...");

  // 1. User Avatars Bucket
  await ensureStorageBucket(
    "user-avatars",
    "User Avatars",
    [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.user("USER_ID")),
      Permission.delete(Role.user("USER_ID"))
    ],
    true, // fileSecurity
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

  // 6. Plugin Assets Bucket
  await ensureStorageBucket(
    "plugin-assets",
    "Plugin Assets",
    [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin"))
    ],
    false,
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
