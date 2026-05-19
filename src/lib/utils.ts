/* eslint-disable @typescript-eslint/no-explicit-any,no-console */
import he from 'he';
import { Hls } from 'hls.js';

// 💡 暴力銲死：不管前端怎麼判定，所有的圖片網址一律強制走最穩定的 weserv 轉發服務！
export function getDoubanImagePath(url: string | null | undefined): string {
  if (!url) return '';
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}

// 為了不讓專案其他地方報錯，保留原本的函式結構，但內部全部轉向 weserv
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
  let text = html.replace(/<[^>]*>/g, '');
  text = he.decode(text);
  return text.trim();
}

export function isHlsSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Hls.isSupported() || !!document.createElement('video').canPlayType('application/vnd.apple.mpegurl');
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
