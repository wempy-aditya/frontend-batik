/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Enables the optimized build
  env: {
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
};

export default nextConfig;
