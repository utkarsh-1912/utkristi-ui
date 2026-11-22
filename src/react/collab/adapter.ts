export interface CollabUser { id: string; name: string; role?: string; location?: string; status?: 'active' | 'idle' | 'offline' }
export interface CollabCursor { userId: string; x: number; y: number; updatedAt: number }
export interface CollabComment { id: string; authorId: string; body: string; createdAt: number }
export interface CollabThread { id: string; comments: readonly CollabComment[]; resolved?: boolean }
export type CollabAction =
  | { type: 'cursor'; cursor: CollabCursor }
  | { type: 'reply'; threadId: string; body: string }
  | { type: 'resolve'; threadId: string; resolved: boolean }
  | { type: 'follow'; userId: string | null };

export interface CollabChannel<T> {
  getSnapshot: () => readonly T[];
  subscribe: (listener: () => void) => () => void;
}
export interface CollabAdapter {
  users$: CollabChannel<CollabUser>;
  cursors$: CollabChannel<CollabCursor>;
  comments$: CollabChannel<CollabThread>;
  send: (action: CollabAction) => void;
}

export function createCollabChannel<T>(initial: readonly T[] = []) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => value,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    publish(next: readonly T[]) {
      if (value === next) return;
      value = next;
      for (const listener of listeners) listener();
    },
  };
}
