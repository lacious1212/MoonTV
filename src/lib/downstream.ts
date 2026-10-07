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
  return url.replace(/https?:\/\/[a-z0-9]+\.doubanio\.com/g, 'https://douban-proxy.ludaoxous.workers.dev');
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
    const apiUrl =
      apiBaseUrl + API_CONFIG.search.path + encodeURIComponent(query);
    const apiName = apiSite.name;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(apiUrl, {
      headers: API_CONFIG.search.headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (
      !data ||
      !data.list ||
      !Array.isArray(data.list) ||
      data.list.length === 0
    ) {
      return [];
    }

    return data.list.map((item: ApiSearchItem) => {
      const episodes = parseM3u8Links(item.vod_play_url);

      return {
        id: item.vod_id.toString(),
        title: item.vod_name.trim().replace(/\s+/g, ' '),
        poster: formatPosterUrl(item.vod_pic),
        episodes,
        source: apiSite.key,
        source_name: apiName,
        class: item.vod_class,
        year: item.vod_year
          ? item.vod_year.match(/\d{4}/)?.[0] || ''
          : 'unknown',
        desc: cleanHtmlTags(item.vod_content || ''),
        type_name: item.type_name,
        douban_id: item.vod_douban_id,
      };
    });
  } catch (error) {
    return [];
  }
}

export async function getDetailFromApi(
  apiSite: ApiSite,
  id: string
): Promise<SearchResult> {
  const detailUrl = `${apiSite.api}${API_CONFIG.detail.path}${id}`;

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
