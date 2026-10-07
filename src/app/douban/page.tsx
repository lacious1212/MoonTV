/* eslint-disable no-console,react-hooks/exhaustive-deps */

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { getDoubanCategories } from '@/lib/douban.client';
import { DoubanItem } from '@/lib/types';

import DoubanCardSkeleton from '@/components/DoubanCardSkeleton';
import DoubanSelector from '@/components/DoubanSelector';
import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';

function DoubanPageClient() {
  const searchParams = useSearchParams();
  const [doubanData, setDoubanData] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectorsReady, setSelectorsReady] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const type = searchParams.get('type') || 'movie';

  // 选择器状态
  const [primarySelection, setPrimarySelection] = useState<string>(() => {
    return type === 'movie' ? '热门' : '';
  });
  const [secondarySelection, setSecondarySelection] = useState<string>(() => {
    if (type === 'movie') return '全部';
    if (type === 'tv') return 'tv';
    if (type === 'show') return 'show';
    return '全部';
  });

  // 新增：题材与年份状态
  const [genreSelection, setGenreSelection] = useState<string>('全部');
  const [yearSelection, setYearSelection] = useState<string>('全部');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectorsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectorsReady(false);
    setLoading(true);
  }, [type]);

  useEffect(() => {
    if (type === 'movie') {
      setPrimarySelection('热门');
      setSecondarySelection('全部');
    } else if (type === 'tv') {
      setPrimarySelection('');
      setSecondarySelection('tv');
    } else if (type === 'show') {
      setPrimarySelection('');
      setSecondarySelection('show');
    } else {
      setPrimarySelection('');
      setSecondarySelection('全部');
    }
    setGenreSelection('全部');
    setYearSelection('全部');

    const timer = setTimeout(() => {
      setSelectorsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [type]);

  const skeletonData = Array.from({ length: 25 }, (_, index) => index);

  // 组装 API 请求参数
  const getRequestParams = useCallback(
    (pageStart: number) => {
      const baseParams: any = {
        pageLimit: 25,
        pageStart,
      };

      if (genreSelection && genreSelection !== '全部') {
        baseParams.genres = genreSelection;
      }
      if (yearSelection && yearSelection !== '全部') {
        baseParams.year = yearSelection;
      }

      if (type === 'tv' || type === 'show') {
        return {
          ...baseParams,
          kind: 'tv' as const,
          category: type,
          type: secondarySelection,
        };
      }

      return {
        ...baseParams,
        kind: type as 'tv' | 'movie',
        category: primarySelection,
        type: secondarySelection,
      };
    },
    [type, primarySelection, secondarySelection, genreSelection, yearSelection]
  );

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDoubanCategories(getRequestParams(0));

      if (data.code === 200) {
        setDoubanData(data.list);
        setHasMore(data.list.length === 25);
        setLoading(false);
      } else {
        throw new Error(data.message || '获取数据失败');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [type, primarySelection, secondarySelection, genreSelection, yearSelection, getRequestParams]);

  useEffect(() => {
    if (!selectorsReady) {
      return;
    }

    setDoubanData([]);
    setCurrentPage(0);
    setHasMore(true);
    setIsLoadingMore(false);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      loadInitialData();
    }, 100);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    selectorsReady,
    type,
    primarySelection,
    secondarySelection,
    genreSelection,
    yearSelection,
    loadInitialData,
  ]);

  useEffect(() => {
    if (currentPage > 0) {
      const fetchMoreData = async () => {
        try {
          setIsLoadingMore(true);

          const data = await getDoubanCategories(
            getRequestParams(currentPage * 25)
          );

          if (data.code === 200) {
            setDoubanData((prev) => [...prev, ...data.list]);
            setHasMore(data.list.length === 25);
          } else {
            throw new Error(data.message || '获取数据失败');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingMore(false);
        }
      };

      fetchMoreData();
    }
  }, [currentPage, type, primarySelection, secondarySelection, genreSelection, yearSelection]);

  useEffect(() => {
    if (!hasMore || isLoadingMore || loading) {
      return;
    }

    if (!loadingRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loading]);

  const handlePrimaryChange = useCallback(
    (value: string) => {
      if (value !== primarySelection) {
        setLoading(true);
        setPrimarySelection(value);
      }
    },
    [primarySelection]
  );

  const handleSecondaryChange = useCallback(
    (value: string) => {
      if (value !== secondarySelection) {
        setLoading(true);
        setSecondarySelection(value);
      }
    },
    [secondarySelection]
  );

  const handleGenreChange = useCallback(
    (value: string) => {
      if (value !== genreSelection) {
        setLoading(true);
        setGenreSelection(value);
      }
    },
    [genreSelection]
  );

  const handleYearChange = useCallback(
    (value: string) => {
      if (value !== yearSelection) {
        setLoading(true);
        setYearSelection(value);
      }
    },
    [yearSelection]
  );

  const getPageTitle = () => {
    return type === 'movie' ? '电影' : type === 'tv' ? '电视剧' : '综艺';
  };

  const getActivePath = () => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);

    const queryString = params.toString();
    return `/douban${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <PageLayout activePath={getActivePath()}>
      <div className='px-4 sm:px-10 py-4 sm:py-8 overflow-visible'>
        <div className='mb-6 sm:mb-8 space-y-4 sm:space-y-6'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 dark:text-gray-200'>
              {getPageTitle()}
            </h1>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              来自豆瓣的精选内容
            </p>
          </div>

          <div className='bg-white/60 dark:bg-gray-800/40 rounded-2xl p-4 sm:p-6 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm'>
            <DoubanSelector
              type={type as 'movie' | 'tv' | 'show'}
              primarySelection={primarySelection}
              secondarySelection={secondarySelection}
              genreSelection={genreSelection}
              yearSelection={yearSelection}
              onPrimaryChange={handlePrimaryChange}
              onSecondaryChange={handleSecondaryChange}
              onGenreChange={handleGenreChange}
              onYearChange={handleYearChange}
            />
          </div>
        </div>

        <div className='max-w-[95%] mx-auto mt-8 overflow-visible'>
          <div className='grid grid-cols-3 gap-x-2 gap-y-12 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:gap-x-8 sm:gap-y-20'>
            {loading || !selectorsReady
              ? skeletonData.map((index) => <DoubanCardSkeleton key={index} />)
              : doubanData.map((item, index) => (
                  <div key={`${item.title}-${index}`} className='w-full'>
                    <VideoCard
                      from='douban'
                      title={item.title}
                      poster={item.poster}
                      douban_id={item.id}
                      rate={item.rate}
                      year={item.year}
                      type={type === 'movie' ? 'movie' : ''}
                    />
                  </div>
                ))}
          </div>

          {hasMore && !loading && (
            <div
              ref={(el) => {
                if (el && el.offsetParent !== null) {
                  (
                    loadingRef as React.MutableRefObject<HTMLDivElement | null>
                  ).current = el;
                }
              }}
              className='flex justify-center mt-12 py-8'
            >
              {isLoadingMore && (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-green-500'></div>
                  <span className='text-gray-600'>加载中...</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && doubanData.length > 0 && (
            <div className='text-center text-gray-500 py-8'>已加载全部内容</div>
          )}

          {!loading && doubanData.length === 0 && (
            <div className='text-center text-gray-500 py-8'>暂无相关内容</div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default function DoubanPage() {
  return (
    <Suspense>
      <DoubanPageClient />
    </Suspense>
  );
}
