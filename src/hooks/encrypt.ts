import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ENCRYPT_KEY; // keep secret

// Encrypt UUID
export function encryptId(id: string): string {
  return CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
}

// Decrypt UUID
export function decryptId(encrypted: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const original = bytes.toString(CryptoJS.enc.Utf8);
    return original || null;
  } catch {
    return null;
  }
}
