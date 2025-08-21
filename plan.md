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


