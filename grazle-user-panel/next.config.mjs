/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const nextConfig = {
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
