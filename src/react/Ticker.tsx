'use client';

import { useMemo, type HTMLAttributes } from 'react';

export function useFormat(locale?: string, options?: Intl.NumberFormatOptions) {
  // Accept the complete Intl options surface, including numbering and rounding.
  const key = JSON.stringify(Object.entries(options ?? {}).sort(([a], [b]) => a.localeCompare(b)));
  return useMemo(() => new Intl.NumberFormat(locale, Object.fromEntries(JSON.parse(key))), [locale, key]);
}

export function NumberFormat({ value, locale, options }: { value: number; locale?: string; options?: Intl.NumberFormatOptions }) {
  return <>{useFormat(locale, options).format(value)}</>;
}

export interface TickerItem { id: string; label: string; value: number; change?: number }
export function Ticker({ items, locale, options, label = 'Live prices', ...props }: HTMLAttributes<HTMLUListElement> & {
  items: readonly TickerItem[]; locale?: string; options?: Intl.NumberFormatOptions; label?: string;
}) {
  const price = useFormat(locale, options);
  const change = useFormat(locale, { style: 'percent', signDisplay: 'exceptZero', maximumFractionDigits: 2 });
  return <ul {...props} aria-label={props['aria-label'] ?? label} className={['live-ticker', props.className].filter(Boolean).join(' ')}>
    {items.map((item) => <li key={item.id}><strong>{item.label}</strong><span className="market-price">{price.format(item.value)}</span>
      {item.change !== undefined && <span className={item.change > 0 ? 'market-up' : item.change < 0 ? 'market-down' : undefined}>
        <span aria-hidden="true">{item.change > 0 ? '↑ ' : item.change < 0 ? '↓ ' : ''}</span>{change.format(item.change)}
      </span>}
    </li>)}
  </ul>;
}
