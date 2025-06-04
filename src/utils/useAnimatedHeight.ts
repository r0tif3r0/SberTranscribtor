import { useEffect, useRef, useState, useLayoutEffect } from 'react';

export const useAnimatedHeight = (isOpen: boolean, duration = 300) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);

  useLayoutEffect(() => {
    setHasRendered(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasRendered) return;

    if (isOpen) {
      el.style.height = el.scrollHeight + 'px';
      const timeout = setTimeout(() => {
        el.style.height = 'auto';
      }, duration);
      return () => clearTimeout(timeout);
    } else {
      if (el.style.height === 'auto') {
        el.style.height = el.scrollHeight + 'px';
        requestAnimationFrame(() => {
          el.style.height = '0px';
        });
      } else {
        el.style.height = '0px';
      }
    }
  }, [isOpen, duration, hasRendered]);

  return ref;
};