/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/modules"],
  async rewrites() {
    // Proxy /api-proxy/* → actual API backend (server-side, no CORS)
    // API_TARGET_URL takes priority; fall back to NEXT_PUBLIC_API_URL (likely
    // already set in Vercel to the production API), then localhost for dev.
    const target =
      process.env.API_TARGET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3333';
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${target}/:path*`,
      },
    ];
  },
}

export default nextConfig
