import { jwtVerify } from 'jose';

const PROTECTED_ROUTES = /^\/api\/tasks/;
const PUBLIC_ROUTES = ['/api/auth/register', '/api/auth/login'];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (PUBLIC_ROUTES.includes(path)) {
      return forwardRequest(request, env);
    }

    if (PROTECTED_ROUTES.test(path)) {
      const authHeader = request.headers.get('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.split(' ')[1];

      try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId as number;

        const newHeaders = new Headers(request.headers);
        newHeaders.set('X-User-Id', String(userId));

        const newRequest = new Request(request, { headers: newHeaders });
        return forwardRequest(newRequest, env);
      } catch {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return forwardRequest(request, env);
  },
};

async function forwardRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const backendUrl = env.WORKER_BACKEND_URL + url.pathname + url.search;
  return fetch(backendUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}

interface Env {
  JWT_SECRET: string;
  WORKER_BACKEND_URL: string;
}