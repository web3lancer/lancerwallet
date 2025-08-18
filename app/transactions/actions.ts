"use server";

import { transactions } from "@/lib/appwrite/databases";
import { getSessionAccount } from "@/lib/appwrite/server";
import { Query } from "appwrite";

export async function getTransactionsAction() {
  const account = await getSessionAccount();
  const user = await account.get();
  const userId = user.$id;

  const response = await transactions.list([Query.equal("userId", userId)]);
  return response.documents;
}
