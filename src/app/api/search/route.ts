import { NextResponse } from 'next/server';

import { getAvailableApiSites, getCacheTime } from '@/lib/config';
import { searchFromApi } from '@/lib/downstream';
import { SearchResult } from '@/lib/types';

export const runtime = 'edge';

// 影視常見繁簡映射庫（成對字符，保證零重複、支援簡繁交替）
const T_CHARS =
  '開難無間春晴朗愛寶貝國華麗劇集動漫電影視頻樂歡喜傳奇說話戰爭鬥門關連續風雲龍鳳飛天地長生夢見機器變形金剛復仇聯盟俠義神仙劍問道絕代雙驕倚屠記錄尋秦漢唐宋明清宮鎖心玉珠環書體熱門點評推薦網衛視綜藝科幻懸疑愛情喜劇動作恐怖古裝武俠歷史冒險罪案紀錄片';
const S_CHARS =
  '开难无间春晴朗爱宝贝国华丽剧集动漫电影视频乐欢喜传奇说话战争斗门关连续风云龙凤飞天地长生梦见机器变形金刚复仇联盟侠义神仙剑问道绝代双骄倚屠记录寻秦汉唐宋明清宫锁心玉珠环书体热门点评推荐网卫视综艺科幻悬疑爱情喜剧动作恐怖古装武侠历史冒险罪案纪录片';

// 逐字轉換函式：若字在繁體庫中就轉為簡體，否則保留原字
function convertToSimplified(text: string): string {
  return text
    .split('')
    .map((char) => {
      const idx = T_CHARS.indexOf(char);
      return idx !== -1 ? S_CHARS[idx] : char;
    })
    .join('');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q');

  if (!rawQuery) {
    const cacheTime = await getCacheTime();
    return NextResponse.json(
      { results: [] },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}`,
        },
      }
    );
  }

  const trimmedQuery = rawQuery.trim();
  const simplifiedQuery = convertToSimplified(trimmedQuery);

  // 同時搜尋「原始輸入」與「轉簡體後」，自動去重
  const queriesToSearch = Array.from(
    new Set([trimmedQuery, simplifiedQuery].filter(Boolean))
  );

  const apiSites = await getAvailableApiSites();

  try {
    const searchTasks = queriesToSearch.flatMap((q) =>
      apiSites.map((site) => searchFromApi(site, q))
    );

    const rawResults = await Promise.all(searchTasks);
    const flattenedResults = rawResults.flat();

    // 依據 source + id 去重
    const seen = new Set<string>();
    const deduplicatedResults: SearchResult[] = [];

    for (const item of flattenedResults) {
      const key = `${item.source}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicatedResults.push(item);
      }
    }

    const cacheTime = await getCacheTime();

    return NextResponse.json(
      { results: deduplicatedResults },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
