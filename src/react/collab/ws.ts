'use client';

import { createCollabChannel, type CollabAdapter, type CollabCursor, type CollabThread, type CollabUser } from './adapter.js';

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const user = (value: unknown): value is CollabUser => object(value) && typeof value.id === 'string' && typeof value.name === 'string';
const cursor = (value: unknown): value is CollabCursor => object(value) && typeof value.userId === 'string' &&
  [value.x, value.y, value.updatedAt].every(Number.isFinite);
const thread = (value: unknown): value is CollabThread => object(value) && typeof value.id === 'string' &&
  Array.isArray(value.comments) && value.comments.every((comment) => object(comment) && typeof comment.id === 'string' &&
    typeof comment.authorId === 'string' && typeof comment.body === 'string' && Number.isFinite(comment.createdAt));

/** Wire protocol: receive whole channel snapshots and send one { action } message per change. */
export function createWebSocketCollabAdapter(socket: WebSocket): CollabAdapter & { dispose: () => void } {
  const users$ = createCollabChannel<CollabUser>();
  const cursors$ = createCollabChannel<CollabCursor>();
  const comments$ = createCollabChannel<CollabThread>();
  const receive = (event: MessageEvent) => {
    if (typeof event.data !== 'string') return;
    try {
      const snapshot = JSON.parse(event.data);
      if (!object(snapshot)) return;
      if (Array.isArray(snapshot.users) && snapshot.users.every(user)) users$.publish(snapshot.users);
      if (Array.isArray(snapshot.cursors) && snapshot.cursors.every(cursor)) cursors$.publish(snapshot.cursors);
      if (Array.isArray(snapshot.comments) && snapshot.comments.every(thread)) comments$.publish(snapshot.comments);
    } catch { /* Unrelated or malformed application messages do not replace the snapshot. */ }
  };
  const clearPresence = () => { users$.publish([]); cursors$.publish([]); };
  socket.addEventListener('message', receive);
  socket.addEventListener('close', clearPresence);
  return { users$, cursors$, comments$, send(action) {
    if (socket.readyState !== 1) return;
    socket.send(JSON.stringify({ action }));
  }, dispose() {
    socket.removeEventListener('message', receive);
    socket.removeEventListener('close', clearPresence);
  } };
}
