/* eslint-disable @typescript-eslint/no-explicit-any */
// 💡 終極大閹割：直接拔掉真實的 redis 引用，徹底根除 crypto、tls、net 報錯！

export function getRedisClient() {
  console.log('Redis client disabled for Vercel Edge build safety.');
  return null;
}

export const redis = null;

const mockRedis = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
};

export default mockRedis;
