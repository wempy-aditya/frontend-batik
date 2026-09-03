/** @type {import('next').NextConfig} */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

const nextConfig = {
  output: "standalone",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    NEXT_PUBLIC_RVGAN_API_URL:
      process.env.NEXT_PUBLIC_RVGAN_API_URL || "http://localhost:5000",
    NEXT_PUBLIC_BATIKGAN_API_URL:
      process.env.NEXT_PUBLIC_BATIKGAN_API_URL || "http://localhost:5001",
    NEXT_PUBLIC_CLASSIFY_API_URL:
      process.env.NEXT_PUBLIC_CLASSIFY_API_URL || "http://localhost:5002",
    NEXT_PUBLIC_RETRIEVAL_API_URL:
      process.env.NEXT_PUBLIC_RETRIEVAL_API_URL || "http://localhost:5003",
  },
  serverExternalPackages: ["encoding"],
  async rewrites() {
    // Proxy server-side ke service rispro di IP lokal (bypass CORS/mixed-content)
    // Request /api/rispro/<port>/<path> → http://192.168.14.245:<port>/<path>
    const targets = [9003,9004,9005,9006,9007,9009,9010,9011,9105,9106,9203,9204,9207,8002,8004,8006,8007];
    return targets.map(port => ({
      source: `/api/rispro/${port}/:path*`,
      destination: `http://192.168.14.245:${port}/:path*`,
    }));
  },
};

export default nextConfig;
