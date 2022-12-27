/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  distDir: "build",
  images: {
    domains: ["localhost", "13.124.162.22"], // <-- ec2 java server ip
  },
};

module.exports = nextConfig;
