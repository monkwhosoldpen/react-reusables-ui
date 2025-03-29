/** @type {import('next').NextConfig} */
const nextConfig = {
  // StrictMode causes components to render twice in development to catch bugs
  // This can cause duplicate API calls - if this is an issue during development,
  // you can temporarily set this to false
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  // Ensure service worker can be properly registered
  // async headers() {
  //   return [
  //     {
  //       source: '/sw.js',
  //       headers: [
  //         {
  //           key: 'Service-Worker-Allowed',
  //           value: '/',
  //         },
  //         {
  //           key: 'Content-Type',
  //           value: 'application/javascript',
  //         },
  //       ],
  //     }
  //   ];
  // },
};

module.exports = nextConfig;
