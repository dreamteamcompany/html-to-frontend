import { useState, useEffect } from 'react';

/**
 * Общий хук для отслеживания адаптивного состояния:
 * - isMobile: ширина окна < breakpoint (по умолчанию 640px — Tailwind sm)
 * - isLight: активна светлая тема (класс 'light' на <html>)
 *
 * Подписывается на resize и MutationObserver class документа,
 * корректно чистит слушатели при размонтировании.
 */
export const useResponsiveState = (breakpoint: number = 640) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return { isMobile, isLight };
};

export default useResponsiveState;
