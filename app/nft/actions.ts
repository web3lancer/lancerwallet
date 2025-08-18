"use server";

import { nfts } from "@/lib/appwrite/databases";
import { Query } from "appwrite";

export async function getNftsAction(walletId: string) {
  const response = await nfts.list([Query.equal("walletId", walletId)]);
  return response.documents;
}
