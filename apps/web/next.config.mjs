/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/modules"],
  async rewrites() {
    // Proxy /api-proxy/* → actual API backend (server-side, no CORS)
    const target = process.env.API_TARGET_URL || 'http://localhost:3333';
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${target}/:path*`,
      },
    ];
  },
}

export default nextConfig
