/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "assets.aceternity.com",
      },
      {
        hostname: "files.edgestore.dev",
      },
      { hostname: "utfs.io" },
      { hostname: "api.microlink.io" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["ably"],
  },
};

export default nextConfig;
