import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { IconButton } from './Button.js';
import { Icon } from './icons.js';
import { cx } from './utils/cx.js';
import { useId } from './utils/useId.js';

export interface CarouselSlide { id: string; label?: string; content: ReactNode }
export interface CarouselProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  slides: readonly CarouselSlide[];
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  onSlideChange?: (index: number) => void;
}

export const Carousel = forwardRef<HTMLElement, CarouselProps>(function Carousel(
  { slides, orientation = 'horizontal', loop, onSlideChange, className, onKeyDown, children, ...props }, ref,
) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = slides.length;
  const index = Math.min(active, Math.max(0, count - 1));
  const vertical = orientation === 'vertical';

  function select(next: number) {
    if (next === index) return;
    setActive(next);
    onSlideChange?.(next);
  }

  function go(next: number) {
    if (!count) return;
    const target = loop ? (next + count) % count : Math.max(0, Math.min(count - 1, next));
    const node = viewport.current;
    const slide = node?.children.item(target);
    if (!node || !slide) return;
    const box = node.getBoundingClientRect();
    const item = slide.getBoundingClientRect();
    const rtl = getComputedStyle(node).direction === 'rtl';
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    node.scrollBy?.({
      top: vertical ? item.top - box.top : 0,
      left: vertical ? 0 : rtl ? item.right - box.right : item.left - box.left,
      behavior,
    });
    select(target);
  }

  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(scrollTimer.current), []);
  function syncScroll() {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const node = viewport.current;
      if (!node || !count) return;
      const rtl = getComputedStyle(node).direction === 'rtl';
      const edge = (box: DOMRect) => vertical ? box.top : rtl ? box.right : box.left;
      const start = edge(node.getBoundingClientRect());
      let nearest = 0;
      let distance = Infinity;
      Array.from(node.children).forEach((slide, candidate) => {
        const delta = Math.abs(edge(slide.getBoundingClientRect()) - start);
        if (delta < distance) { nearest = candidate; distance = delta; }
      });
      select(nearest);
    }, 120);
  }

  return <section {...props} ref={ref} aria-roledescription="carousel" aria-label={props['aria-label'] ?? 'Carousel'}
    className={cx('carousel', vertical && 'carousel-vertical', className)}>
    <div ref={viewport} id={id} className="carousel-viewport" tabIndex={count ? 0 : undefined} aria-label="Slides"
      onScroll={syncScroll} onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.target !== event.currentTarget) return;
        const rtl = !vertical && getComputedStyle(event.currentTarget).direction === 'rtl';
        const previous = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        const destinations: Record<string, number> = { [previous]: index - 1, [next]: index + 1, Home: 0, End: count - 1 };
        if (!Object.hasOwn(destinations, event.key)) return;
        event.preventDefault();
        go(destinations[event.key]);
      }}>
      {slides.map((slide, position) => <div key={slide.id} role="group" aria-roledescription="slide"
        aria-label={slide.label ?? `${position + 1} of ${count}`} className="carousel-slide">{slide.content}</div>)}
    </div>
    {count > 0 && <div className="carousel-controls">
      <span className="label" role="status" aria-atomic="true">Slide {index + 1} of {count}</span>
      <div className="button-group" role="group" aria-label="Slide navigation">
        <IconButton className="carousel-arrow" label="Previous slide" aria-controls={id} disabled={count < 2 || (!loop && index === 0)}
          onClick={() => go(index - 1)}><Icon name={vertical ? 'arrowUp' : 'arrowLeft'} /></IconButton>
        <IconButton className="carousel-arrow" label="Next slide" aria-controls={id} disabled={count < 2 || (!loop && index === count - 1)}
          onClick={() => go(index + 1)}><Icon name={vertical ? 'arrowDown' : 'arrowRight'} /></IconButton>
      </div>
    </div>}
    {children}
  </section>;
});
