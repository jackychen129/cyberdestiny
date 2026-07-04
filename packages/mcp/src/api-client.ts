export function createApiClient(baseUrl: string) {
  const apiKey = process.env.CYBERDESTINY_API_KEY;

  function headers(extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Language': 'zh-CN',
      ...extra,
    };
    if (apiKey) h['X-API-Key'] = apiKey;
    return h;
  }

  return {
    async get(path: string, extraHeaders?: Record<string, string>): Promise<unknown> {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: headers(extraHeaders),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API ${res.status}: ${body}`);
      }
      return res.json();
    },

    async post(path: string, body: unknown): Promise<unknown> {
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
      }
      return res.json();
    },
  };
}
