# Wallet-as-Identity Authentication Plan

## Core Principle: Wallet IS Authentication

The crypto wallet itself (generated from mnemonic seed phrase or imported) serves as the primary authentication mechanism. Each wallet maps 1:1 to an Appwrite user account, eliminating traditional email/password flows.

**Key insight**: The wallet's private key is the user's identity credential. Authentication proves ownership via cryptographic signature, and wallet security is protected by password and/or passkey encryption.

## Authentication Flow

1. **Wallet Creation/Import**
   - User generates new mnemonic (12/24 words) OR imports existing seed phrase
   - Wallet derives private/public keypair and Ethereum address from seed

2. **Local Protection Layer**
   - Wallet encrypted locally using user-chosen password
   - Optional: Additional passkey protection (configurable in settings later)
   - Seed phrase stored encrypted; never transmitted to server

3. **Authentication via Signature**
   - Server provides nonce challenge
   - Client signs nonce with wallet's private key
   - Server verifies signature matches wallet address

4. **Identity Mapping**
   - Server maps wallet address to deterministic Appwrite user ID: `wallet:${address.toLowerCase()}`
   - Creates Appwrite user if doesn't exist; retrieves if exists
   - No email/username required - wallet address IS the identity

5. **Session Creation**
   - Server issues Appwrite custom token
   - Client exchanges token for authenticated session
   - Session persisted via HTTP-only cookie for SSR

## Benefits

- **Single-step auth**: Wallet creation = identity creation = authentication
- **Self-sovereign**: Users control identity via seed phrase ownership
- **Multi-device sync**: Same wallet authenticates across devices with proper decryption
- **Future-ready**: Each wallet becomes separate account; enables multi-wallet containers later
- **No vendor lock-in**: Users can export seed phrase and use elsewhere

## Security Model

**Primary Security**: Seed phrase (24-word mnemonic)
- Master secret that generates all wallet keypairs
- User responsible for secure backup/storage

**Secondary Security**: Local encryption
- Password: Required to decrypt wallet locally
- Passkey: Optional additional factor (biometric/hardware key)
- Both configurable in app settings

**Server Security**: Signature verification
- Nonce prevents replay attacks
- Address recovery validates wallet ownership
- No private keys ever transmitted

## Implementation Steps

### 1. Server-side Custom Token Endpoint
File: `app/api/auth/custom-token/web3/route.ts` (already in progress)

```typescript
// Request: { address, signature, nonce, key }
// Response: { token: "6-char-secret" }
```

Process:
- Verify signature matches address via `recoverAddress(nonce, signature)`
- Validate and consume nonce to prevent replay
- Find/create Appwrite user with ID `wallet:${address.toLowerCase()}`
- Issue custom token via `users.createToken(userId, expiry, length)`
- Return token secret to client

### 2. Frontend Auth Action
File: `app/auth/actions.ts`

Add `walletLogin(address, signature, nonce, key)`:
- Call custom-token endpoint with wallet proof
- Exchange returned token secret with `account.createSession(tokenSecret)`
- Set HTTP-only session cookie for SSR
- Redirect to `/home`

### 3. Environment Variables
File: `env.sample`

Add required server variables:
```
APPWRITE_API_KEY=your_server_api_key_here
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
```

### 4. Wallet Protection Integration
Files: `lib/wallet.ts`, wallet creation flows

Ensure wallet encryption uses:
- Password: Required for local decryption
- Passkey: Optional second factor (implement in settings)
- Seed phrase: Securely stored encrypted, never sent to server

## API Shapes

### Custom Token Request
```typescript
POST /api/auth/custom-token/web3
{
  "address": "0x742d35Cc6634C0532925a3b8D0C28f5fC",
  "signature": "0x...",
  "nonce": "abc123",
  "key": "nonce-session-key"
}
```

### Custom Token Response
```typescript
{
  "token": "a1b2c3"  // 6-char secret for account.createSession()
}
```

### Client Session Exchange
```typescript
const session = await account.createSession(tokenSecret);
// Session automatically stored in SDK; set HTTP-only cookie for SSR
```

## Security Checklist

- [ ] Nonce replay protection enforced
- [ ] Signature validation prevents address spoofing  
- [ ] Rate limiting on token endpoint
- [ ] Server API key kept secure (not in client)
- [ ] Deterministic user creation prevents ID collisions
- [ ] Wallet encryption protects seed phrase locally
- [ ] Session cookies marked HTTP-only and Secure

## Migration Plan

1. Deploy new endpoint alongside existing auth
2. Update frontend to use wallet-auth flow
3. Test with existing users (if any)
4. Monitor for user creation conflicts
5. Gradually deprecate email/password flows

## Future Enhancements

- **Multi-wallet containers**: Allow users to manage multiple wallet identities
- **Passkey integration**: Add biometric/hardware key as secondary auth factor
- **Recovery options**: Optional email backup for account recovery
- **Hardware wallet support**: Direct integration with Ledger/Trezor for signing

## Verification Tests

1. **New wallet creation**: Generate mnemonic → encrypt with password → sign nonce → verify Appwrite user created
2. **Existing wallet import**: Import seed phrase → decrypt with password → authenticate → verify existing user retrieved  
3. **Session persistence**: Authenticate → close browser → reopen → verify still logged in
4. **Multi-device**: Same wallet on different devices → both authenticate to same Appwrite user
5. **Security**: Wrong password/signature → authentication fails

