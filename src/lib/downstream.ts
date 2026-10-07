import { API_CONFIG, ApiSite } from '@/lib/config';
import { SearchResult } from '@/lib/types';
import { cleanHtmlTags } from '@/lib/utils';

interface ApiSearchItem {
  vod_id: string | number;
  vod_name: string;
  vod_pic: string;
  vod_remarks?: string;
  vod_play_url?: string;
  vod_class?: string;
  vod_year?: string;
  vod_content?: string;
  vod_douban_id?: number;
  type_name?: string;
}

function formatPosterUrl(url?: string): string {
  if (!url) return '';
  return url.replace(
    /https?:\/\/[a-z0-9]+\.doubanio\.com/g,
    'https://douban-proxy.ludaoxous.workers.dev'
  );
}

function parseM3u8Links(rawPlayUrl?: string): string[] {
  if (!rawPlayUrl) return [];

  const directMatches = rawPlayUrl.match(/https?:\/\/[^"'\s$#]+?\.m3u8/g);   if (directMatches && directMatches.length > 0) {     return Array.from(new Set(directMatches));   }    const episodes: string[] = [];   const groups = rawPlayUrl.split('$$$');
  for (const group of groups) {
    const list = group.split('#');
    for (const item of list) {
      const parts = item.split('$');
      const url = parts.length > 1 ? parts[1].trim() : parts[0].trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        episodes.push(url);
      }
    }
    if (episodes.length > 0) break;
  }
  return Array.from(new Set(episodes));
}

export async function searchFromApi(
  apiSite: ApiSite,
  query: string
): Promise<SearchResult[]> {
  try {
    const apiBaseUrl = apiSite.api;
    const encodedQuery = encodeURIComponent(query.trim());
    
    // 優先使用 detail 模式，若失敗則回退到標準 wd 模式
    const detailUrl = `${apiBaseUrl}?ac=detail&wd=${encodedQuery}`;
    const simpleUrl = `${apiBaseUrl}?wd=${encodedQuery}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response = await fetch(detailUrl, {
      headers: API_CONFIG.search.headers,
      signal: controller.signal,
    });

    let data = response.ok ? await response.json() : null;

    // 如果帶 ac=detail 沒搜到，嘗試純 wd 查詢
    if (!data?.list || !Array.isArray(data.list) || data.list.length === 0) {
      response = await fetch(simpleUrl, {
        headers: API_CONFIG.search.headers,
        signal: controller.signal,
      });
      data = response.ok ? await response.json() : null;
    }

    clearTimeout(timeoutId);

    if (!data?.list || !Array.isArray(data.list) || data.list.length === 0) {
      return [];
    }

    // 處理搜尋結果
    const results: SearchResult[] = [];
    for (const item of data.list as ApiSearchItem[]) {
      let episodes = parseM3u8Links(item.vod_play_url);

      // 如果當前只有基本資訊沒有播放列表，嘗試補抓一次詳情
      if (episodes.length === 0 && item.vod_id) {
        try {
          const detailRes = await fetch(`${apiBaseUrl}?ac=detail&ids=${item.vod_id}`);
          if (detailRes.ok) {
            const detailJson = await detailRes.json();
            const detailItem = detailJson?.list?.[0];
            if (detailItem?.vod_play_url) {
              episodes = parseM3u8Links(detailItem.vod_play_url);
            }
          }
        } catch (_) {
          // ignore
        }
      }

      results.push({
        id: item.vod_id.toString(),
        title: item.vod_name.trim().replace(/\s+/g, ' '),
        poster: formatPosterUrl(item.vod_pic),
        episodes,
        source: apiSite.key,
        source_name: apiSite.name,
        class: item.vod_class,
        year: item.vod_year
          ? item.vod_year.match(/\d{4}/)?.[0] || ''
          : 'unknown',
        desc: cleanHtmlTags(item.vod_content || ''),
        type_name: item.type_name,
        douban_id: item.vod_douban_id,
      });
    }

    return results;
  } catch (error) {
    return [];
  }
}

export async function getDetailFromApi(
  apiSite: ApiSite,
  id: string
): Promise<SearchResult> {
  const detailUrl = `${apiSite.api}?ac=detail&ids=${id}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const response = await fetch(detailUrl, {
    headers: API_CONFIG.detail.headers,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`详情请求失败: ${response.status}`);
  }

  const data = await response.json();

  if (
    !data ||
    !data.list ||
    !Array.isArray(data.list) ||
    data.list.length === 0
  ) {
    throw new Error('获取到的详情内容无效');
  }

  const videoDetail = data.list[0];
  let episodes = parseM3u8Links(videoDetail.vod_play_url);

  if (episodes.length === 0 && videoDetail.vod_content) {
    episodes = parseM3u8Links(videoDetail.vod_content);
  }

  return {
    id: id.toString(),
    title: videoDetail.vod_name,
    poster: formatPosterUrl(videoDetail.vod_pic),
    episodes,
    source: apiSite.key,
    source_name: apiSite.name,
    class: videoDetail.vod_class,
    year: videoDetail.vod_year
      ? videoDetail.vod_year.match(/\d{4}/)?.[0] || ''
      : 'unknown',
    desc: cleanHtmlTags(videoDetail.vod_content),
    type_name: videoDetail.type_name,
    douban_id: videoDetail.vod_douban_id,
  };
}
