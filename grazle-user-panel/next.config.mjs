/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://api.grazle.co.in/api";
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/payment-response',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://secure.ccavenue.com',
          },
        ],
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["api.grazle.co.in"],
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['secure.ccavenue.com', 'grazle.co.in'],
    },
  },
};

export default nextConfig;