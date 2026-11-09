import { useEffect } from 'react';

let locks = 0;
let previous = '';

export function useScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (locks++ === 0) {
      previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (--locks === 0) document.body.style.overflow = previous;
    };
  }, [enabled]);
}
