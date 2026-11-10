import type { CSSProperties } from 'react';

export interface ComponentGeometry {
  /** A CSS corner radius. Numbers are pixels. */
  radius?: CSSProperties['borderRadius'];
  /** A CSS width along the inline axis. Numbers are pixels. */
  inlineSize?: CSSProperties['inlineSize'];
}

export function geometryStyle({ radius, inlineSize }: ComponentGeometry, style: CSSProperties | undefined) {
  if (radius === undefined && inlineSize === undefined) return style;
  return { borderRadius: radius, inlineSize, ...style };
}
