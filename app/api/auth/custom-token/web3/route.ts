import { NextResponse } from "next/server";
import { recoverAddress } from "../../../../../lib/appwrite/web3";
import nonceUtils from "../../nonce/route";
const { verifyAndConsumeNonceFromDB } = nonceUtils;
import { AppwriteSDK } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

export async function POST(req: Request) {
  const body = await req.json();
  const { address, signature, key, nonce } = body;
  if (!address || !signature || !nonce || !key)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const message = `Sign this nonce: ${nonce}`;
  let recovered: string;
  try {
    recovered = recoverAddress(message, signature);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json(
      { error: "signature does not match address" },
      { status: 400 }
    );
  }

  const ok = await verifyAndConsumeNonceFromDB(key, nonce);
  if (!ok)
    return NextResponse.json(
      { error: "invalid or expired nonce" },
      { status: 400 }
    );

  try {
    const { adminClient } = AppwriteSDK;
    // import node-appwrite classes using ESM import style
    const { Users, Account } = await import("node-appwrite");
    const users = new Users(adminClient);

    // Check if user exists
    let user;
    const existingUsers = await users.list([Query.equal("name", address)]);

    if (existingUsers.total > 0) {
      user = existingUsers.users[0];
    } else {
      // Create user if not exists
      user = await users.create(ID.unique(), undefined, undefined, undefined, address);
    }

    // Create a session for the user and return a session token
    const account = new Account(adminClient);
    const session = await account.createMagicURLToken(user.$id, address);

    return NextResponse.json({ token: session.secret });
  } catch (error) {
    console.error("Error during Appwrite user creation/session:", error);
    return NextResponse.json(
      { error: "failed to create session" },
      { status: 500 }
    );
  }
}
