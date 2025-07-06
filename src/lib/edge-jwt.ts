// Edge Runtime compatible JWT utilities using jose
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';

// Define our custom JWT payload interface
export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
  hasCompletedOnboarding?: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Verify JWT token in Edge Runtime
 */
export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Generate JWT token in Edge Runtime (if needed)
 */
export async function generateTokenEdge(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('59m')
    .sign(secret);
  
  return jwt;
}