const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

import { GUEST_SESSION_HEADER } from '@cyberdestiny/shared';
import { getGuestSessionId } from '@/lib/guest';

function authHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': 'zh-CN',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    headers[GUEST_SESSION_HEADER] = getGuestSessionId();
  }
  return headers;
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string };
    return json.message ?? text;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  let res: Response;
  try {
    const { getToken } = await import('@/lib/auth');
    const t = token ?? (typeof window !== 'undefined' ? getToken() : null);
    res = await fetch(`${API_URL}${path}`, {
      headers: authHeaders(t),
      cache: 'no-store',
    });
  } catch {
    throw new Error(`无法连接 API（${API_URL}），请确认已运行: pnpm --filter @cyberdestiny/api dev`);
  }
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  let res: Response;
  try {
    const { getToken } = await import('@/lib/auth');
    const t = token ?? (typeof window !== 'undefined' ? getToken() : null);
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { ...authHeaders(t), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new Error(`无法连接 API（${API_URL}），请确认已运行: pnpm --filter @cyberdestiny/api dev`);
  }
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export { API_URL };
