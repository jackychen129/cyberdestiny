import { createHmac, timingSafeEqual } from 'node:crypto';

export interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  exp: number;
}

function base64url(data: string | Buffer): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function signJwt(payload: Omit<JwtPayload, 'exp'>, secret: string, days = 7): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + days * 86400,
    }),
  );
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64url(sig)}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const header = parts[0]!;
  const body = parts[1]!;
  const sig = parts[2]!;
  const expected = createHmac('sha256', secret).update(`${header}.${body}`).digest();
  const actual = Buffer.from(sig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(),
    ) as JwtPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
