/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SelectorOption {
  label: string;
  value: string;
}

interface DoubanSelectorProps {
  type: 'movie' | 'tv' | 'show';
  primarySelection?: string;
  secondarySelection?: string;
  genreSelection?: string;
  yearSelection?: string;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
  onGenreChange?: (value: string) => void;
  onYearChange?: (value: string) => void;
}

const DoubanSelector: React.FC<DoubanSelectorProps> = ({
  type,
  primarySelection,
  secondarySelection,
  genreSelection = '全部',
  yearSelection = '全部',
  onPrimaryChange,
  onSecondaryChange,
  onGenreChange,
  onYearChange,
}) => {
  const primaryContainerRef = useRef<HTMLDivElement>(null);
  const primaryButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [primaryIndicatorStyle, setPrimaryIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const secondaryContainerRef = useRef<HTMLDivElement>(null);
  const secondaryButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [secondaryIndicatorStyle, setSecondaryIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const genreContainerRef = useRef<HTMLDivElement>(null);
  const genreButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [genreIndicatorStyle, setGenreIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const yearContainerRef = useRef<HTMLDivElement>(null);
  const yearButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [yearIndicatorStyle, setYearIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  // 电影的一级选择器
  const moviePrimaryOptions: SelectorOption[] = [
    { label: '热门电影', value: '热门' },
    { label: '最新电影', value: '最新' },
    { label: '豆瓣高分', value: '豆瓣高分' },
    { label: '冷门佳片', value: '冷门佳片' },
  ];

  // 电影地区
  const movieSecondaryOptions: SelectorOption[] = [
    { label: '全部', value: '全部' },
    { label: '华语', value: '华语' },
    { label: '欧美', value: '欧美' },
    { label: '韩国', value: '韩国' },
    { label: '日本', value: '日本' },
  ];

  // 电视剧地区 / 类别
  const tvOptions: SelectorOption[] = [
    { label: '全部', value: 'tv' },
    { label: '国产', value: 'tv_domestic' },
    { label: '欧美', value: 'tv_american' },
    { label: '日本', value: 'tv_japanese' },
    { label: '韩国', value: 'tv_korean' },
    { label: '动漫', value: 'tv_animation' },
    { label: '纪录片', value: 'tv_documentary' },
  ];

  // 综艺
  const showOptions: SelectorOption[] = [
    { label: '全部', value: 'show' },
    { label: '国内', value: 'show_domestic' },
    { label: '国外', value: 'show_foreign' },
  ];

  // 题材类型（支持电影和电视剧）
  const genreOptions: SelectorOption[] = [
    { label: '全部', value: '全部' },
    { label: '古装', value: '古装' },
    { label: '武侠', value: '武侠' },
    { label: '悬疑', value: '悬疑' },
    { label: '爱情', value: '爱情' },
    { label: '科幻', value: '科幻' },
    { label: '喜剧', value: '喜剧' },
    { label: '动作', value: '动作' },
    { label: '奇幻', value: '奇幻' },
    { label: '剧情', value: '剧情' },
    { label: '犯罪', value: '犯罪' },
  ];

  // 年份 / 时间
  const yearOptions: SelectorOption[] = [
    { label: '全部', value: '全部' },
    { label: '2026', value: '2026' },
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2020年代', value: '2020年代' },
    { label: '2010年代', value: '2010年代' },
    { label: '更早', value: '更早' },
  ];

  const updateIndicatorPosition = (
    activeIndex: number,
    containerRef: React.RefObject<HTMLDivElement>,
    buttonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>,
    setIndicatorStyle: React.Dispatch<
      React.SetStateAction<{ left: number; width: number }>
    >
  ) => {
    if (
      activeIndex >= 0 &&
      buttonRefs.current[activeIndex] &&
      containerRef.current
    ) {
      const timeoutId = setTimeout(() => {
        const button = buttonRefs.current[activeIndex];
        const container = containerRef.current;
        if (button && container) {
          const buttonRect = button.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          if (buttonRect.width > 0) {
            setIndicatorStyle({
              left: buttonRect.left - containerRect.left,
              width: buttonRect.width,
            });
          }
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    if (type === 'movie') {
      const activeIndex = moviePrimaryOptions.findIndex(
        (opt) =>
          opt.value === (primarySelection || moviePrimaryOptions[0].value)
      );
      updateIndicatorPosition(
        activeIndex,
        primaryContainerRef,
        primaryButtonRefs,
        setPrimaryIndicatorStyle
      );
    }

    let secondaryActiveIndex = -1;
    if (type === 'movie') {
      secondaryActiveIndex = movieSecondaryOptions.findIndex(
        (opt) =>
          opt.value === (secondarySelection || movieSecondaryOptions[0].value)
      );
    } else if (type === 'tv') {
      secondaryActiveIndex = tvOptions.findIndex(
        (opt) => opt.value === (secondarySelection || tvOptions[0].value)
      );
    } else if (type === 'show') {
      secondaryActiveIndex = showOptions.findIndex(
        (opt) => opt.value === (secondarySelection || showOptions[0].value)
      );
    }

    if (secondaryActiveIndex >= 0) {
      updateIndicatorPosition(
        secondaryActiveIndex,
        secondaryContainerRef,
        secondaryButtonRefs,
        setSecondaryIndicatorStyle
      );
    }
  }, [type]);

  useEffect(() => {
    if (type === 'movie') {
      const activeIndex = moviePrimaryOptions.findIndex(
        (opt) => opt.value === primarySelection
      );
      return updateIndicatorPosition(
        activeIndex,
        primaryContainerRef,
        primaryButtonRefs,
        setPrimaryIndicatorStyle
      );
    }
  }, [primarySelection]);

  useEffect(() => {
    let activeIndex = -1;
    let options: SelectorOption[] = [];

    if (type === 'movie') {
      activeIndex = movieSecondaryOptions.findIndex(
        (opt) => opt.value === secondarySelection
      );
      options = movieSecondaryOptions;
    } else if (type === 'tv') {
      activeIndex = tvOptions.findIndex(
        (opt) => opt.value === secondarySelection
      );
      options = tvOptions;
    } else if (type === 'show') {
      activeIndex = showOptions.findIndex(
        (opt) => opt.value === secondarySelection
      );
      options = showOptions;
    }

    if (options.length > 0) {
      return updateIndicatorPosition(
        activeIndex,
        secondaryContainerRef,
        secondaryButtonRefs,
        setSecondaryIndicatorStyle
      );
    }
  }, [secondarySelection]);

  useEffect(() => {
    const activeIndex = genreOptions.findIndex(
      (opt) => opt.value === genreSelection
    );
    return updateIndicatorPosition(
      activeIndex,
      genreContainerRef,
      genreButtonRefs,
      setGenreIndicatorStyle
    );
  }, [genreSelection]);

  useEffect(() => {
    const activeIndex = yearOptions.findIndex(
      (opt) => opt.value === yearSelection
    );
    return updateIndicatorPosition(
      activeIndex,
      yearContainerRef,
      yearButtonRefs,
      setYearIndicatorStyle
    );
  }, [yearSelection]);

  const renderCapsuleSelector = (
    options: SelectorOption[],
    activeValue: string | undefined,
    onChange: (value: string) => void,
    variant: 'primary' | 'secondary' | 'genre' | 'year' = 'secondary'
  ) => {
    const containerRef =
      variant === 'primary'
        ? primaryContainerRef
        : variant === 'secondary'
        ? secondaryContainerRef
        : variant === 'genre'
        ? genreContainerRef
        : yearContainerRef;

    const buttonRefs =
      variant === 'primary'
        ? primaryButtonRefs
        : variant === 'secondary'
        ? secondaryButtonRefs
        : variant === 'genre'
        ? genreButtonRefs
        : yearButtonRefs;

    const indicatorStyle =
      variant === 'primary'
        ? primaryIndicatorStyle
        : variant === 'secondary'
        ? secondaryIndicatorStyle
        : variant === 'genre'
        ? genreIndicatorStyle
        : yearIndicatorStyle;

    return (
      <div
        ref={containerRef}
        className='relative inline-flex bg-gray-200/60 rounded-full p-0.5 sm:p-1 dark:bg-gray-700/60 backdrop-blur-sm'
      >
        {indicatorStyle.width > 0 && (
          <div
            className='absolute top-0.5 bottom-0.5 sm:top-1 sm:bottom-1 bg-white dark:bg-gray-500 rounded-full shadow-sm transition-all duration-300 ease-out'
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        )}

        {options.map((option, index) => {
          const isActive = activeValue === option.value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              onClick={() => onChange(option.value)}
              className={`relative z-10 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'text-gray-900 dark:text-gray-100 cursor-default'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* 电影模式 */}
      {type === 'movie' && (
        <div className='space-y-3 sm:space-y-4'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
              分类
            </span>
            <div className='overflow-x-auto'>
              {renderCapsuleSelector(
                moviePrimaryOptions,
                primarySelection || moviePrimaryOptions[0].value,
                onPrimaryChange,
                'primary'
              )}
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
              地区
            </span>
            <div className='overflow-x-auto'>
              {renderCapsuleSelector(
                movieSecondaryOptions,
                secondarySelection || movieSecondaryOptions[0].value,
                onSecondaryChange,
                'secondary'
              )}
            </div>
          </div>
        </div>
      )}

      {/* 电视剧模式 */}
      {type === 'tv' && (
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
            地区
          </span>
          <div className='overflow-x-auto'>
            {renderCapsuleSelector(
              tvOptions,
              secondarySelection || tvOptions[0].value,
              onSecondaryChange,
              'secondary'
            )}
          </div>
        </div>
      )}

      {/* 综艺模式 */}
      {type === 'show' && (
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
            地区
          </span>
          <div className='overflow-x-auto'>
            {renderCapsuleSelector(
              showOptions,
              secondarySelection || showOptions[0].value,
              onSecondaryChange,
              'secondary'
            )}
          </div>
        </div>
      )}

      {/* 题材类型 */}
      {onGenreChange && (
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
            类型
          </span>
          <div className='overflow-x-auto'>
            {renderCapsuleSelector(
              genreOptions,
              genreSelection,
              onGenreChange,
              'genre'
            )}
          </div>
        </div>
      )}

      {/* 年份 / 时间 */}
      {onYearChange && (
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
            年份
          </span>
          <div className='overflow-x-auto'>
            {renderCapsuleSelector(
              yearOptions,
              yearSelection,
              onYearChange,
              'year'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubanSelector;
