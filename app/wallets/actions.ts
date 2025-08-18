"use server";

import { wallets } from "@/lib/appwrite/databases";
import { getSessionAccount } from "@/lib/appwrite/server";
import { Query } from "appwrite";
import { AppwriteSDK } from "@/lib/appwrite";

export async function getWalletsAction() {
  const account = await getSessionAccount();
  const user = await account.get();
  const userId = user.$id;

  const response = await wallets.list([Query.equal("userId", userId)]);
  return response.documents;
}

export async function createWalletAction(
  walletId: string,
  data: {
    userId: string;
    address: string;
    name: string;
    network: string;
    encryptedWalletData: string;
    walletType: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
) {
  return await wallets.create(walletId, data);
}

export async function getTokensAction(walletId: string) {
  const response = await AppwriteSDK.adminDatabases.listDocuments(
    AppwriteSDK.config.databaseId,
    AppwriteSDK.config.collections.tokens,
    [Query.equal("walletId", walletId)]
  );
  return response.documents;
}
