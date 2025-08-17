# LancerWallet — TODO

Purpose: track implemented items, remaining tasks, priorities, owners, and acceptance criteria.

## 1) Completed / Current state (based on repository scan)
- Next.js app with Appwrite integration under `lib/appwrite`.
- Local-first wallet support implemented in `lib/wallet.ts` and `lib/store.ts` (refactor present).
- Onboarding, auth, wallets, settings, send, nft pages exist (server and client components split across `app/`).
- Middleware is permissive; auth is optional and app supports local-only usage with optional cloud backup.
- UI import/export issues for core UI components (Button, Input, Card, Skeleton) have been addressed in components.
- `REFACTOR_SUMMARY.md` and other notes exist describing refactors.

## 2) High-priority (security & core functionality)
- [ ] Secure local storage (high)
  - Implement strong encryption for local wallet storage (mnemonic & private keys).
  - Add `lib/crypto.ts` (Web Crypto wrappers): `deriveKeyFromPassword`, `encryptPayload`, `decryptPayload`, `generateSalt`.
  - Update `lib/wallet.ts` and `lib/store.ts` to add: `encryptLocalWallet`, `decryptLocalWallet`, `saveEncryptedWalletToLocal`, `getDecryptedWalletsFromLocal`.
  - Acceptance: Wallets saved locally are AES-GCM encrypted using a passphrase-derived key (PBKDF2 or Argon2). Decryption works across sessions; salt stored alongside ciphertext.

- [ ] Migration UI: migrate local wallets to cloud (high)
  - Add UI in `app/settings/pageClient.tsx` (or `components/settings`) with flows:
    - Set passphrase / confirm
    - Encrypt all local wallets
    - Backup encrypted wallets to Appwrite (via server-side endpoint)
    - Show progress, success, and error states
  - Acceptance: User can encrypt local wallets and push encrypted copies to Appwrite; UI shows status per-wallet.

- [ ] Server-side secure backup (high)
  - Move Appwrite admin operations to `lib/appwrite/server.ts` (server-only functions / API routes).
  - Ensure client never uses admin API keys (no Client.setKey in client code).
  - Acceptance: Backup endpoint accepts encrypted payloads and stores them under the authenticated user's record; admin keys only used server-side.

- [ ] Key derivation and recovery UX (high)
  - Use robust KDF (PBKDF2 with many iterations for wide compatibility, or Argon2 if available server-side). Store salt and KDF params with encrypted data.
  - Provide clear UX for passphrase selection, warnings about loss, and optional passphrase hint (not stored in plaintext).

## 3) Medium-priority (UX & features)
- [ ] Local vs Cloud wallet indicators (medium)
  - Show badges in `app/wallets/pageClient.tsx` indicating whether a wallet is local-only, backed-up, or cloud.

- [ ] Import/export encrypted backup file (medium)
  - Implement export/import of encrypted backup files (JSON format including cipher, salt, kdf params, version, timestamp).
  - Acceptance: User can export encrypted file and import it elsewhere with passphrase.

- [ ] Passkey / WebAuthn unlock (medium)
  - Integrate WebAuthn flows (code exists under `app/api/auth/webauthn`) to unlock local wallets after initial passphrase unlock.

- [ ] Fiat price feed & transaction history (medium)
  - Integrate CoinGecko for prices and Alchemy/Etherscan for transaction history. Update `pageClient.tsx` pages to fetch and display.

## 4) Low-priority / Nice-to-have
- [ ] Background sync & retry logic
- [ ] Conflict resolution UI for duplicated wallets between local and cloud
- [ ] Multi-device sync status and last-backed-up timestamps in `settings` and `wallets` views
- [ ] E2E tests and CI pipeline for onboarding, wallet create/import, and backup flows
- [ ] Accessibility (a11y) audit and i18n readiness

## 5) Developer tasks & housekeeping
- [ ] Add `.env.local.example` with Appwrite placeholders (project id, endpoint, api key note for server only)
- [ ] Add unit tests for crypto helpers and wallet migration (suggest using Vitest / Jest)
- [ ] Add pre-commit hooks to run formatter and linters
- [ ] Document encryption format and migration procedure in `README.md` or `docs/MIGRATION.md`

## 6) Immediate next steps (recommended)
1. Implement `lib/crypto.ts` using Web Crypto APIs. Provide tests for round-trip encryption/decryption.
2. Add wallet encryption helpers in `lib/wallet.ts` and update `lib/store.ts` to prefer encrypted storage when a passphrase is set.
3. Add migration UI under `app/settings/pageClient.tsx` with flows to encrypt and backup local wallets to Appwrite.
4. Implement a server-side API route (e.g., `app/api/backup/route.ts`) that accepts encrypted payloads and stores them using server-side Appwrite client via `lib/appwrite/server.ts`.
5. Add `.env.local.example` and document deployment notes about Appwrite admin keys.

## 7) Notes and assumptions
- The repo already contains an Appwrite integration under `lib/appwrite` and webauthn server helpers under `app/api/auth/webauthn` — leverage these when implementing server endpoints.
- Prefer Web Crypto (native browser) over `crypto-js` for modern security and smaller bundle size; use PBKDF2 for browser compatibility and Argon2 server-side if available.
- Keep backward compatibility by detecting unencrypted local wallet payloads and offering a migration path (prompt user to set passphrase and encrypt existing wallets).

---

If you want, I will now:
- Overwrite `/home/user/lancerwallet/TODO.md` with this content and create a git commit summarizing the change.
- Or open a branch and commit the change (local commit only; no push unless you request).

Which would you like me to do next?