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
  // No romper el build por errores de ESLint o TypeScript en CI
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
