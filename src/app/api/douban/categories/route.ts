import { NextResponse } from 'next/server';

import { getCacheTime } from '@/lib/config';
import { DoubanItem, DoubanResult } from '@/lib/types';

export const runtime = 'edge';

function formatDoubanImageUrl(url?: string): string {
  if (!url) return '';
  return url.replace(
    /https?:\/\/[a-z0-9]+\.doubanio\.com/g,
    'https://douban-proxy.ludaoxous.workers.dev'
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kind = searchParams.get('kind') || 'movie';
  const type = searchParams.get('type') || '';
  const genres = searchParams.get('genres') || '';
  const year = searchParams.get('year') || '';
  const limit = parseInt(searchParams.get('limit') || '25');
  const start = parseInt(searchParams.get('start') || '0');

  // 對應地區標籤
  const regionMap: Record<string, string> = {
    tv_domestic: '华语',
    tv_american: '欧美',
    tv_japanese: '日本',
    tv_korean: '韩国',
    tv_animation: '动画',
    tv_documentary: '纪录片',
    show_domestic: '国内',
    show_foreign: '国外',
  };

  const tags: string[] = [];
  if (kind === 'tv') tags.push('电视剧');
  if (kind === 'movie') tags.push('电影');

  if (regionMap[type]) {
    tags.push(regionMap[type]);
  } else if (type && !['tv', 'show', '全部'].includes(type)) {
    tags.push(type);
  }

  if (genres && genres !== '全部') {
    tags.push(genres);
  }

  // 年份區間處理
  let yearRange = '';
  if (year && year !== '全部') {
    if (year === '2020年代') yearRange = '2020,2029';
    else if (year === '2010年代') yearRange = '2010,2019';
    else if (year === '更早') yearRange = '1900,2009';
    else yearRange = `${year},${year}`;
  }

  const tagQuery = encodeURIComponent(tags.join(','));
  let target = `https://movie.douban.com/j/new_search_subjects?sort=U&range=0,10&tags=${tagQuery}&start=${start}&limit=${limit}`;

  if (yearRange) {
    target += `&year_range=${encodeURIComponent(yearRange)}`;
  }

  try {
    const response = await fetch(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        Referer: 'https://movie.douban.com/explore',
        Accept: 'application/json, text/plain, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`豆瓣接口请求失败: ${response.status}`);
    }

    const data = await response.json();
    const rawList = data.data || [];

    const list: DoubanItem[] = rawList.map((item: any) => ({
      id: item.id,
      title: item.title,
      poster: formatDoubanImageUrl(item.cover),
      rate: item.rate || '',
      year: item.year || '',
    }));

    const result: DoubanResult = {
      code: 200,
      message: '获取成功',
      list,
    };

    const cacheTime = await getCacheTime();
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': `public, max-age=${cacheTime}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取分类数据失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
