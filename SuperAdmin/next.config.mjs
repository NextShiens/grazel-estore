/** @type {import('next').NextConfig} */
// const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const nextConfig = {
  // experimental: {
  //   missingSuspenseWithCSRBailout: false,
  // },
  images: {
    // domains: [API_URL],
    domains: ["api.grazle.co.in"],
  },

  // output: "export",
  // swcMinify: true,
  // productionBrowserSourceMaps: false,
  // optimizeFonts: false,
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
