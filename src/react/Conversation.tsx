import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { assignRef, cx } from './utils/cx.js';

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end'; variant?: 'neutral' | 'solid' | 'outline' | 'ghost' | 'danger'; reactions?: ReactNode;
}
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  { align = 'start', variant = 'neutral', reactions, className, children, ...props }, ref,
) {
  return <div {...props} ref={ref} data-align={align} className={cx('bubble', className)}>
    <div className="bubble-content" data-variant={variant}>{children}</div>
    {reactions != null && <div className="bubble-reactions">{reactions}</div>}
  </div>;
});

export interface MessageProps extends HTMLAttributes<HTMLElement> {
  align?: 'start' | 'end'; avatar?: ReactNode; sender?: ReactNode; footer?: ReactNode;
}
export const Message = forwardRef<HTMLElement, MessageProps>(function Message(
  { align = 'start', avatar, sender, footer, className, children, ...props }, ref,
) {
  return <article {...props} ref={ref} data-align={align} className={cx('message', className)}>
    {avatar && <div className="message-avatar">{avatar}</div>}
    <div className="message-content">
      {sender != null && <div className="message-sender label">{sender}</div>}
      {children}{footer != null && <div className="message-footer">{footer}</div>}
    </div>
  </article>;
});

export interface ScrollerItem { id: string; content: ReactNode }
export interface MessageScrollerProps extends HTMLAttributes<HTMLDivElement> {
  items: readonly ScrollerItem[]; label?: string; follow?: boolean; jumpToId?: string;
}
const useScrollLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const MessageScroller = forwardRef<HTMLDivElement, MessageScrollerProps>(function MessageScroller(
  { items, label = 'Messages', follow = true, jumpToId, className, ...props }, ref,
) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const atEnd = useRef(true);
  const before = useRef<{ first: string | undefined; height: number }>();
  const [showJump, setShowJump] = useState(false);

  useScrollLayout(() => {
    const node = viewport.current;
    if (!node) return;
    const first = items[0]?.id;
    const previous = before.current;
    const height = node.scrollHeight;
    const prepended = previous?.first && previous.first !== first && items.some(({ id }) => id === previous.first);
    if (follow && atEnd.current) node.scrollTop = height;
    else if (prepended) node.scrollTop += height - previous.height;
    before.current = { first, height };
    setShowJump(height - node.scrollTop - node.clientHeight > 24);
  }, [items, follow]);

  useEffect(() => {
    const node = viewport.current;
    if (!node || !content.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (follow && atEnd.current) node.scrollTop = node.scrollHeight;
      if (before.current) before.current.height = node.scrollHeight;
      setShowJump(node.scrollHeight - node.scrollTop - node.clientHeight > 24);
    });
    observer.observe(content.current);
    observer.observe(node);
    return () => observer.disconnect();
  }, [follow]);

  useEffect(() => {
    const node = viewport.current;
    const target = Array.from(content.current?.children ?? []).find((item) => item.getAttribute('data-message-id') === jumpToId);
    if (!jumpToId || !node || !target) return;
    node.scrollTop += target.getBoundingClientRect().top - node.getBoundingClientRect().top;
  }, [jumpToId, items]);

  return <div {...props} ref={ref} className={cx('message-scroller', className)}>
    {/* A focused log lets keyboard users scroll without focusing a message. */}
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
    <div tabIndex={0} className="message-viewport" ref={(node) => { viewport.current = node; }} role="log" aria-label={label} onScroll={(event) => {
        const node = event.currentTarget;
        atEnd.current = node.scrollHeight - node.scrollTop - node.clientHeight <= 24;
        setShowJump(!atEnd.current);
      }}>
      <div className="message-feed" ref={content}>
        {items.map((item) => <div key={item.id} data-message-id={item.id}>{item.content}</div>)}
      </div>
    </div>
    {showJump && <Button className="message-jump" size="sm" variant="ghost" onClick={() => {
      if (!viewport.current) return;
      viewport.current.scrollTop = viewport.current.scrollHeight;
      viewport.current.focus();
    }}>Jump to latest</Button>}
  </div>;
});

export interface TraceStep { id: string; title: ReactNode; detail?: ReactNode; status?: 'pending' | 'active' | 'done' | 'error'; icon?: ReactNode }
const traceTone = { pending: 'neutral', active: 'accent', done: 'ok', error: 'bad' } as const;
export const Trace = forwardRef<HTMLOListElement, HTMLAttributes<HTMLOListElement> & {
  steps: readonly TraceStep[];
}>(function Trace({ steps, className, ...props }, ref) {
  return <ol aria-label="Activity trace" {...props} ref={(node) => assignRef(ref, node)} className={cx('trace', className)}>
    {steps.map(({ id, title, detail, status, icon }) => {
      const line = <span className="trace-line">{icon && <span aria-hidden="true">{icon}</span>}<strong>{title}</strong>
        {status && <Badge tone={traceTone[status]}>{status}</Badge>}</span>;
      return <li key={id}>{detail == null ? line : <details><summary>{line}</summary><div className="trace-detail">{detail}</div></details>}</li>;
    })}
  </ol>;
});
