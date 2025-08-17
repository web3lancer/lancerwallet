# LancerWallet TODO

This file tracks the current development plan.

## Current Task: Implement Secure, Encrypted Wallet Storage with Appwrite

- [ ] **Install Dependencies:** Install `crypto-js` for encryption.
- [ ] **Implement User Authentication:** Create `/auth` page for login/signup with Appwrite.
- [ ] **Create Encryption Service:** Build `lib/crypto.ts` to handle AES encryption/decryption.
- [ ] **Integrate Encrypted Storage:** Refactor `lib/wallet.ts` to use Appwrite's database instead of `localStorage`.
- [ ] **Refactor UI:** Protect pages and fetch data from Appwrite after login.
- [ ] **Verify:** Lint the code and manually test the entire flow.
