# LancerWallet: Custom Auth with Wallet-Centric Identity

## Overview

This document outlines the plan to refactor the authentication system of LancerWallet to a more secure and streamlined "Wallet as Identity" model. The current system has multiple, confusing authentication methods. The new system will be based on a single, unified identity model where the user's wallet address is their primary identifier.

This plan is based on the `plan.md` file and my exploration of the codebase.

## Implemented Features (as of now)

*   **Multi-flow Authentication:** The current system supports:
    *   Sign up with Passkey (generates a new wallet)
    *   Sign up with Password (generates a new wallet, encrypts with password)
    *   Import wallet with seed phrase (encrypts with password)
    *   Log in with Passkey
    *   Log in with Secret Phrase
*   **Appwrite Backend:** User data and wallet information are stored in Appwrite.
*   **WebAuthn Integration:** A standard WebAuthn implementation is in place for passkey authentication.

## Implementation Plan

This plan is divided into four phases, as outlined in the original `plan.md`.

### Phase 1: Custom Auth Foundation

1.  **Create a unified custom auth endpoint.**
    *   **File:** `app/api/auth/custom-token/route.ts`
    *   **Logic:**
        *   Accepts a wallet `address`, a `signature`, and a `nonce`.
        *   Verifies the signature against the address.
        *   Finds or creates an Appwrite user with the ID `wallet:${address.toLowerCase()}`.
        *   Generates a custom token using `users.createToken()` and returns it.
    *   This endpoint will be the single point of entry for both phrase and passkey authentication.

2.  **Create a nonce generation endpoint.**
    *   **File:** `app/api/auth/nonce/route.ts`
    *   **Logic:**
        *   Generates a secure, single-use nonce.
        *   Stores the nonce temporarily (e.g., in user prefs or a short-lived database entry) to prevent replay attacks.
        *   Returns the nonce to the client.

3.  **Update the auth page UI.**
    *   **File:** `app/auth/page.tsx` and `app/auth/AuthForm.tsx`
    *   **Changes:**
        *   Remove the existing complex `AuthForm.tsx`.
        *   Create a new, simpler component that presents only two options: "Continue with Seed Phrase" and "Continue with Passkey".
        *   This new form will be the foundation for the next phases.

### Phase 2: Phrase Authentication

1.  **Implement the "Continue with Seed Phrase" flow.**
    *   **Component:** The new auth form component.
    *   **Logic:**
        1.  User enters their 12/24-word seed phrase in a textarea.
        2.  Client-side, the wallet address is derived from the phrase.
        3.  The client requests a nonce from `/api/auth/nonce`.
        4.  The client signs the nonce with the wallet's private key.
        5.  The client sends `{ address, signature, nonce }` to the `/api/auth/custom-token` endpoint.
        6.  The client receives the custom token and uses it to create a session with Appwrite.
    *   **Helper files:** New files `lib/auth/phrase.ts` and `lib/auth/custom-auth.ts` will be created to encapsulate the logic for phrase handling and signature verification.

### Phase 3: Passkey Wallet Proxy

1.  **Implement the "Continue with Passkey" registration flow.**
    *   **Component:** The new auth form component.
    *   **Logic:**
        1.  When a new user chooses to register with a passkey, the client will:
        2.  Generate a *new* random wallet (seed phrase and keys).
        3.  **Crucially, instead of showing the user the seed phrase, it will be encrypted using the passkey credential.** This is a key change from the current implementation.
        4.  The encrypted wallet will be stored in the Appwrite user's preferences.
        5.  The user's identity will be the address of the generated wallet, *not* the passkey ID.
    *   **API Changes:** The existing WebAuthn registration endpoints will need to be modified to support this new flow. Specifically, `verify-registration` will need to be updated to store the passkey-encrypted wallet.

2.  **Implement the "Continue with Passkey" authentication flow.**
    *   **Component:** The new auth form component.
    *   **Logic:**
        1.  User triggers passkey authentication.
        2.  WebAuthn authenticates the passkey on the client.
        3.  The client fetches the encrypted wallet from the user's preferences.
        4.  **The passkey is used to decrypt the wallet's seed phrase on the client.**
        5.  The client now has the wallet's private key.
        6.  The flow then proceeds exactly like the phrase-based authentication: sign a nonce and call the `/api/auth/custom-token` endpoint.
    *   **Helper files:** A new file `lib/auth/passkey.ts` will be created to manage the passkey encryption and decryption logic.

### Phase 4: Clean Legacy Code

1.  **Remove old authentication code.**
    *   Delete the old `walletAuth` server action in `app/auth/actions.ts`.
    *   Remove the old API endpoints that are no longer needed (e.g., `/api/auth/verify-signature`).
    *   Delete any other supporting files or logic related to the old, complex auth flows.
    *   This will ensure that the application only uses the new, streamlined, and secure wallet-centric authentication system.

2.  **Remove wallet unlocking prompts.**
    *   The new system authenticates the user and gives them access to their wallet in a single step.
    *   Any post-login "unlocking" steps or separate wallet management state should be removed to simplify the user experience.
