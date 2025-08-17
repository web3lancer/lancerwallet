# LancerWallet — TODO

This file tracks what is implemented and what remains, with actionable, prioritized checkboxes for progress.

---

## ✅ Implemented (Current State)

- [x] Local-first wallet creation/import
  - [x] Users can create/import wallets without authentication; wallets are saved in localStorage.
  - [x] Onboarding flow supports both new and restore.
- [x] Appwrite integration
  - [x] Auth (email/password) and session management.
  - [x] Cloud backup: encrypted wallet data can be saved to Appwrite (using password as key).
- [x] Encryption
  - [x] Uses AES (via crypto-js) for encrypting wallet data before cloud backup.
- [x] Wallet management
  - [x] View, create, and restore wallets (local and cloud).
  - [x] Basic transaction send, balance fetch, and placeholder for transaction history.
- [x] Settings UI
  - [x] Backup/export, restore/import, reveal secret phrase, reset wallet.
  - [x] Security toggles (biometric, auto-lock, etc.).
- [x] Middleware
  - [x] Auth is optional; app works for unauthenticated users.
- [x] UI
  - [x] Responsive, themed, and modular components.
- [x] Basic error handling and state management (zustand).

---

## 🟡 To Implement (Prioritized & Trackable)

### 1. Security & Storage

- [ ] Encrypt local wallet storage (high)
  - [ ] Encrypt mnemonics/private keys in localStorage using a user passphrase (not plain JSON).
  - [ ] Use PBKDF2 or Argon2 for key derivation, store salt with ciphertext.
  - [ ] Add unlock UI for local wallets (prompt for passphrase).
  - [ ] Acceptance: No wallet data is readable in localStorage without passphrase.

- [ ] Biometric unlock (medium)
  - [ ] Integrate platform biometrics (WebAuthn, fingerprint/face) for unlocking wallets.
  - [ ] Acceptance: User can opt-in to biometric unlock in settings.

### 2. Migration & Backup

- [ ] Migrate local wallets to cloud (high)
  - [ ] UI flow to encrypt and backup local wallets to Appwrite.
  - [ ] Progress indicator, error handling, and deduplication.
  - [ ] Acceptance: User can migrate all local wallets to cloud, with clear status.

- [ ] Conflict resolution (medium)
  - [ ] Handle duplicate wallets between local and cloud.
  - [ ] Show sync status and last backup timestamp.

### 3. Import/Export

- [ ] Export encrypted backup file (medium)
  - [ ] Export wallets/mnemonic as encrypted JSON file (with salt, version, timestamp).
  - [ ] Acceptance: User can export and later restore wallets securely.

- [ ] Import encrypted backup file (medium)
  - [ ] Restore wallets from encrypted backup file, prompt for passphrase.

### 4. Features

- [ ] Fiat price feed (medium)
  - [ ] Integrate CoinGecko or similar for real-time ETH price.
  - [ ] Acceptance: Wallet balance in USD is accurate.

- [ ] Transaction history (medium)
  - [ ] Fetch and display transaction history using Etherscan/Alchemy APIs.

- [ ] Token & NFT support (medium)
  - [ ] Sync and display ERC-20/721/1155 tokens and NFTs.

### 5. UX & Polishes

- [ ] Local vs Cloud wallet indicators (medium)
  - [ ] Show badges for wallet storage type and sync status.

- [ ] Accessibility & i18n (low)
  - [ ] Audit for accessibility, add language support.

- [ ] Error messages & analytics (low)
  - [ ] Improve error feedback and add analytics for backup failures.

### 6. Developer Tasks

- [ ] Add `.env.local.example` (high)
  - [ ] Document required Appwrite env vars and usage.

- [ ] Unit tests for crypto and wallet flows (high)
  - [ ] Add tests for encryption, decryption, migration, and backup.

- [ ] Pre-commit hooks (medium)
  - [ ] Lint, format, and test on commit.

- [ ] Document encryption format and migration in README (medium)
  - [ ] Add section to README or docs.

---

## 🟢 Immediate Next Steps

- [ ] Implement secure local encryption for wallet storage (lib/crypto.ts, lib/wallet.ts, lib/store.ts).
- [ ] Add unlock UI for local wallets (settings, wallets page).
- [ ] Add migration UI for backing up local wallets to Appwrite.
- [ ] Add export/import encrypted backup file support.
- [ ] Add `.env.local.example` and update README.

---

This TODO is based on a full scan of your codebase and key flows.