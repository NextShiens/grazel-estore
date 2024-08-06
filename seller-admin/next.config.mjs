/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://api.grazle.co.in/api";
const nextConfig = {
  images: {
    // domains: [API_URL],
    domains: ["api.grazle.co.in","via.placeholder.com"],
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  // async rewrites() {
  //   return [
  //     {
  //       source: "/:path*",
  //       destination: `${API_URL}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
