import * as crypto from 'crypto';

export function generateRandomCode(length: number = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % chars.length;
    result += chars[index];
  }

  return result;
}





