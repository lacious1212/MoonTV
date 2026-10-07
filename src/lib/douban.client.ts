import { DoubanItem, DoubanResult } from './types';

export interface DoubanCategoriesParams {
  kind: 'tv' | 'movie';
  category: string;
  type: string;
  genres?: string;
  year?: string;
  pageLimit?: number;
  pageStart?: number;
}

interface DoubanCategoryApiResponse {
  total: number;
  items: Array<{
    id: string;
    title: string;
    card_subtitle: string;
    pic: {
      large: string;
      normal: string;
    };
    rating: {
      value: number;
    };
  }>;
}

function formatDoubanImageUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/https?:\/\/[a-z0-9]+\.doubanio\.com/g, 'https://douban-proxy.ludaoxous.workers.dev');
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const proxyUrl = getDoubanProxyUrl();
  const finalUrl = proxyUrl ? `${proxyUrl}${encodeURIComponent(url)}` : url;

  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Referer: 'https://movie.douban.com/',
      Accept: 'application/json, text/plain, */*',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(finalUrl, fetchOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export function getDoubanProxyUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const doubanProxyUrl = localStorage.getItem('doubanProxyUrl');
  return doubanProxyUrl && doubanProxyUrl.trim() ? doubanProxyUrl.trim() : null;
}

export function shouldUseDoubanClient(): boolean {
  return getDoubanProxyUrl() !== null;
}

export async function fetchDoubanCategories(
  params: DoubanCategoriesParams
): Promise<DoubanResult> {
  const { kind, category, type, genres, year, pageLimit = 20, pageStart = 0 } = params;

  if (!['tv', 'movie'].includes(kind)) {
    throw new Error('kind 参数必须是 tv 或 movie');
  }

  let target = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${kind}?start=${pageStart}&limit=${pageLimit}&category=${category}&type=${type}`;
  if (genres && genres !== '全部') {
    target += `&genres=${encodeURIComponent(genres)}`;
  }
  if (year && year !== '全部') {
    target += `&year_range=${encodeURIComponent(`${year},${year}`)}`;
  }

  try {
    const response = await fetchWithTimeout(target);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const doubanData: DoubanCategoryApiResponse = await response.json();

    const list: DoubanItem[] = (doubanData.items || []).map((item) => ({
      id: item.id,
      title: item.title,
      poster: formatDoubanImageUrl(item.pic?.normal || item.pic?.large || ''),
      rate: item.rating?.value ? item.rating.value.toFixed(1) : '',
      year: item.card_subtitle?.match(/(\d{4})/)?.[1] || '',
    }));

    return {
      code: 200,
      message: '获取成功',
      list: list,
    };
  } catch (error) {
    throw new Error(`获取豆瓣分类数据失败: ${(error as Error).message}`);
  }
}

export async function getDoubanCategories(
  params: DoubanCategoriesParams
): Promise<DoubanResult> {
  if (shouldUseDoubanClient()) {
    return fetchDoubanCategories(params);
  } else {
    const { kind, category, type, genres, year, pageLimit = 20, pageStart = 0 } = params;
    let url = `/api/douban/categories?kind=${kind}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}&limit=${pageLimit}&start=${pageStart}`;
    
    if (genres && genres !== '全部') {
      url += `&genres=${encodeURIComponent(genres)}`;
    }
    if (year && year !== '全部') {
      url += `&year=${encodeURIComponent(year)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('获取豆瓣分类数据失败');
    }

    const result: DoubanResult = await response.json();
    if (result && Array.isArray(result.list)) {
      result.list = result.list.map((item) => ({
        ...item,
        poster: formatDoubanImageUrl(item.poster),
      }));
    }

    return result;
  }
}
