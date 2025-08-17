// Bootstrap complete Appwrite database, collections, storage, and config data
// Requires env: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID

import {
  Client,
  Databases,
  Storage,
  Permission,
  Role,
} from 'appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || "lancerwallet_db";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing required env: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
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

async function ensureCollection(collectionId, name, permissions = undefined) {
  try {
    await db.getCollection(databaseId, collectionId);
    console.log(`Collection exists: ${collectionId}`);
  } catch (e) {
    console.log(`Creating collection: ${collectionId}`);
    await db.createCollection(databaseId, collectionId, name, permissions);
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
  // Networks
  await ensureCollection("networks", "Networks");
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
