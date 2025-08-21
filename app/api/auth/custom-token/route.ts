import { NextResponse } from "next/server";
import { recoverAddress } from "../../../../lib/appwrite/web3";
import { verifyAndConsumeNonceFromDB } from "@/lib/auth/nonce";
import { AppwriteSDK } from "@/lib/appwrite";

export async function POST(req: Request) {
  const body = await req.json();
  const { method, address, signature, key, nonce } = body;
  
  if (!method || !address) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  let userId: string;
  let userData: any = {};

  if (method === 'wallet') {
    // Wallet authentication flow
    if (!signature || !nonce || !key) {
      return NextResponse.json({ error: "missing wallet auth fields" }, { status: 400 });
    }

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
    if (!ok) {
      return NextResponse.json(
        { error: "invalid or expired nonce" },
        { status: 400 }
      );
    }

    userId = `wallet:${address.toLowerCase()}`;
    userData = {
      name: address.toLowerCase(),
      provider: 'wallet',
      address: address.toLowerCase(),
    };

  } else if (method === 'passkey') {
    // Passkey authentication flow - to be implemented
    return NextResponse.json({ error: "passkey auth not yet implemented" }, { status: 400 });
    
  } else {
    return NextResponse.json({ error: "unsupported auth method" }, { status: 400 });
  }

  try {
    const { adminClient } = AppwriteSDK;
    const nodeAppwrite = await import("node-appwrite");
    const NodeClient = nodeAppwrite.Client;
    const Users = nodeAppwrite.Users;
    
    const nodeClient = new NodeClient()
      .setEndpoint(adminClient.config.endpoint)
      .setProject(adminClient.config.project)
      .setKey(process.env.APPWRITE_API_KEY || process.env.APPWRITE_KEY || adminClient.config.devkey);
    
    const users = new Users(nodeClient);

    // Try to get user by deterministic ID first
    let user;
    try {
      user = await users.get(userId);
    } catch (e) {
      // If not found, create the user with deterministic id
      user = await users.create(
        userId,
        undefined, // email
        undefined, // phone  
        undefined, // password
        userData.name
      );
      
      // Set user preferences to store metadata
      try {
        await users.updatePrefs(userId, userData);
      } catch (prefError) {
        console.warn("Failed to set user preferences:", prefError);
      }
    }

    // Create a custom token for the user
    const token = await users.createToken(user.$id, 60 * 60, 6); // 1 hour expiry

    return NextResponse.json({ token: token.secret });
  } catch (error) {
    console.error("Error during Appwrite user creation/session:", error);
    return NextResponse.json(
      { error: "failed to create session" },
      { status: 500 }
    );
  }
}