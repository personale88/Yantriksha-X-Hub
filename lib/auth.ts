import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'yantriksha_secret_key_123_change_me_in_prod';
const TOKEN_COOKIE_NAME = 'token';

export interface JWTPayload {
  userId: number;
  veltech_id: string;
  role: 'student' | 'faculty' | 'mentor' | 'admin';
  email: string;
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
