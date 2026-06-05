import { NextRequest, NextResponse } from 'next/server';

// Read at runtime (server-side), not baked at build time like client bundles.
// Falls back to localhost for local dev.
const BACKEND =
  (process.env.NEXT_PUBLIC_API_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_API_URL
    : null) ?? 'http://localhost:3333';

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const target = `${BACKEND}/${path.join('/')}${req.nextUrl.search}`;

  // Forward all headers except 'host' (would confuse the upstream server)
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key !== 'host') headers[key] = value;
  });

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, { method: req.method, headers, body });
  } catch (err) {
    return NextResponse.json(
      { message: 'Proxy could not reach API', target, error: String(err) },
      { status: 502 },
    );
  }

  // Forward response headers except ones that conflict with Next.js streaming
  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key)) {
      resHeaders.set(key, value);
    }
  });

  const resBody = await upstream.arrayBuffer();
  return new NextResponse(resBody, { status: upstream.status, headers: resHeaders });
}

// Export a handler for every HTTP method the API uses
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function OPTIONS(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
