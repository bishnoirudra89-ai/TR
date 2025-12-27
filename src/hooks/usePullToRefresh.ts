import { useRef, useEffect } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void> | void, threshold = 80) {
  const startY = useRef<number | null>(null);
  const distance = useRef(0);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY === 0) startY.current = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null) return;
      const y = e.touches[0].clientY;
      distance.current = y - startY.current;
      if (distance.current > threshold) {
        // reached threshold; prevent further move
        e.preventDefault();
      }
    }

    async function onTouchEnd() {
      if (startY.current === null) return;
      if (distance.current > threshold) {
        try { await onRefresh(); } catch (err) { console.error(err); }
      }
      startY.current = null;
      distance.current = 0;
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, threshold]);
}
