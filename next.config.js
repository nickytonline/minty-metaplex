/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['media.giphy.com', 'www.arweave.net'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };

    return config;
  },
};
