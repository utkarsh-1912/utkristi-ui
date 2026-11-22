'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '../Button.js';
import { Popover } from '../Popover.js';
import { useId } from '../utils/useId.js';
import { createCollabChannel, type CollabAdapter, type CollabCursor, type CollabThread, type CollabUser } from './adapter.js';

const empty = createCollabChannel<never>();
const hues = ['blue', 'lime', 'violet', 'teal', 'amber', 'coral', 'rose', 'graphite'];
const userHue = (id: string) => hues[Array.from(id).reduce((hash, character) => ((hash * 31) ^ character.charCodeAt(0)) >>> 0, 0) % hues.length];
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0] ?? '').join('').toLocaleUpperCase();

export function useCollabAdapter(adapter: CollabAdapter) {
  return {
    users: useSyncExternalStore(adapter.users$.subscribe, adapter.users$.getSnapshot, empty.getSnapshot),
    cursors: useSyncExternalStore(adapter.cursors$.subscribe, adapter.cursors$.getSnapshot, empty.getSnapshot),
    threads: useSyncExternalStore(adapter.comments$.subscribe, adapter.comments$.getSnapshot, empty.getSnapshot),
    send: adapter.send,
  };
}

export function PresenceStack({ users, max = 4 }: { users: readonly CollabUser[]; max?: number }) {
  const [status, setStatus] = useState('');
  const previous = useRef(users);
  useEffect(() => {
    const joined = users.filter((user) => !previous.current.some(({ id }) => id === user.id));
    const left = previous.current.filter((user) => !users.some(({ id }) => id === user.id));
    setStatus([...joined.map(({ name }) => `${name} joined`), ...left.map(({ name }) => `${name} left`)].join('. '));
    previous.current = users;
  }, [users]);
  const limit = Math.max(0, Math.trunc(max));
  return <div className="collab-presence">
    <span className="ut-sr-only" role="status">{status}</span>
    <Popover label="People present" trigger={<span className="collab-avatars">
      {users.slice(0, limit).map((user) => <span key={user.id} className="collab-avatar" data-icon-hue={userHue(user.id)} title={user.name}>{initials(user.name)}</span>)}
      {users.length > limit && <span className="collab-overflow">+{users.length - limit}</span>}
      <span className="ut-sr-only">{users.length} people present</span>
    </span>}>
      <ul className="collab-people">{users.map((user) => <li key={user.id}><b>{user.name}</b>
        <small>{[user.status ?? 'active', user.role, user.location].filter(Boolean).join(' · ')}</small></li>)}</ul>
    </Popover>
  </div>;
}

export function LiveCursor({ cursor, user }: { cursor: CollabCursor; user: CollabUser }) {
  const x = Math.max(0, Math.min(100, cursor.x));
  const y = Math.max(0, Math.min(100, cursor.y));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return <span className="collab-cursor" data-icon-hue={userHue(user.id)} data-flip={x > 72 || undefined}
    data-above={y > 80 || undefined} style={{ insetInlineStart: `${x}%`, insetBlockStart: `${y}%` }} aria-hidden="true">
    <svg viewBox="0 0 12 18" width="12" height="18" focusable="false"><path d="M1 1v15l4-4 5 1Z" fill="currentColor" /></svg>
    <span>{user.name}</span>
  </span>;
}

export function CursorLayer({ cursors, users, idleAfter = 4_000 }: { cursors: readonly CollabCursor[]; users: readonly CollabUser[]; idleAfter?: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!cursors.length) return;
    const next = Math.min(...cursors.map(({ updatedAt }) => updatedAt + idleAfter).filter((expiry) => expiry > now));
    if (!Number.isFinite(next)) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.max(0, next - Date.now()));
    return () => clearTimeout(timer);
  }, [cursors, idleAfter, now]);
  const userMap = new Map(users.map((user) => [user.id, user]));
  return <div aria-hidden="true" className="collab-cursor-layer">
    {cursors.map((cursor) => {
      const user = userMap.get(cursor.userId);
      return user && <div key={cursor.userId} className="collab-cursor-item" data-idle={now - cursor.updatedAt >= idleAfter || undefined}>
        <LiveCursor cursor={cursor} user={user} />
      </div>;
    })}
  </div>;
}

export function SelectionHighlight({ user, children, style }: { user: CollabUser; children?: ReactNode; style?: CSSProperties }) {
  return <mark className="collab-selection" data-icon-hue={userHue(user.id)} style={style}>{children}
    <small>{user.name}</small>
  </mark>;
}

