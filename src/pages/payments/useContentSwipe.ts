import { useRef } from 'react';

/**
 * Горизонтальный свайп по контенту табов.
 * При достаточном горизонтальном сдвиге (> 50 px и больше вертикального в 1.5 раза)
 * переключает активный таб на соседний.
 */
export const useContentSwipe = (
  tabs: string[],
  activeTab: string,
  setActiveTab: (tab: string) => void,
) => {
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);

  const handleContentTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };

  const handleContentTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    swipeStartX.current = null;
    swipeStartY.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const idx = tabs.indexOf(activeTab);
    if (dx < 0 && idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
    if (dx > 0 && idx > 0) setActiveTab(tabs[idx - 1]);
  };

  return { handleContentTouchStart, handleContentTouchEnd };
};
