/* eslint-disable @typescript-eslint/no-explicit-any,no-console */
// 💡 終極大結局：強制所有圖片網址直出，徹底摧毀壞掉的延遲載入機制，首頁搜尋頁全亮大復活！

export function getDoubanImagePath(url: string | null | undefined): string {
  if (!url) return '';
  // 萬能直通車：不管誰來抓，通通直接回傳 weserv 解鎖後的原始海報，不給占位圖任何機會
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}

export function processImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}

export function getDoubanImageProxyConfig() {
  return {
    proxyType: 'custom',
    proxyUrl: 'https://images.weserv.nl/?url=',
  };
}

export function cleanHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

export function getVideoResolutionFromM3u8(m3u8Content: string): any {
  if (!m3u8Content) return null;
  try {
    const lines = m3u8Content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('RESOLUTION=')) {
        const match = lines[i].match(/RESOLUTION=(\d+)x(\d+)/);
        if (match) {
          return {
            width: parseInt(match[1], 10),
            height: parseInt(match[2], 10),
            quality: 'Auto',
            loadSpeed: '0 KB/s',
            pingTime: 0
          } as any;
        }
      }
    }
  } catch (e) {
    console.error('解析 M3U8 失败:', e);
  }
  return {
    width: 0,
    height: 0,
    quality: 'Unknown',
    loadSpeed: '0 KB/s',
    pingTime: 0
  } as any;
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