export function CommentThread({ thread, users, onReply, onResolve, mention }: {
  thread: CollabThread; users: readonly CollabUser[]; onReply: (body: string) => void;
  onResolve: (resolved: boolean) => void; mention?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState('');
  return <section className="collab-thread" aria-label="Comment thread">
    {mention && <p role="status">{mention}</p>}
    <ol>{thread.comments.map((comment) => <li key={comment.id}>
      <b>{users.find(({ id }) => id === comment.authorId)?.name ?? 'Unknown collaborator'}</b>
      <p>{comment.body}</p>
    </li>)}</ol>
    <Button variant="ghost" size="sm" onClick={() => onResolve(!thread.resolved)}>{thread.resolved ? 'Reopen thread' : 'Resolve thread'}</Button>
    {!thread.resolved && <form onSubmit={(event) => {
      event.preventDefault();
      if (!draft.trim()) return;
      onReply(draft.trim());
      setDraft('');
    }}>
      <label htmlFor={id}>Reply</label><textarea className="textarea" id={id} value={draft} onChange={(event) => setDraft(event.target.value)} />
      {users.length > 0 && <label>Mention someone <select className="select" value="" onChange={(event) => {
        const user = users.find(({ id }) => id === event.currentTarget.value);
        if (user) setDraft((value) => `${value.trimEnd()} @${user.name} `.trimStart());
      }}><option value="">Select a collaborator</option>{users.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}</select></label>}
      <Button type="submit" size="sm" disabled={!draft.trim()}>Send reply</Button>
    </form>}
  </section>;
}

export function CommentPin({ label, active, onOpen }: { label: string; active?: boolean; onOpen: () => void }) {
  function navigate(event: KeyboardEvent<HTMLElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const group = event.currentTarget.closest('[data-ut-comment-pins]');
    const pins = [...(group?.querySelectorAll<HTMLButtonElement>('[data-ut-comment-pin]') ?? [])];
    const current = pins.indexOf(event.currentTarget as HTMLButtonElement);
    if (current === -1) return;
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? pins.length - 1 : (current + (backward ? -1 : 1) + pins.length) % pins.length;
    event.preventDefault();
    pins[index].focus();
  }
  return <Button size="sm" variant={active ? 'solid' : 'ghost'} data-ut-comment-pin="" aria-pressed={Boolean(active)} onClick={onOpen} onKeyDown={navigate}>{label}</Button>;
}

export function FollowBar({ user, onStop }: { user: CollabUser | null; onStop: () => void }) {
  useEffect(() => {
    if (!user) return;
    const key = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !document.querySelector('[aria-modal="true"]')) onStop();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [user, onStop]);
  return <div className="collab-status"><span role="status">{user ? `Following ${user.name}` : ''}</span>
    {user && <Button variant="ghost" size="sm" onClick={onStop}>Stop following</Button>}
  </div>;
}

export interface ActivityEvent { id: string; user: string; action: string; at: number }
export function ActivityFeed({ events, locale, now = Date.now() }: { events: readonly ActivityEvent[]; locale?: string; now?: number }) {
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const day = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of [...events].filter(({ at }) => Math.abs(at) <= 8.64e15).sort((a, b) => b.at - a.at)) {
    const key = day.format(event.at);
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return <div className="collab-activity" aria-label="Activity">
    {[...groups].map(([date, entries]) => <section key={date}><h3>{date}</h3><ul>{entries.map(({ id, user, action, at }) => {
      const seconds = Math.round((at - now) / 1000);
      const unit = Math.abs(seconds) < 60 ? 'second' : Math.abs(seconds) < 3600 ? 'minute' : Math.abs(seconds) < 86400 ? 'hour' : 'day';
      const divisor = { second: 1, minute: 60, hour: 3600, day: 86400 }[unit];
      return <li key={id}><b>{user}</b> {action} <time dateTime={new Date(at).toISOString()}>{relative.format(Math.round(seconds / divisor), unit)}</time></li>;
    })}</ul></section>)}
  </div>;
}

export function SyncStatus({ state }: { state: 'saving' | 'saved' | 'offline' | 'conflict' }) {
  return <span className="collab-sync" role="status">{{ saving: 'Saving…', saved: 'All changes saved', offline: 'Offline', conflict: 'Changes need review' }[state]}</span>;
}

export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  return <div className="collab-status" data-tone="warn"><span role="status">You’re offline.</span>
    {onRetry && <Button variant="ghost" size="sm" onClick={onRetry}>Reconnect</Button>}
  </div>;
}

export function ConflictBanner({ onReview }: { onReview: () => void }) {
  return <div className="collab-status" data-tone="bad"><span role="status">Some changes conflict.</span>
    <Button variant="ghost" size="sm" onClick={onReview}>Review changes</Button>
  </div>;
}
