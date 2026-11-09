import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './utils/cx.js';

export interface FooterColumn { title: string; links: Array<{ label: ReactNode; href: string }> }
export interface FooterProps extends HTMLAttributes<HTMLElement> {
  lede?: ReactNode;
  cta?: ReactNode;
  columns?: FooterColumn[];
  word?: ReactNode;
  bottom?: ReactNode;
  themeSwitch?: ReactNode;
}

function FitLine({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const container = box.current;
    const word = text.current;
    if (!container || !word) return;
    let active = true;
    let frame = 0;
    const fit = () => {
      word.style.setProperty('--ut-word-size', '100px');
      if (word.scrollWidth) word.style.setProperty('--ut-word-size', `${Math.floor(99.5 * container.clientWidth / word.scrollWidth)}px`);
    };
    const schedule = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    fit();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
    observer?.observe(container);
    void document.fonts?.ready.then(schedule);
    return () => { active = false; observer?.disconnect(); cancelAnimationFrame(frame); };
  }, [children]);
  return <div ref={box} className="footer-word"><span ref={text} className="footer-word-line">{children}</span></div>;
}

export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  { lede, cta, columns = [], word, bottom, themeSwitch, children, className, ...props }, ref,
) {
  return <footer {...props} ref={ref} className={cx('footer', className)}>
    <div className="footer-inner">
      {(lede != null || cta != null) && <div className="footer-top">{lede != null && <div className="lede">{lede}</div>}{cta}</div>}
      {(columns.length > 0 || themeSwitch != null) && <div className="footer-cols">
        {columns.map(({ title, links }) => <nav key={title} aria-label={title}>
          <span className="label">{title}</span>
          <ul>{links.map(({ href, label }) => <li key={href}><a href={href} className="link">{label}</a></li>)}</ul>
        </nav>)}
        {themeSwitch != null && <div className="footer-theme">{themeSwitch}</div>}
      </div>}
      {word != null && <FitLine>{word}</FitLine>}
      {bottom != null && <div className="footer-bottom">{bottom}</div>}
      {children}
    </div>
  </footer>;
});
