/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DOUBAN_PROXY_TYPE: 'cors-proxy-zwei',
    NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE: 'cmliussss-cdn-tencent',
  },
};

module.exports = nextConfig;
