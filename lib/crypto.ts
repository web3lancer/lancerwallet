import CryptoJS from 'crypto-js';

// --- E2E Encryption based on Wallet Mnemonic ---

// A static salt is used here. In password hashing, a unique salt per user is crucial.
// However, for deriving a key from a high-entropy source like a mnemonic, a static
// salt is acceptable as we are not storing the result and want the derivation to be
// deterministic across devices.
const SALT = 'LancerWalletE2EE-Salt-v1';
const KEY_SIZE = 256 / 32; // 256 bits
const ITERATIONS = 5000;

/**
 * Derives a strong symmetric encryption key from a mnemonic phrase.
 * This key is used for all E2E encryption of user data.
 * @param mnemonic The user's 12 or 24-word mnemonic phrase.
 * @returns A WordArray representing the derived key.
 */
function deriveEncryptionKey(mnemonic: string): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(mnemonic, SALT, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256
  });
}

/**
 * Encrypts a JavaScript object using a key derived from the mnemonic.
 * The output is a string containing the IV and ciphertext, suitable for storing.
 * @param data The object to encrypt.
 * @param mnemonic The mnemonic to derive the encryption key from.
 * @returns The encrypted data as a string (iv:ciphertext).
 */
export function encryptDataWithMnemonic(data: object, mnemonic: string): string {
  if (!data || !mnemonic) {
    throw new Error('Data and mnemonic are required for encryption.');
  }

  const key = deriveEncryptionKey(mnemonic);
  const dataString = JSON.stringify(data);

  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(dataString, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  // Combine IV and ciphertext into a single string for easy storage.
  const combined = iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
  return combined;
}

/**
 * Decrypts data using a key derived from the mnemonic.
 * @param combinedData The encrypted data string (iv:ciphertext).
 * @param mnemonic The mnemonic to derive the decryption key from.
 * @returns The decrypted JavaScript object, or null if decryption fails.
 */
export function decryptDataWithMnemonic<T>(combinedData: string, mnemonic: string): T | null {
  if (!combinedData || !mnemonic) {
    throw new Error('Encrypted data and mnemonic are required for decryption.');
  }

  try {
    const parts = combinedData.split(':');
    if (parts.length !== 2) {
      console.error('Invalid encrypted data format.');
      return null;
    }

    const iv = CryptoJS.enc.Base64.parse(parts[0]);
    const ciphertext = parts[1];
    const key = deriveEncryptionKey(mnemonic);

    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      // This often means the wrong mnemonic was used.
      return null;
    }

    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// --- Password-based Encryption for Local Storage ---

/**
 * Basic AES(password) encryption. Kept for compatibility (e.g., passkey PRF usage).
 */
export function encryptDataWithPassword(data: object, password: string): string {
  if (!data || !password) {
    throw new Error('Data and password are required for encryption.');
  }
  const dataString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, password).toString();
}

/**
 * Basic AES(password) decryption. Kept for compatibility.
 */
export function decryptDataWithPassword<T>(encryptedData: string, password: string): T | null {
  if (!encryptedData || !password) {
    throw new Error('Encrypted data and password are required for decryption.');
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      return null;
    }
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Password-based decryption failed:', error);
    return null;
  }
}

// --- Strengthened PBKDF2 + IV + Salt for local wallet secrets ---
const PASS_KEY_SIZE = 256 / 32;
const PASS_ITERATIONS = 100_000;

function derivePasswordKey(password: string, salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: PASS_KEY_SIZE,
    iterations: PASS_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
}

export interface EncryptedBlobV1 {
  v: 1;
  s: string; // base64 salt
  iv: string; // base64 iv
  ct: string; // base64 ciphertext
}

/**
 * Encrypts data using PBKDF2(password+random salt) and random IV.
 * Returns a compact JSON string suitable for storage.
 */
export function encryptWithPassphrase(data: object, passphrase: string): string {
  if (!data || !passphrase) {
    throw new Error('Data and passphrase are required for encryption.');
  }
  const salt = CryptoJS.lib.WordArray.random(16);
  const key = derivePasswordKey(passphrase, salt);
  const iv = CryptoJS.lib.WordArray.random(16);
  const plaintext = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  const blob: EncryptedBlobV1 = {
    v: 1,
    s: CryptoJS.enc.Base64.stringify(salt),
    iv: CryptoJS.enc.Base64.stringify(iv),
    ct: encrypted.toString(),
  };
  return JSON.stringify(blob);
}

/**
 * Decrypts data encrypted by encryptWithPassphrase.
 */
export function decryptWithPassphrase<T>(blobString: string, passphrase: string): T | null {
  if (!blobString || !passphrase) {
    throw new Error('Encrypted blob and passphrase are required for decryption.');
  }
  try {
    const blob = JSON.parse(blobString) as EncryptedBlobV1;
    if (blob.v !== 1 || !blob.s || !blob.iv || !blob.ct) {
      console.error('Unsupported or invalid encrypted blob format');
      return null;
    }
    const salt = CryptoJS.enc.Base64.parse(blob.s);
    const iv = CryptoJS.enc.Base64.parse(blob.iv);
    const key = derivePasswordKey(passphrase, salt);
    const decrypted = CryptoJS.AES.decrypt(blob.ct, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    if (!plaintext) return null;
    return JSON.parse(plaintext) as T;
  } catch (e) {
    console.error('decryptWithPassphrase failed:', e);
    return null;
  }
}
