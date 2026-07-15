import { useState, useEffect } from 'react';

export type ScreenSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsiveInfo {
  screenSize: ScreenSize;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  visibleColumnCount: number;
  chartRadius: { inner: number; outer: number };
  rowHeightEstimate: number;
}

const getScreenInfo = (width: number): Omit<ResponsiveInfo, 'width' | 'height'> => {
  if (width < 480) {
    return {
      screenSize: 'sm',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      visibleColumnCount: 1,
      chartRadius: { inner: 40, outer: 55 },
      rowHeightEstimate: 45,
    };
  }
  if (width < 768) {
    return {
      screenSize: 'sm',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      visibleColumnCount: 2,
      chartRadius: { inner: 50, outer: 65 },
      rowHeightEstimate: 45,
    };
  }
  if (width < 992) {
    return {
      screenSize: 'md',
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      visibleColumnCount: 3,
      chartRadius: { inner: 60, outer: 80 },
      rowHeightEstimate: 55,
    };
  }
  if (width < 1280) {
    return {
      screenSize: 'lg',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      visibleColumnCount: 3,
      chartRadius: { inner: 60, outer: 80 },
      rowHeightEstimate: 61,
    };
  }
  return {
    screenSize: 'xl',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    visibleColumnCount: 3,
    chartRadius: { inner: 75, outer: 100 },
    rowHeightEstimate: 61,
  };
};

export const useResponsive = (): ResponsiveInfo => {
  const [info, setInfo] = useState<ResponsiveInfo>(() => {
    const { width, height } = typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1024, height: 768 };
    return { width, height, ...getScreenInfo(width) };
  });

  useEffect(() => {
    let ticking = false;

    const handleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { innerWidth, innerHeight } = window;
          setInfo({
            width: innerWidth,
            height: innerHeight,
            ...getScreenInfo(innerWidth),
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return info;
};
