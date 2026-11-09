import { forwardRef, type HTMLAttributes } from 'react';
import { assignRef, cx } from './utils/cx.js';

export type Typeface = 'archivo' | 'geist' | 'inter' | 'manrope' | 'serif';
const fonts: Record<Typeface, string> = {
  archivo: 'type-archivo', geist: 'type-geist', inter: 'type-inter', manrope: 'type-manrope', serif: 'type-serif',
};

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'section' | 'div';
  typeface?: Typeface;
  density?: 'compact' | 'reading';
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  { as: Element = 'div', typeface, density = 'reading', className, ...props }, ref,
) {
  return <Element {...props} ref={(node) => assignRef(ref, node)} className={cx('typography', typeface && fonts[typeface],
    density === 'compact' && 'typography-compact', className)} />;
});
