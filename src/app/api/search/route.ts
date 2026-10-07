import { NextResponse } from 'next/server';

import { getAvailableApiSites, getCacheTime } from '@/lib/config';
import { searchFromApi } from '@/lib/downstream';
import { SearchResult } from '@/lib/types';

export const runtime = 'edge';

// 常用影視繁簡對照表（涵蓋高頻字與混合輸入）
const T2S_MAP: Record<string, string> = {
  '開': '开', '端': '端', '難': '难', '哄': '哄', '無': '无', '間': '间',
  '春': '春', '晴': '晴', '朗': '朗', '愛': '爱', '寶': '宝', '貝': '贝',
  '國': '国', '華': '华', '麗': '丽', '劇': '剧', '集': '集', '動': '动',
  '漫': '漫', '電': '电', '影': '影', '視': '视', '頻': '频', '樂': '乐',
  '歡': '欢', '喜': '喜', '傳': '传', '奇': '奇', '說': '说', '話': '话',
  '戰': '战', '爭': '争', '鬥': '斗', '門': '门', '關': '关', '連': '连',
  '續': '续', '風': '风', '雲': '云', '龍': '龙', '鳳': '凤', '飛': '飞',
  '天': '天', '地': '地', '長': '长', '生': '生', '夢': '梦', '見': '见',
  '機': '机', '器': '器', '變': '变', '形': '形', '金': '金', '剛': '刚',
  '復': '复', '仇': '仇', '聯': '联', '盟': '盟', '俠': '侠', '義': '义',
  '神': '神', '話': '话', '仙': '仙', '劍': '剑', '問': '问', '道': '道',
  '絕': '绝', '代': '代', '雙': '双', '驕': '骄', '倚': '倚', '屠': '屠',
  '記': '记', '錄': '录', '尋': '寻', '秦': '秦', '漢': '汉', '唐': '唐',
  '宋': '宋', '明': '明', '清': '清', '宮': '宫', '鎖': '锁', '心': '心',
  '玉': '玉', '珠': '珠', '環': '环', '傳': '传', '說': '说', '書': '书',
};

// 逐字轉簡體函式（即使簡繁交替也能逐一替換）
function convertToSimplified(text: string): string {
  return text
    .split('')
    .map((char) => T2S_MAP[char] || char)
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

  // 整理要搜尋的關鍵字清單（若轉簡後不同，則兩個都搜）
  const queriesToSearch = Array.from(
    new Set([trimmedQuery, simplifiedQuery].filter(Boolean))
  );

  const apiSites = await getAvailableApiSites();

  try {
    // 同時對所有站點以原始及轉簡後的關鍵字檢索
    const searchTasks = queriesToSearch.flatMap((q) =>
      apiSites.map((site) => searchFromApi(site, q))
    );

    const rawResults = await Promise.all(searchTasks);
    const flattenedResults = rawResults.flat();

    // 依照 source + id 進行去重
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
