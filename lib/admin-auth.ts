/**
 * Admin API auth wrapper.
 * Higher-order function that wraps Next.js route handlers with auth check.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession, type SessionPayload } from '@/lib/auth';

export type AuthenticatedRequest = NextRequest & {
  session: SessionPayload;
};

type RouteHandler = (
  req: AuthenticatedRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with authentication.
 * Returns 401 if no valid session cookie is present.
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    const token = req.cookies.get('sharsheret_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'אין הרשאה — נא להתחבר' }, { status: 401 });
    }

    // Import dynamically to avoid ESM/edge issues; verifyJWT is synchronous anyway
    const { createHmac, timingSafeEqual } = await import('crypto');
    const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'change-me-in-production-use-env-var';

    function base64urlDecode(data: string): string {
      return Buffer.from(data, 'base64url').toString('utf-8');
    }

    function base64urlEncode(data: string): string {
      return Buffer.from(data).toString('base64url');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'טוקן לא תקין' }, { status: 401 });
    }

    const [headerB64, bodyB64, sigB64] = parts;
    const expectedSig = createHmac('sha256', JWT_SECRET).update(`${headerB64}.${bodyB64}`).digest('base64url');

    const sigBuf = Buffer.from(sigB64);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return NextResponse.json({ error: 'טוקן לא חוקי' }, { status: 401 });
    }

    let payload: SessionPayload;
    try {
      payload = JSON.parse(base64urlDecode(bodyB64)) as SessionPayload;
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({ error: 'פג תוקף ההתחברות — נא להתחבר מחדש' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'טוקן פגום' }, { status: 401 });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.session = payload;
    return handler(authReq, context);
  };
}


