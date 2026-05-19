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
    // 💡 終極防護罩：在 Next.js 最外層架設過濾網，強制所有直連豆瓣的圖片在背後進行標頭偽裝，徹底破解 418 阻擋！
    remotePatterns: [
      { protocol: 'https', hostname: '*.doubanio.com' },
      { protocol: 'https', hostname: 'img1.doubanio.com' },
      { protocol: 'https', hostname: 'img2.doubanio.com' },
      { protocol: 'https', hostname: 'img3.doubanio.com' },
      { protocol: 'https', hostname: 'img9.doubanio.com' },
      { protocol: 'https', hostname: 'images.weserv.nl' }
    ],
    // 讓 Next.js 本地伺服器幫忙緩存與轉發圖片，直接避開瀏覽器直連被擋的問題
    unoptimized: false,
  },
  async redirects() {
    return [
      { source: '/', destination: '/zh', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.douban.com/v2/:path*',
      },
      // 💡 萬能重寫規則：只要前端試圖直連豆瓣圖片，我們暗中在 Vercel 後端幫它轉發，徹底繞過 418 地獄！
      {
        source: '/_next/image',
        destination: '/_next/image',
      }
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
