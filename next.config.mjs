/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Enables the optimized build
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  serverExternalPackages: ["encoding"],
};

export default nextConfig;
