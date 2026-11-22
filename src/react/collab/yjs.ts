import { createCollabChannel, type CollabAdapter, type CollabComment, type CollabCursor, type CollabThread, type CollabUser } from './adapter.js';

interface Awareness {
  getStates: () => Map<number, Record<string, unknown>>;
  on: (event: 'change', listener: () => void) => void;
  off: (event: 'change', listener: () => void) => void;
  setLocalStateField: (key: string, value: unknown) => void;
}
export type YjsCollabEntry = CollabThread | (CollabComment & { threadId: string });

interface Threads {
  get: (id: string) => YjsCollabEntry | undefined;
  set: (id: string, entry: YjsCollabEntry) => unknown;
  values: () => IterableIterator<YjsCollabEntry>;
  observe: (listener: () => void) => void;
  unobserve: (listener: () => void) => void;
}

export function createYjsCollabAdapter(awareness: Awareness, threads: Threads, user: CollabUser): CollabAdapter & { dispose: () => void } {
  const users$ = createCollabChannel<CollabUser>();
  const cursors$ = createCollabChannel<CollabCursor>();
  const comments$ = createCollabChannel<CollabThread>();
  function presence() {
    const states = [...awareness.getStates().values()];
    users$.publish(states.flatMap((state) => {
      const user = state.utkristiUser as CollabUser | undefined;
      return user && typeof user.id === 'string' && typeof user.name === 'string' ? [user] : [];
    }));
    cursors$.publish(states.flatMap((state) => {
      const cursor = state.utkristiCursor as CollabCursor | undefined;
      return cursor && typeof cursor.userId === 'string' && Number.isFinite(cursor.x) && Number.isFinite(cursor.y) &&
        Number.isFinite(cursor.updatedAt) ? [cursor] : [];
    }));
  }
  const updateThreads = () => {
    const roots: CollabThread[] = [];
    const replies = new Map<string, CollabComment[]>();
    for (const entry of threads.values()) {
      if (!('threadId' in entry)) {
        roots.push(entry);
        continue;
      }
      const list = replies.get(entry.threadId) ?? [];
      list.push(entry);
      replies.set(entry.threadId, list);
    }
    comments$.publish(roots.map((thread) => ({ ...thread, comments: [...thread.comments, ...(replies.get(thread.id) ?? [])]
      .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)) })));
  };
  awareness.on('change', presence);
  threads.observe(updateThreads);
  awareness.setLocalStateField('utkristiUser', user);
  presence();
  updateThreads();
  return { users$, cursors$, comments$, send(action) {
    if (action.type === 'cursor') awareness.setLocalStateField('utkristiCursor', { ...action.cursor, userId: user.id });
    else if (action.type === 'follow') awareness.setLocalStateField('utkristiFollowing', action.userId);
    else {
      const thread = threads.get(action.threadId);
      if (!thread || 'threadId' in thread) return;
      if (action.type === 'resolve') threads.set(thread.id, { ...thread, resolved: action.resolved });
      else {
        const id = globalThis.crypto.randomUUID();
        threads.set(`reply:${id}`, { id, threadId: thread.id, authorId: user.id, body: action.body, createdAt: Date.now() });
      }
    }
  }, dispose() {
    awareness.off('change', presence);
    threads.unobserve(updateThreads);
    for (const field of ['utkristiUser', 'utkristiCursor', 'utkristiFollowing']) awareness.setLocalStateField(field, null);
  } };
}
