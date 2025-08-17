import { ID, Query, Models } from 'appwrite';
import { AppwriteSDK } from './index';
import * as AppwriteTypes from '../../types/appwrite.d.ts';

const {
  config: { databaseId, collections },
  adminDatabases,
} = AppwriteSDK;

// Generic Database Functions

async function getDocument<T extends Models.Document>(
  collectionId: string,
  documentId: string
): Promise<T> {
  return await adminDatabases.getDocument<T>(
    databaseId,
    collectionId,
    documentId
  );
}

async function listDocuments<T extends Models.Document>(
  collectionId: string,
  queries: string[] = []
): Promise<Models.DocumentList<T>> {
  return await adminDatabases.listDocuments<T>(
    databaseId,
    collectionId,
    queries
  );
}

async function createDocument<T extends Models.Document, U>(
  collectionId: string,
  documentId: string,
  data: U
): Promise<T> {
  return await adminDatabases.createDocument<T>(
    databaseId,
    collectionId,
    documentId,
    data
  );
}

async function updateDocument<T extends Models.Document, U>(
  collectionId:string,
  documentId: string,
  data: U
): Promise<T> {
  return await adminDatabases.updateDocument<T>(
    databaseId,
    collectionId,
    documentId,
    data
  );
}

async function deleteDocument(
  collectionId: string,
  documentId: string
): Promise<void> {
  await adminDatabases.deleteDocument(
    databaseId,
    collectionId,
    documentId
  );
}

// Users Collection

export const users = {
  get: (userId: string) =>
    getDocument<AppwriteTypes.Users>(collections.users, userId),

  list: (queries: string[] = []) =>
    listDocuments<AppwriteTypes.Users>(collections.users, queries),

  create: (userId: string, data: Omit<AppwriteTypes.Users, keyof Models.Document>) =>
    createDocument<AppwriteTypes.Users, Omit<AppwriteTypes.Users, keyof Models.Document>>(collections.users, userId, data),

  update: (userId: string, data: Partial<Omit<AppwriteTypes.Users, keyof Models.Document>>) =>
    updateDocument<AppwriteTypes.Users, Partial<Omit<AppwriteTypes.Users, keyof Models.Document>>>(collections.users, userId, data),

  delete: (userId: string) =>
    deleteDocument(collections.users, userId),
};

