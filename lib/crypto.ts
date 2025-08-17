import CryptoJS from 'crypto-js';

/**
 * A client-side service for encrypting and decrypting sensitive data.
 * This ensures that data like private keys and mnemonics are never
 * sent to the server or stored in the database in plaintext.
 */

/**
 * Encrypts a JavaScript object using AES.
 * @param data The object to encrypt.
 * @param key The encryption key (e.g., user's password).
 * @returns The encrypted data as a string.
 */
export function encryptData(data: object, key: string): string {
  if (!data || !key) {
    throw new Error('Data and key are required for encryption.');
  }
  const dataString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(dataString, key).toString();
  return encrypted;
}

/**
 * Decrypts data that was encrypted with encryptData using AES.
 * @param encryptedData The encrypted data string.
 * @param key The decryption key (e.g., user's password).
 * @returns The decrypted JavaScript object.
 */
export function decryptData<T>(encryptedData: string, key: string): T | null {
  if (!encryptedData || !key) {
    throw new Error('Encrypted data and key are required for decryption.');
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    // If the decrypted string is empty, it means decryption failed (e.g., wrong key)
    if (!decryptedString) {
      return null;
    }

    return JSON.parse(decryptedString) as T;
  } catch (error) {
    // This can happen if the key is incorrect or the data is corrupted
    console.error('Decryption failed:', error);
    return null;
  }
}
