"use server";

import { transactions } from "@/lib/appwrite/databases";
import { ID } from "appwrite";
import { Transactions } from "@/types/appwrite.d.ts";
import { Models } from "appwrite";

export async function createTransactionAction(
  data: Omit<Transactions, keyof Models.Document | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  return await transactions.create(data.transactionId, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
}
