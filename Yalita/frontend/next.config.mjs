/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@yalita/shared"],
  experimental: {
    optimizePackageImports: ["framer-motion", "@privy-io/react-auth"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Evita timeout de Google Fonts en el servidor de build
  optimizeFonts: false,
  // No romper el build de Vercel por warnings de ESLint
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
