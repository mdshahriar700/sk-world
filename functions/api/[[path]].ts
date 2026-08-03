import { handleApiRequest } from '../../src/lib/api-controller';

export async function onRequest(context: { request: Request; env: any }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  // Extract query parameters as Record<string, string>
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  // Extract headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Extract JSON body for POST/PUT/PATCH
  let body: any = {};
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const { status, data } = await handleApiRequest(url.pathname, method, body, query, headers, env);

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
