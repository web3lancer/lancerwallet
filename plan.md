# LancerWallet: Streamlined Authentication Plan

## Problem with Current Implementation

The existing flow is completely broken:
1. User creates account/wallet 
2. App immediately asks to "unlock wallet" 
3. User is confused - they JUST created the credentials
4. Multiple confusing authentication steps that make no sense

## Core Principle: Direct Authentication via Credential Choice

Users should authenticate directly with their preferred credential method. No "wallet unlocking" nonsense after account creation.

## New Authentication Flow

### Single Landing Page: Three Clear Options

**URL: `/auth`**

The user sees exactly three options:
1. **Continue with Passkey** (biometric/hardware key)
2. **Continue with Phrase** (seed phrase authentication) 
3. **Continue with Password** (traditional password)

### Option 1: Continue with Passkey

**Flow:**
```
/auth → Click "Continue with Passkey" → Browser biometric prompt → Authenticated → /home
```

**Implementation:**
- Use WebAuthn API for biometric/hardware key authentication
- Store credential in Appwrite user preferences
- Create session directly after successful authentication
- No wallet "unlocking" - passkey IS the authentication

**Files to modify:**
- `app/auth/page.tsx` - Add passkey authentication button
- `lib/auth/passkey.ts` - WebAuthn implementation
- `app/api/auth/passkey/route.ts` - Server-side verification

### Option 2: Continue with Phrase

**Flow:**
```
/auth → Click "Continue with Phrase" → Enter 12/24 word phrase → Authenticated → /home
```

**Implementation:**
- User enters seed phrase directly on auth page
- Derive wallet address from phrase
- Sign nonce challenge to prove ownership
- Create session with wallet address as identity
- No separate "wallet creation" step

**Files to modify:**
- `app/auth/page.tsx` - Add phrase input form
- `lib/wallet.ts` - Direct phrase-to-auth functions
- `app/api/auth/phrase/route.ts` - Nonce challenge & verification

### Option 3: Continue with Password

**Flow:**
```
/auth → Click "Continue with Password" → Email/Password form → Authenticated → /home
```

**Implementation:**
- Traditional email/password authentication
- Use Appwrite's built-in auth
- Create session directly
- Optional: Allow linking wallet later in settings

**Files to modify:**
- `app/auth/page.tsx` - Add email/password form
- Use existing Appwrite auth actions

## Account Creation vs Authentication

### New Users (Account Creation)

**Passkey Users:**
```
/auth → "Continue with Passkey" → "Create new passkey account" → Register passkey → /home
```

**Phrase Users:**
```
/auth → "Continue with Phrase" → "Create new wallet" → Generate phrase → Show phrase → Verify phrase → /home
```

**Password Users:**
```
/auth → "Continue with Password" → "Create account" → Email/Password signup → /home
```

### Returning Users (Authentication)

**All credential types use the same buttons, system auto-detects:**
- Passkey: Browser prompts for existing credential
- Phrase: Validates existing wallet
- Password: Validates existing account

## Key Changes to Fix UX

### 1. Eliminate "Wallet Unlocking" Concept

**REMOVE:**
- Any "unlock wallet" prompts after account creation
- Separate wallet creation flows that don't lead to authentication
- Confusing multi-step processes

**REPLACE WITH:**
- Direct authentication via chosen credential
- Immediate session creation after successful auth
- Single-step account creation + authentication

### 2. Consolidate Authentication Entry Points

**REMOVE:**
- Multiple authentication pages
- Onboarding flows that don't authenticate
- Wallet management separate from authentication

**REPLACE WITH:**
- Single `/auth` page with three clear options
- Each option handles both new users and returning users
- Immediate redirect to `/home` after authentication

### 3. Simplify State Management

**REMOVE:**
- Complex wallet unlocking state
- Multiple authentication states
- Confusing "wallet loaded but not authenticated" states

**REPLACE WITH:**
- Binary authentication state: authenticated or not
- Session-based authentication (HTTP-only cookies)
- Clear user identity (passkey ID, wallet address, or email)

## Implementation Priority

### Phase 1: Fix Core Auth Page
1. Replace current auth forms with three-button layout
2. Implement phrase authentication (simplest)
3. Test end-to-end flow: phrase → authenticated → /home

### Phase 2: Add Passkey Support
1. Implement WebAuthn registration/authentication
2. Add passkey option to auth page
3. Test biometric authentication flow

### Phase 3: Clean Up Legacy Code
1. Remove broken wallet unlocking flows
2. Remove confusing onboarding pages
3. Consolidate authentication logic

## New File Structure

```
app/auth/
  page.tsx                 # Single auth page with 3 options
  actions.ts              # All auth actions (phrase, passkey, password)

lib/auth/
  phrase.ts               # Phrase-based authentication
  passkey.ts              # WebAuthn implementation
  session.ts              # Session management

app/api/auth/
  phrase/route.ts         # Phrase auth endpoint
  passkey/route.ts        # Passkey auth endpoint
  session/route.ts        # Session validation
```

## Success Criteria

1. **User creates account:** One-click process that ends with authentication
2. **User returns:** Same three buttons, immediate authentication 
3. **No confusion:** Zero "unlock wallet" prompts after account creation
4. **Clear path:** Each credential type has obvious, separate flow
5. **Instant access:** Authentication immediately leads to `/home`

## What Gets Removed

- `app/onboarding/` - Replace with direct auth flows
- Wallet unlocking state management
- Complex multi-step authentication flows
- Confusing "wallet loaded but not authenticated" states
- Any prompt to "unlock" immediately after account creation

This plan eliminates the broken UX and provides three clear, separate authentication paths that users understand.