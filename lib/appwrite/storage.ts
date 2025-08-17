import { ID } from 'appwrite';
import { AppwriteSDK } from './index';

const {
  config: { buckets },
  storage,
} = AppwriteSDK;

// Generic Storage Functions

async function createFile(
  bucketId: string,
  file: File,
  fileId: string = ID.unique()
) {
  return await storage.createFile(bucketId, fileId, file);
}

function getFileView(bucketId: string, fileId: string) {
  return storage.getFileView(bucketId, fileId);
}

async function deleteFile(bucketId: string, fileId: string) {
  return await storage.deleteFile(bucketId, fileId);
}

// User Avatars Bucket
export const userAvatars = {
  create: (file: File, fileId?: string) =>
    createFile(buckets.userAvatars, file, fileId),
  getView: (fileId: string) => getFileView(buckets.userAvatars, fileId),
  delete: (fileId: string) => deleteFile(buckets.userAvatars, fileId),
};

// NFT Images Bucket
export const nftImages = {
  create: (file: File, fileId?: string) =>
    createFile(buckets.nftImages, file, fileId),
  getView: (fileId: string) => getFileView(buckets.nftImages, fileId),
  delete: (fileId: string) => deleteFile(buckets.nftImages, fileId),
};

// Transaction Receipts Bucket
export const transactionReceipts = {
  create: (file: File, fileId?: string) =>
    createFile(buckets.transactionReceipts, file, fileId),
  getView: (fileId: string) =>
    getFileView(buckets.transactionReceipts, fileId),
  delete: (fileId: string) =>
    deleteFile(buckets.transactionReceipts, fileId),
};

// Backup Data Bucket
export const backupData = {
  create: (file: File, fileId?: string) =>
    createFile(buckets.backupData, file, fileId),
  getView: (fileId: string) => getFileView(buckets.backupData, fileId),
  delete: (fileId: string) => deleteFile(buckets.backupData, fileId),
};

// App Assets Bucket
export const appAssets = {
  create: (file: File, fileId?: string) =>
    createFile(buckets.appAssets, file, fileId),
  getView: (fileId: string) => getFileView(buckets.appAssets, fileId),
  delete: (fileId: string) => deleteFile(buckets.appAssets, fileId),
};

// Plugin Assets Bucket
export const pluginAssets = {
  create: (file: File, fileId?: string) =>
    createFile(buckets.pluginAssets, file, fileId),
  getView: (fileId: string) => getFileView(buckets.pluginAssets, fileId),
  delete: (fileId: string) => deleteFile(buckets.pluginAssets, fileId),
};
