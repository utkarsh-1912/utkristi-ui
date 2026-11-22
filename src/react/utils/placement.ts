'use client';

export type PlacementSide = 'top' | 'bottom';
export type PlacementAlign = 'start' | 'end';

export interface PlacementResult {
  side: PlacementSide;
  align: PlacementAlign;
}

/**
 * Computes a collision-aware side and horizontal alignment for a floating panel
 * relative to its anchor and the viewport bounds.
 */
export function computePlacement(
  anchorRect: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>,
  panelSize: { width: number; height: number },
  preferred: { side?: PlacementSide; align?: PlacementAlign } = {},
  viewport: { width: number; height: number } = typeof window === 'undefined'
    ? { width: 1024, height: 768 }
    : { width: window.innerWidth, height: window.innerHeight },
  padding = 8,
): PlacementResult {
  let side: PlacementSide = preferred.side ?? 'bottom';
  let align: PlacementAlign = preferred.align ?? 'start';

  const spaceBelow = viewport.height - anchorRect.bottom - padding;
  const spaceAbove = anchorRect.top - padding;
  if (side === 'bottom' && panelSize.height > spaceBelow && spaceAbove > spaceBelow) {
    side = 'top';
  } else if (side === 'top' && panelSize.height > spaceAbove && spaceBelow > spaceAbove) {
    side = 'bottom';
  }

  const spaceFromStart = viewport.width - anchorRect.left - padding;
  const spaceFromEnd = anchorRect.right - padding;
  if (align === 'start' && panelSize.width > spaceFromStart && spaceFromEnd > spaceFromStart) {
    align = 'end';
  } else if (align === 'end' && panelSize.width > spaceFromEnd && spaceFromStart > spaceFromEnd) {
    align = 'start';
  }

  return { side, align };
}
