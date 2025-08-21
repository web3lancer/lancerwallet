Goal

Consolidate authentication into a single-step Appwrite custom-token flow where each wallet (Ethereum address) maps 1:1 to an Appwrite user account. This will allow creating a wallet and immediately signing in without separate backup steps and enable future multi-account containers.

High-level approach

- Server: Provide a unified endpoint that verifies a wallet proof (web3 signature), ensures an Appwrite user exists for that wallet address (use wallet address as deterministic identifier or name), creates a custom token via Appwrite Users.createToken, and returns the token secret to the client.
- Client: Exchange the token secret with Appwrite Client SDK (Account.createSession) to create an authenticated session. Persist session via HTTP-only cookie set by server-side action (recommended) or client SDK.

Why this design

- Appwrite custom-token flow is designed for exactly this: server-side validation then token issuance that clients exchange for sessions in one step.
- Mapping each wallet to its own Appwrite account enables straightforward syncing and storage per-wallet and simplifies future multi-account support.

Implementation steps

1. Inspect existing endpoints and helpers (done).
2. Implement unified server endpoint at app/api/auth/custom-token/route.ts that accepts { method, address, signature, nonce, key } (for web3 method initially).
   - Validate signature and nonce (reuse recoverAddress and verifyAndConsumeNonceFromDB).
   - Use node-appwrite Users API to find or create a user with a deterministic ID: use the wallet address as user "name" and as the userId namespace (use ID.custom with prefix or ID.unique?). Prefer using Users.create with ID = `wallet:${address.toLowerCase()}` to keep deterministic mapping.
   - Create a token using Users.createToken(userId, { expires, length }) and return the token.secret to the client.
3. Update frontend auth action (app/auth/actions.ts and AuthForm) to call the new endpoint and then call Appwrite client SDK (Account.createSession) with the returned token secret to create a session. After session created, set a HTTP-only cookie 'appwrite-session' with the session.secret via server action (cookies API) to make SSR session management seamless.
4. Update env.sample to include APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY (server key), and note that they must be set in deployment.
5. Add error handling and rate-limiting notes; keep old endpoints as fallback during migration.

Files to change

- app/api/auth/custom-token/web3/route.ts -> move logic into app/api/auth/custom-token/route.ts unified endpoint and adjust user creation to deterministic ID.
- app/auth/actions.ts -> add new function to perform web3 login flow: call internal API to get token secret, exchange with Appwrite client SDK, store cookie and redirect.
- lib/appwrite/server.ts -> add server-side helper to instantiate admin client using server API key (process.env.APPWRITE_API_KEY) for Users.createToken.
- env.sample -> add APPWRITE_API_KEY and clarify required envs.

Security considerations

- Use server API key to talk to Appwrite admin APIs. Keep secret out of client.
- Nonce replay protection must be enforced (existing DB-based nonce usage retained).
- Rate-limit token endpoint and monitor for abuse.
- Validate signature strictly and normalize addresses to lowercase.

Migration/rollout plan

- Deploy unified endpoint alongside existing endpoints.
- Update frontend to call new flow; keep old code path behind feature flag if needed.
- Monitor logs for user creation collisions or errors.

Verification

- Manual test: sign in with a wallet, ensure new Appwrite user is created with deterministic id/name, client obtains session and cookie, account.get() returns expected user.
- Edge cases: repeated sign-ins, revoked tokens, user creation race conditions.

Follow-ups

- Add automated tests for the server endpoint.
- Implement passkey/nonce methods in same unified endpoint.
- Consider migrating storage structure to map external identities to Appwrite userIds explicitly.



## Auth: wallet-presence authentication

Goal

- Authenticate users by the mere presence or creation of a wallet (Ethereum address) without requiring traditional email/password flows. The server will accept a proof of wallet control (signature) or detect wallet creation and issue a session token mapped 1:1 with an Appwrite user account.

Approach

- Presence-based auth: when a client connects with a wallet address, validate control by asking for a lightweight proof (e.g., signed timestamp or nonce). If a wallet is present but has no existing Appwrite account, create one deterministically and issue a session token so the user is immediately authenticated.

- Passive detection (optional): for embedded wallet flows where creation occurs in-client, the client can notify the server once wallet is generated and provide the initial proof to obtain a session without additional onboarding.

Design details

- Deterministic user mapping: use a deterministic Appwrite userId namespace such as `wallet:{addressLower}` so a wallet always resolves to the same Appwrite user. Store minimal metadata (createdAt, provider=wallet, lastSeen).

- Proof types supported:
  - Web3 signature of a server-provided nonce (required for first-time auth)
  - Signed timestamp for quick re-authentication (short-lived)
  - Optional: wallet connect or on-device passkey linkage for richer UX

- Nonce handling: server issues a single-use nonce tied to the address; nonce consumption must be atomic to avoid replay and race conditions.

- Session issuance: after verifying proof, server ensures Appwrite user exists and creates a custom token secret returned to client to exchange for Appwrite session.

- Minimal UX friction: reduce fields and steps on the client. No email/password or email verification required to sign in with a wallet. Recommend offering an optional backup (recovery phrase export or link to add email) but do not require it.

Security considerations

- Account takeover risks: deterministic creation means anyone who can sign from the address can impersonate the account — that's expected for wallet-auth models. Encourage optional account recovery methods and multi-factor mappings for high-value users.

- Rate-limiting and abuse detection on token issuance and nonce generation.

- Require signatures for first-time auth; passive notifications alone must be validated with proof before issuing tokens.

- Monitor for duplicate wallet creation and potential race conditions; use DB transactions or unique constraints on user mapping.

UX notes

- Onboarding flow should highlight that possession of the wallet controls the account; provide clear warnings about private key safety.

- Offer a lightweight 'add recovery' modal post-sign-in to optionally attach an email or passkey for recovery.

Open questions

- Do we want to allow multiple wallets to map to the same Appwrite user (user-managed containers) or strictly 1:1? Current plan is 1:1 but consider later multi-wallet containers.

- How aggressive should passive detection be? For privacy, avoid automatic telemetry; require explicit client consent to register wallet presence.

- Decide if wallet creation should auto-grant certain default profiles/permissions or require minimal setup.


