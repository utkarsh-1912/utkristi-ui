import { useState } from 'react';

export function useControllable<T>(value: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = useState(initial);
  const current = value === undefined ? internal : value;
  return [current, (next: T) => {
    if (Object.is(current, next)) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }] as const;
}
