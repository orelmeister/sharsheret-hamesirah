/**
 * Auth utilities for Sharsheret HaMesirah admin.
 * Simple JWT-based cookie auth — no NextAuth dependency.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';

// ── Config ──
const COOKIE_NAME = 'sharsheret_admin_token';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'change-me-in-production-use-env-var';
const TOKEN_EXPIRY_HOURS = 24;

// ── Types ──
export interface SessionPayload {
  sub: string;       // userId
  username: string;
  role: string;
  name?: string;
  iat: number;
  exp: number;
}

// ── Password ──
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ──
function base64urlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

function createJWT(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_HOURS * 3600,
  };

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify(fullPayload));
  const signature = sign(`${header}.${body}`, JWT_SECRET);

  return `${header}.${body}.${signature}`;
}

function verifyJWT(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, bodyB64, sigB64] = parts;
  const expectedSig = sign(`${headerB64}.${bodyB64}`, JWT_SECRET);

  // Constant-time comparison
  const sigBuf = Buffer.from(sigB64);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(base64urlDecode(bodyB64)) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Session helpers ──
export async function createSession(payload: {
  userId: string;
  username: string;
  role: string;
  name?: string;
}): Promise<string> {
  const token = createJWT({
    sub: payload.userId,
    username: payload.username,
    role: payload.role,
    name: payload.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY_HOURS * 3600,
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
  } catch {
    return null;
  }
}

export async function getSessionOrThrow(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// ── Server-component / page-level auth guard ──
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}
