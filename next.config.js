/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    dirs: ['src'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img1.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'img2.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'img3.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'img9.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/zh',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.douban.com/v2/:path*',
      },
    ];
  },
  // 💡 終極防護罩：強制 Webpack 在前端打包時跳過後端 Node.js 核心模組，徹底解決 crypto 和 tls 錯誤！
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        tls: false,
        net: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
