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
    // domains: [API_URL],
    domains: ["api.grazle.co.in"],
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  // async rewrites() {
  //   return [
  //     // {
  //     //   source: "/detailProduct",
  //     //   destination: `${API_URL}/detailProduct`,
  //     // },
  //     {
  //       source: "/:path*",
  //       destination: `${API_URL}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
