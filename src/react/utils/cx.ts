import type { CSSProperties, ForwardedRef } from 'react';

export type CSSVariables = CSSProperties & Record<`--${string}`, string | number | undefined>;

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function assignRef<T>(ref: ForwardedRef<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}