// Wallets Collection
export const wallets = {
    get: (walletId: string) =>
        getDocument<AppwriteTypes.Wallets>(collections.wallets, walletId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Wallets>(collections.wallets, queries),

    create: (walletId: string, data: Omit<AppwriteTypes.Wallets, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Wallets, Omit<AppwriteTypes.Wallets, keyof Models.Document>>(collections.wallets, walletId, data),

    update: (walletId: string, data: Partial<Omit<AppwriteTypes.Wallets, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Wallets, Partial<Omit<AppwriteTypes.Wallets, keyof Models.Document>>>(collections.wallets, walletId, data),

    delete: (walletId: string) =>
        deleteDocument(collections.wallets, walletId),
}

// Transactions Collection
export const transactions = {
    get: (transactionId: string) =>
        getDocument<AppwriteTypes.Transactions>(collections.transactions, transactionId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Transactions>(collections.transactions, queries),

    create: (transactionId: string, data: Omit<AppwriteTypes.Transactions, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Transactions, Omit<AppwriteTypes.Transactions, keyof Models.Document>>(collections.transactions, transactionId, data),

    update: (transactionId: string, data: Partial<Omit<AppwriteTypes.Transactions, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Transactions, Partial<Omit<AppwriteTypes.Transactions, keyof Models.Document>>>(collections.transactions, transactionId, data),

    delete: (transactionId: string) =>
        deleteDocument(collections.transactions, transactionId),
}

// Tokens Collection
export const tokens = {
    get: (tokenId: string) =>
        getDocument<AppwriteTypes.Tokens>(collections.tokens, tokenId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Tokens>(collections.tokens, queries),

    create: (tokenId: string, data: Omit<AppwriteTypes.Tokens, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Tokens, Omit<AppwriteTypes.Tokens, keyof Models.Document>>(collections.tokens, tokenId, data),

    update: (tokenId: string, data: Partial<Omit<AppwriteTypes.Tokens, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Tokens, Partial<Omit<AppwriteTypes.Tokens, keyof Models.Document>>>(collections.tokens, tokenId, data),

    delete: (tokenId: string) =>
        deleteDocument(collections.tokens, tokenId),
}

// NFTs Collection
export const nfts = {
    get: (nftId: string) =>
        getDocument<AppwriteTypes.NfTs>(collections.nfts, nftId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.NfTs>(collections.nfts, queries),

    create: (nftId: string, data: Omit<AppwriteTypes.NfTs, keyof Models.Document>) =>
        createDocument<AppwriteTypes.NfTs, Omit<AppwriteTypes.NfTs, keyof Models.Document>>(collections.nfts, nftId, data),

    update: (nftId: string, data: Partial<Omit<AppwriteTypes.NfTs, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.NfTs, Partial<Omit<AppwriteTypes.NfTs, keyof Models.Document>>>(collections.nfts, nftId, data),

    delete: (nftId: string) =>
        deleteDocument(collections.nfts, nftId),
}

// WebAuthn Credentials Collection
export const webauthnCredentials = {
    get: (credentialId: string) =>
        getDocument<AppwriteTypes.WebAuthnCredentials>(collections.webauthnCredentials, credentialId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.WebAuthnCredentials>(collections.webauthnCredentials, queries),

    create: (credentialId: string, data: Omit<AppwriteTypes.WebAuthnCredentials, keyof Models.Document>) =>
        createDocument<AppwriteTypes.WebAuthnCredentials, Omit<AppwriteTypes.WebAuthnCredentials, keyof Models.Document>>(collections.webauthnCredentials, credentialId, data),

    update: (credentialId: string, data: Partial<Omit<AppwriteTypes.WebAuthnCredentials, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.WebAuthnCredentials, Partial<Omit<AppwriteTypes.WebAuthnCredentials, keyof Models.Document>>>(collections.webauthnCredentials, credentialId, data),

    delete: (credentialId: string) =>
        deleteDocument(collections.webauthnCredentials, credentialId),
}

// DeFi Positions Collection
export const defiPositions = {
    get: (positionId: string) =>
        getDocument<AppwriteTypes.DeFiPositions>(collections.defiPositions, positionId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.DeFiPositions>(collections.defiPositions, queries),

    create: (positionId: string, data: Omit<AppwriteTypes.DeFiPositions, keyof Models.Document>) =>
        createDocument<AppwriteTypes.DeFiPositions, Omit<AppwriteTypes.DeFiPositions, keyof Models.Document>>(collections.defiPositions, positionId, data),

    update: (positionId: string, data: Partial<Omit<AppwriteTypes.DeFiPositions, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.DeFiPositions, Partial<Omit<AppwriteTypes.DeFiPositions, keyof Models.Document>>>(collections.defiPositions, positionId, data),

    delete: (positionId: string) =>
        deleteDocument(collections.defiPositions, positionId),
}

// App Settings Collection
export const appSettings = {
    get: (settingId: string) =>
        getDocument<AppwriteTypes.AppSettings>(collections.appSettings, settingId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.AppSettings>(collections.appSettings, queries),

    create: (settingId: string, data: Omit<AppwriteTypes.AppSettings, keyof Models.Document>) =>
        createDocument<AppwriteTypes.AppSettings, Omit<AppwriteTypes.AppSettings, keyof Models.Document>>(collections.appSettings, settingId, data),

    update: (settingId: string, data: Partial<Omit<AppwriteTypes.AppSettings, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.AppSettings, Partial<Omit<AppwriteTypes.AppSettings, keyof Models.Document>>>(collections.appSettings, settingId, data),

    delete: (settingId: string) =>
        deleteDocument(collections.appSettings, settingId),
}

// User Settings Collection
export const userSettings = {
    get: (settingId: string) =>
        getDocument<AppwriteTypes.UserSettings>(collections.userSettings, settingId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.UserSettings>(collections.userSettings, queries),

    create: (settingId: string, data: Omit<AppwriteTypes.UserSettings, keyof Models.Document>) =>
        createDocument<AppwriteTypes.UserSettings, Omit<AppwriteTypes.UserSettings, keyof Models.Document>>(collections.userSettings, settingId, data),

    update: (settingId: string, data: Partial<Omit<AppwriteTypes.UserSettings, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.UserSettings, Partial<Omit<AppwriteTypes.UserSettings, keyof Models.Document>>>(collections.userSettings, settingId, data),

    delete: (settingId: string) =>
        deleteDocument(collections.userSettings, settingId),
}

// Price Alerts Collection
export const priceAlerts = {
    get: (alertId: string) =>
        getDocument<AppwriteTypes.PriceAlerts>(collections.priceAlerts, alertId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.PriceAlerts>(collections.priceAlerts, queries),

    create: (alertId: string, data: Omit<AppwriteTypes.PriceAlerts, keyof Models.Document>) =>
        createDocument<AppwriteTypes.PriceAlerts, Omit<AppwriteTypes.PriceAlerts, keyof Models.Document>>(collections.priceAlerts, alertId, data),

    update: (alertId: string, data: Partial<Omit<AppwriteTypes.PriceAlerts, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.PriceAlerts, Partial<Omit<AppwriteTypes.PriceAlerts, keyof Models.Document>>>(collections.priceAlerts, alertId, data),

    delete: (alertId: string) =>
        deleteDocument(collections.priceAlerts, alertId),
}

// Hardware Wallets Collection
export const hardwareWallets = {
    get: (hardwareWalletId: string) =>
        getDocument<AppwriteTypes.HardwareWallets>(collections.hardwareWallets, hardwareWalletId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.HardwareWallets>(collections.hardwareWallets, queries),

    create: (hardwareWalletId: string, data: Omit<AppwriteTypes.HardwareWallets, keyof Models.Document>) =>
        createDocument<AppwriteTypes.HardwareWallets, Omit<AppwriteTypes.HardwareWallets, keyof Models.Document>>(collections.hardwareWallets, hardwareWalletId, data),

    update: (hardwareWalletId: string, data: Partial<Omit<AppwriteTypes.HardwareWallets, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.HardwareWallets, Partial<Omit<AppwriteTypes.HardwareWallets, keyof Models.Document>>>(collections.hardwareWallets, hardwareWalletId, data),

    delete: (hardwareWalletId: string) =>
        deleteDocument(collections.hardwareWallets, hardwareWalletId),
}

// Plugin Configurations Collection
export const pluginConfigurations = {
    get: (configId: string) =>
        getDocument<AppwriteTypes.PluginConfigurations>(collections.pluginConfigurations, configId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.PluginConfigurations>(collections.pluginConfigurations, queries),

    create: (configId: string, data: Omit<AppwriteTypes.PluginConfigurations, keyof Models.Document>) =>
        createDocument<AppwriteTypes.PluginConfigurations, Omit<AppwriteTypes.PluginConfigurations, keyof Models.Document>>(collections.pluginConfigurations, configId, data),

    update: (configId: string, data: Partial<Omit<AppwriteTypes.PluginConfigurations, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.PluginConfigurations, Partial<Omit<AppwriteTypes.PluginConfigurations, keyof Models.Document>>>(collections.pluginConfigurations, configId, data),

    delete: (configId: string) =>
        deleteDocument(collections.pluginConfigurations, configId),
}

// Backups Collection
export const backups = {
    get: (backupId: string) =>
        getDocument<AppwriteTypes.Backups>(collections.backups, backupId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Backups>(collections.backups, queries),

    create: (backupId: string, data: Omit<AppwriteTypes.Backups, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Backups, Omit<AppwriteTypes.Backups, keyof Models.Document>>(collections.backups, backupId, data),

    update: (backupId: string, data: Partial<Omit<AppwriteTypes.Backups, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Backups, Partial<Omit<AppwriteTypes.Backups, keyof Models.Document>>>(collections.backups, backupId, data),

    delete: (backupId: string) =>
        deleteDocument(collections.backups, backupId),
}

// Nonces Collection
export const nonces = {
    get: (nonceId: string) =>
        getDocument<AppwriteTypes.Nonces>(collections.nonces, nonceId),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Nonces>(collections.nonces, queries),

    create: (nonceId: string, data: Omit<AppwriteTypes.Nonces, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Nonces, Omit<AppwriteTypes.Nonces, keyof Models.Document>>(collections.nonces, nonceId, data),

    update: (nonceId: string, data: Partial<Omit<AppwriteTypes.Nonces, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Nonces, Partial<Omit<AppwriteTypes.Nonces, keyof Models.Document>>>(collections.nonces, nonceId, data),

    delete: (nonceId: string) =>
        deleteDocument(collections.nonces, nonceId),
}

// Networks Collection
export const networks = {
    get: (key: string) =>
        getDocument<AppwriteTypes.Networks>(collections.networks, key),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Networks>(collections.networks, queries),

    create: (key: string, data: Omit<AppwriteTypes.Networks, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Networks, Omit<AppwriteTypes.Networks, keyof Models.Document>>(collections.networks, key, data),

    update: (key: string, data: Partial<Omit<AppwriteTypes.Networks, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Networks, Partial<Omit<AppwriteTypes.Networks, keyof Models.Document>>>(collections.networks, key, data),

    delete: (key: string) =>
        deleteDocument(collections.networks, key),
}

// Languages Collection
export const languages = {
    get: (code: string) =>
        getDocument<AppwriteTypes.Languages>(collections.languages, code),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Languages>(collections.languages, queries),

    create: (code: string, data: Omit<AppwriteTypes.Languages, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Languages, Omit<AppwriteTypes.Languages, keyof Models.Document>>(collections.languages, code, data),

    update: (code: string, data: Partial<Omit<AppwriteTypes.Languages, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Languages, Partial<Omit<AppwriteTypes.Languages, keyof Models.Document>>>(collections.languages, code, data),

    delete: (code: string) =>
        deleteDocument(collections.languages, code),
}

// Currencies Collection
export const currencies = {
    get: (code: string) =>
        getDocument<AppwriteTypes.Currencies>(collections.currencies, code),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.Currencies>(collections.currencies, queries),

    create: (code: string, data: Omit<AppwriteTypes.Currencies, keyof Models.Document>) =>
        createDocument<AppwriteTypes.Currencies, Omit<AppwriteTypes.Currencies, keyof Models.Document>>(collections.currencies, code, data),

    update: (code: string, data: Partial<Omit<AppwriteTypes.Currencies, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.Currencies, Partial<Omit<AppwriteTypes.Currencies, keyof Models.Document>>>(collections.currencies, code, data),

    delete: (code: string) =>
        deleteDocument(collections.currencies, code),
}

// Token Standards Collection
export const tokenStandards = {
    get: (key: string) =>
        getDocument<AppwriteTypes.TokenStandards>(collections.tokenStandards, key),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.TokenStandards>(collections.tokenStandards, queries),

    create: (key: string, data: Omit<AppwriteTypes.TokenStandards, keyof Models.Document>) =>
        createDocument<AppwriteTypes.TokenStandards, Omit<AppwriteTypes.TokenStandards, keyof Models.Document>>(collections.tokenStandards, key, data),

    update: (key: string, data: Partial<Omit<AppwriteTypes.TokenStandards, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.TokenStandards, Partial<Omit<AppwriteTypes.TokenStandards, keyof Models.Document>>>(collections.tokenStandards, key, data),

    delete: (key: string) =>
        deleteDocument(collections.tokenStandards, key),
}

// Alert Types Collection
export const alertTypes = {
    get: (key: string) =>
        getDocument<AppwriteTypes.AlertTypes>(collections.alertTypes, key),

    list: (queries: string[] = []) =>
        listDocuments<AppwriteTypes.AlertTypes>(collections.alertTypes, queries),

    create: (key: string, data: Omit<AppwriteTypes.AlertTypes, keyof Models.Document>) =>
        createDocument<AppwriteTypes.AlertTypes, Omit<AppwriteTypes.AlertTypes, keyof Models.Document>>(collections.alertTypes, key, data),

    update: (key: string, data: Partial<Omit<AppwriteTypes.AlertTypes, keyof Models.Document>>) =>
        updateDocument<AppwriteTypes.AlertTypes, Partial<Omit<AppwriteTypes.AlertTypes, keyof Models.Document>>>(collections.alertTypes, key, data),

    delete: (key: string) =>
        deleteDocument(collections.alertTypes, key),
}
