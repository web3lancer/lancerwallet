import { NextResponse } from "next/server";
import { recoverAddress } from "../../../../../lib/appwrite/web3";
// import nonce helper from dedicated util file
import { verifyAndConsumeNonceFromDB } from "@/lib/auth/nonce";
import { AppwriteSDK } from "@/lib/appwrite";
// no direct appwrite SDK imports needed in this route; using node-appwrite for server admin operations

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
    // Create a node-appwrite client with admin privileges (API key must be set in server env)
    const nodeAppwrite = await import("node-appwrite");
    const NodeClient = nodeAppwrite.Client;
    const Users = nodeAppwrite.Users;
    const nodeClient = new NodeClient()
      .setEndpoint(adminClient.config.endpoint)
      .setProject(adminClient.config.project)
      .setKey(process.env.APPWRITE_API_KEY || process.env.APPWRITE_KEY || adminClient.config.devkey);
    const users = new Users(nodeClient);

    // node-appwrite expects its own Client instance. Create a node-appwrite Client and copy endpoint/project
    // Use deterministic user id derived from wallet address to ensure 1:1 mapping
    const normalized = address.toLowerCase();
    const deterministicId = `wallet:${normalized}`;

    // Try to get user by ID first
    let user;
    try {
      user = await users.get(deterministicId);
    } catch (_e) {
      // If not found, create the user with deterministic id and set name to the address
      user = await users.create(deterministicId, undefined, undefined, undefined, normalized);
    }

    // Create a custom token for the user that the client will exchange for a session
    // node-appwrite Users.createToken takes expiry (seconds) and optional length as separate params
    const token = await users.createToken(user.$id, 60 * 10, 6);

    return NextResponse.json({ token: token.secret });
  } catch (error) {
    console.error("Error during Appwrite user creation/session:", error);
    return NextResponse.json(
      { error: "failed to create session" },
      { status: 500 }
    );
  }
}
