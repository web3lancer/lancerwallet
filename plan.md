# LancerWallet: Custom Auth with Wallet-Centric Identity

## Core Architecture: Wallet IS Identity + Passkey Backup

**Primary Identity**: Crypto wallet (derived from seed phrase)
**Backup Access**: Passkey (generates & securely encapsulates wallet)
**Authentication**: 100% Appwrite Custom Auth (zero built-in email/password)

## Identity Model

### Wallet as Primary Identity
```
Seed Phrase → Private Key → Wallet Address → User ID: `wallet:${address}`
```

- Wallet address is the deterministic user identity
- All user data tied to wallet address
- Seed phrase ownership = account ownership
- Cryptographic signature proves identity

### Passkey as Secure Wallet Proxy
```
Passkey Registration → Generate Wallet → Encrypt with Passkey → Store Encrypted Wallet
Passkey Auth → Decrypt Wallet → Sign with Wallet → Same User ID: `wallet:${address}`
```

- Passkey generates a wallet behind the scenes
- Wallet is encrypted and stored securely
- Passkey authentication decrypts the wallet
- Same wallet address = same user identity
- Drop-in replacement when user forgets phrase

## Two Authentication Methods, One Identity System

### Method 1: Direct Wallet Authentication
**User Flow:**
```
/auth → "Continue with Seed Phrase" → Enter 12/24 words → Derive wallet → Sign nonce → Authenticated
```

**Technical Flow:**
1. User enters seed phrase
2. Derive wallet address from phrase
3. Generate nonce challenge
4. Sign nonce with wallet private key
5. Send `{ address, signature, nonce }` to custom auth endpoint
6. Server verifies signature matches address
7. Create Appwrite user with ID: `wallet:${address.toLowerCase()}`
8. Issue custom token via `users.createToken()`
9. Create session with custom token

### Method 2: Passkey Authentication (Wallet Proxy)
**User Flow:**
```
/auth → "Continue with Passkey" → Biometric prompt → Decrypt wallet → Sign nonce → Authenticated
```

**Technical Flow:**
1. User triggers passkey authentication
2. WebAuthn authenticates the passkey
3. Passkey decrypts the stored encrypted wallet
4. Generate nonce challenge
5. Sign nonce with decrypted wallet private key
6. Send `{ address, signature, nonce, authMethod: 'passkey' }` to custom auth endpoint
7. Server verifies signature matches address (same as wallet auth)
8. Same user ID: `wallet:${address.toLowerCase()}`
9. Same session creation flow

## Custom Auth Endpoint Design

### Single Endpoint: `/api/auth/custom-token/route.ts`

```typescript
POST /api/auth/custom-token
{
  address: "0x742d35Cc...",
  signature: "0x...",
  nonce: "challenge123",
  authMethod: "phrase" | "passkey"
}

Response:
{
  token: "abc123" // 6-char secret for createSession()
}
```

**Server Logic:**
1. Verify signature matches address (same for both methods)
2. Validate and consume nonce
3. Determine user ID: `wallet:${address.toLowerCase()}`
4. Create or retrieve Appwrite user
5. Issue custom token
6. Return token secret

**Key Point**: Server doesn't care if wallet came from phrase or passkey - signature verification is identical.

## Avoiding Auth Method Conflicts

### No Method Confusion
- **Single identity source**: Wallet address
- **Single verification**: Cryptographic signature
- **Single user ID format**: `wallet:${address}`
- **Single custom auth endpoint**: Handles both methods uniformly

### Passkey Wallet Generation Strategy
```typescript
// When user first registers with passkey:
1. Generate new random wallet
2. Encrypt wallet with passkey credential
3. Store encrypted wallet in Appwrite user prefs
4. User identity = wallet address (not passkey ID)

// When user authenticates with passkey:
1. WebAuthn authenticates passkey
2. Decrypt stored wallet using passkey
3. Sign nonce with decrypted wallet
4. Authenticate as wallet address
```

### Phrase vs Passkey Distinction
- **Phrase users**: Own their seed phrase, can recover anywhere
- **Passkey users**: Passkey securely manages wallet, tied to device/browser
- **Same result**: Both authenticate as wallet address
- **No conflict**: Server treats both identically

## Simplified Auth Page: Two Options Only

### `/auth` Page Design
```
┌─────────────────────────────────┐
│         LancerWallet            │
├─────────────────────────────────┤
│                                 │
│  🔑 Continue with Seed Phrase   │
│  Enter your 12/24 word phrase   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  👆 Continue with Passkey       │
│  Use biometric authentication   │
│                                 │
└─────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Custom Auth Foundation
1. **Build unified custom auth endpoint**
   - File: `app/api/auth/custom-token/route.ts`
   - Handles both phrase and passkey authentication
   - Single signature verification logic
   - Deterministic user ID creation

2. **Update auth page**
   - File: `app/auth/page.tsx`
   - Two buttons only: Phrase & Passkey
   - Remove all traditional auth forms

### Phase 2: Phrase Authentication
1. **Direct phrase input**
   - User enters seed phrase on auth page
   - Derive wallet address immediately
   - Sign nonce challenge
   - Call custom auth endpoint

2. **Remove onboarding complexity**
   - No separate wallet creation flow
   - No "save phrase" → "verify phrase" steps
   - Direct phrase → authenticated

### Phase 3: Passkey Wallet Proxy
1. **Passkey registration**
   - Generate wallet when user first registers with passkey
   - Encrypt wallet with passkey credential
   - Store in Appwrite user preferences

2. **Passkey authentication**
   - WebAuthn authenticates passkey
   - Decrypt stored wallet
   - Sign nonce with wallet
   - Same custom auth endpoint

### Phase 4: Clean Legacy Code
1. **Remove Appwrite built-in auth**
   - No email/password flows
   - No traditional user creation
   - 100% custom auth only

2. **Remove wallet unlocking**
   - No unlock prompts after auth
   - No separate wallet management state

## File Structure

```
app/auth/
  page.tsx                 # Two options: Phrase & Passkey
  actions.ts               # Custom auth actions only

lib/auth/
  phrase.ts                # Phrase → wallet → signature
  passkey.ts               # Passkey → decrypt wallet → signature
  custom-auth.ts           # Shared signature verification

app/api/auth/
  custom-token/route.ts    # Single endpoint for both methods
  nonce/route.ts           # Nonce generation
```

## Security Benefits

1. **Unified verification**: Both methods use cryptographic signatures
2. **No auth confusion**: Single identity model (wallet address)
3. **Secure passkey backup**: Passkey encrypts wallet, doesn't replace it
4. **Self-sovereign**: Users always own wallet (phrase or passkey-encrypted)
5. **Custom auth only**: Zero dependency on Appwrite built-in auth

## User Experience

**New Users:**
- Choose phrase (self-custody) or passkey (device-managed)
- Single step: authenticate and you're in
- No unlock prompts, no confusion

**Returning Users:**
- Same two buttons
- Same authentication flow
- Immediate access to wallet

This design eliminates all authentication confusion while maintaining wallet-centric identity and providing passkey as a secure, drop-in alternative to seed phrases.