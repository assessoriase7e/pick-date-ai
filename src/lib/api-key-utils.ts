import crypto from 'crypto';

const PREFIX = "sk"; // Example prefix (secret key)
const BYTE_LENGTH = 32; // Key length in bytes

export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(BYTE_LENGTH);
  // Use base64url encoding to avoid problematic characters in URLs/storage
  const key = randomBytes.toString('base64url');
  return `${PREFIX}_${key}`;
}