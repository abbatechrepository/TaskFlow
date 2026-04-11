/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/taskflow',
  assetPrefix: '/taskflow',
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
