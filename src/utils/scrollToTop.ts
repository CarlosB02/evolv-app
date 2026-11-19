import { useEffect } from 'react';

export function scrollAppToTop() {
  if (typeof document !== 'undefined') {
    const containers = document.querySelectorAll<HTMLElement>('[data-app-scroll-container="true"]');
    containers.forEach((container) => {
      container.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      container.scrollTop = 0;
    });
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}

export function useScrollToTop(deps: ReadonlyArray<unknown> = []) {
  useEffect(() => {
    scrollAppToTop();
    const raf = requestAnimationFrame(() => {
      scrollAppToTop();
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
