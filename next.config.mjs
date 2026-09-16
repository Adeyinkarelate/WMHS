/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
    serverComponentsExternalPackages: [
      "@neondatabase/serverless",
      "@prisma/adapter-neon",
      "ws",
      "zod",
      "bcryptjs",
      "cloudinary",
    ],
  },
  transpilePackages: ["leaflet"],
  // Next 14 on Windows can drop `.next/server/vendor-chunks` during HMR when
  // two compiles race (register → NextAuth). Keep server deps in one bundle.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
