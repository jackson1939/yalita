/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@yalita/shared"],
  experimental: {
    optimizePackageImports: ["framer-motion", "@privy-io/react-auth"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
