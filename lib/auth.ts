import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'yantriksha_secret_key_123_change_me_in_prod';
const TOKEN_COOKIE_NAME = 'token';

export interface JWTPayload {
  userId: number;
  veltech_id: string;
  role: 'student' | 'faculty' | 'mentor' | 'admin' | 'superadmin';
  email: string;
  is_core_team?: boolean;
  role_id?: number | null;
}

/**
 * Hash password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password against stored hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for the user session.
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

/**
 * Verify JWT token.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Authenticate incoming request. Checks cookies or Authorization header.
 */
export async function verifyAuth(req: Request): Promise<JWTPayload | null> {
  // 1. Check HttpOnly cookie first (preferred/more secure)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) return decoded;
    }
  } catch (e) {
    // cookies() might throw if called outside Request context or in certain environments
  }

  // 2. Check Authorization Header as fallback
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded) return decoded;
  }

  return null;
}

/**
 * Decodes a base32 string into a Buffer.
 */
function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/=+$/, '');
  const length = clean.length;
  const buffer = Buffer.alloc(Math.floor(length * 5 / 8));
  let bits = 0;
  let value = 0;
  let index = 0;

  for (let i = 0; i < length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return buffer;
}

/**
 * Verifies a 6-digit TOTP token against a base32 secret key.
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    const key = base32Decode(secret);
    const timeStep = 30;
    const window = 1; // allow +/- 30s drift
    const epoch = Math.floor(Date.now() / 1000);
    const currentStep = Math.floor(epoch / timeStep);

    for (let step = currentStep - window; step <= currentStep + window; step++) {
      const counter = Buffer.alloc(8);
      let temp = step;
      for (let i = 7; i >= 0; i--) {
        counter[i] = temp & 0xff;
        temp = temp >> 8;
      }

      const hmac = crypto.createHmac('sha1', key);
      hmac.update(counter);
      const hash = hmac.digest();

      const offset = hash[hash.length - 1] & 0xf;
      const binary =
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);

      const otp = (binary % 1000000).toString().padStart(6, '0');
      if (otp === token) {
        return true;
      }
    }
  } catch (err) {
    console.error('[TOTP] Verification error:', err);
  }
  return false;
}

