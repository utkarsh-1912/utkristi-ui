import { createCollabChannel, type CollabAction, type CollabAdapter, type CollabChannel, type CollabCursor, type CollabThread, type CollabUser } from './adapter.js';

interface Presence {
  utkristiUser?: CollabUser | null;
  utkristiCursor?: CollabCursor | null;
  utkristiFollowing?: string | null;
}
interface PresenceRoom {
  getOthers: () => readonly { presence: Presence }[];
  subscribe: (event: 'others', listener: () => void) => () => void;
  updatePresence: (presence: Partial<Presence>) => void;
}

/** Use a caller-owned Liveblocks room and connect its comments storage through a channel. */
export function createLiveblocksCollabAdapter(room: PresenceRoom, user: CollabUser, options: {
  comments$: CollabChannel<CollabThread>;
  sendComment: (action: Extract<CollabAction, { type: 'reply' | 'resolve' }>) => void;
}): CollabAdapter & { dispose: () => void } {
  const users$ = createCollabChannel<CollabUser>();
  const cursors$ = createCollabChannel<CollabCursor>();
  function sync() {
    const others = room.getOthers();
    users$.publish([user, ...others.flatMap(({ presence }) => presence.utkristiUser ? [presence.utkristiUser] : [])]);
    cursors$.publish(others.flatMap(({ presence }) => presence.utkristiCursor ? [presence.utkristiCursor] : []));
  }
  const unsubscribe = room.subscribe('others', sync);
  room.updatePresence({ utkristiUser: user });
  sync();
  return { users$, cursors$, comments$: options.comments$, send(action) {
    if (action.type === 'cursor') room.updatePresence({ utkristiCursor: { ...action.cursor, userId: user.id } });
    else if (action.type === 'follow') room.updatePresence({ utkristiFollowing: action.userId });
    else options.sendComment(action);
  }, dispose() {
    unsubscribe();
    room.updatePresence({ utkristiUser: null, utkristiCursor: null, utkristiFollowing: null });
  } };
}
