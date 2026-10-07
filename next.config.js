/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    dirs: ['src'],
  },
  experimental: {
    serverExternalPackages: ['@redis/client', 'redis'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.doubanio.com' },
      { protocol: 'https', hostname: 'img1.doubanio.com' },
      { protocol: 'https', hostname: 'img2.doubanio.com' },
      { protocol: 'https', hostname: 'img3.doubanio.com' },
      { protocol: 'https', hostname: 'img9.doubanio.com' },
      { protocol: 'https', hostname: 'images.weserv.nl' },
      { protocol: 'https', hostname: 'douban-proxy.ludaoxous.workers.dev' },
    ],
    // 讓 Cloudflare Pages 直接輸出原始圖片網址，不走 Next.js 優化引擎
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.douban.com/v2/:path*',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        crypto: false,
        fs: false,
        path: false,
        stream: false,
        os: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
