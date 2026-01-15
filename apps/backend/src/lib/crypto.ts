import crypto from 'crypto';
import { config } from '@cher-journal/config';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

interface EncryptedData {
  cipherText: Buffer;
  iv: Buffer;
  tag: Buffer;
  wrappedDek: Buffer;
  alg: string;
  version: number;
}

/**
 * Generate a Data Encryption Key (DEK)
 */
function generateDEK(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Get the master Key Encryption Key (KEK) from environment
 */
function getKEK(): Buffer {
  const key = config.masterEncryptionKey;
  if (!key || key.length < KEY_LENGTH) {
    throw new Error('MASTER_ENCRYPTION_KEY must be at least 32 bytes');
  }
  return Buffer.from(key.slice(0, KEY_LENGTH), 'utf-8');
}

/**
 * Wrap (encrypt) a DEK with the KEK
 */
function wrapDEK(dek: Buffer): Buffer {
  const kek = getKEK();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', kek, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(dek),
    cipher.final(),
  ]);
  
  // Prepend IV to the encrypted DEK
  return Buffer.concat([iv, encrypted]);
}

/**
 * Unwrap (decrypt) a DEK with the KEK
 */
function unwrapDEK(wrappedDek: Buffer): Buffer {
  const kek = getKEK();
  const iv = wrappedDek.slice(0, IV_LENGTH);
  const encrypted = wrappedDek.slice(IV_LENGTH);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', kek, iv);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
}

/**
 * Encrypt plaintext using envelope encryption
 */
export function encrypt(plaintext: string): EncryptedData {
  // Generate a random DEK for this data
  const dek = generateDEK();
  
  // Encrypt the plaintext with the DEK
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);
  
  const cipherText = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);
  
  const tag = cipher.getAuthTag();
  
  // Wrap the DEK with the KEK
  const wrappedDek = wrapDEK(dek);
  
  return {
    cipherText,
    iv,
    tag,
    wrappedDek,
    alg: ALGORITHM,
    version: 1,
  };
}

/**
 * Decrypt ciphertext using envelope encryption
 */
export function decrypt(encryptedData: EncryptedData): string {
  // Unwrap the DEK
  const dek = unwrapDEK(encryptedData.wrappedDek);
  
  // Decrypt the ciphertext with the DEK
  const decipher = crypto.createDecipheriv(
    encryptedData.alg as crypto.CipherGCMTypes,
    dek,
    encryptedData.iv
  );
  
  decipher.setAuthTag(encryptedData.tag);
  
  const plaintext = Buffer.concat([
    decipher.update(encryptedData.cipherText),
    decipher.final(),
  ]);
  
  return plaintext.toString('utf-8');
}

/**
 * Decrypt an EncryptedBlob from database
 */
export function decryptBlob(blob: {
  cipherText: Buffer;
  iv: Buffer;
  tag: Buffer;
  wrappedDek: Buffer;
  alg: string;
  version: number;
}): string {
  return decrypt({
    cipherText: blob.cipherText,
    iv: blob.iv,
    tag: blob.tag,
    wrappedDek: blob.wrappedDek,
    alg: blob.alg,
    version: blob.version,
  });
}
