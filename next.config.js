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
  // 💡 下面這段就是我們加進去的安全通道設定
  env: {
    NEXT_PUBLIC_DOUBAN_PROXY_TYPE: 'cors-proxy-zwei',
    NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE: 'cmliussss-cdn-tencent',
  },
};

module.exports = nextConfig;
