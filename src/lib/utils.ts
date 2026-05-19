/* eslint-disable @typescript-eslint/no-explicit-any,no-console */
// 💡 終極無毒版：直接拔掉 he 和 hls.js 的頂層 import，用最底層寫法繞過 Vercel 報錯！

export function getDoubanImagePath(url: string | null | undefined): string {
  if (!url) return '';
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}

export function getDoubanImageProxyConfig() {
  return {
    proxyType: 'custom',
    proxyUrl: 'https://images.weserv.nl/?url=',
  };
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;

  if (h > 0) {
    const hh = h < 10 ? `0${h}` : `${h}`;
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function cleanHtml(html: string): string {
  if (!html) return '';
  // 不使用 he 套件，改用純正則表達式把標籤擦乾淨
  let text = html.replace(/<[^>]*>/g, '');
  // 簡易手動取代常見的 HTML 實體符號，完全避開外部套件依賴
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text.trim();
}

export function isHlsSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // 避開頂層 import，改用 window 動態檢查或 Hls 核心判斷
  const globalHls = (window as any).Hls;
  return !!(globalHls?.isSupported() || document.createElement('video').canPlayType('application/vnd.apple.mpegurl'));
}

export function getErrorMessage(error: any): string {
  if (!error) return '未知错误';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
