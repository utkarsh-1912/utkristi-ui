'use client';

import { flushSync } from 'react-dom';

type TransitionKind = 'selection' | 'route' | 'theme';
const active = new WeakMap<Document, () => void>();

export function transitionUI(
  source: HTMLElement | null, kind: TransitionKind, update: () => void,
) {
  const doc = source?.ownerDocument;
  const root = doc?.documentElement;
  if (!doc?.startViewTransition || !root || source?.closest('[data-ut-motion="none"], [data-ut-a11y-motion="reduce"]') ||
    doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }

  // Finish the previous update before taking a new snapshot. Rapid keyboard
  // navigation stays synchronous if a transition is already being committed.
  const previous = active.get(doc);
  if (previous) {
    previous();
    update();
    return;
  }
  const region = kind === 'selection' ? source?.closest<HTMLElement>('.tabs-root, .seg, .steps') : undefined;
  const previousName = region?.style.viewTransitionName;
  if (region) region.style.viewTransitionName = 'ut-selection';
  if (kind === 'theme' && source) {
    const rect = source.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, root.clientWidth - x), Math.max(y, root.clientHeight - y));
    root.style.setProperty('--ut-reveal-x', `${x}px`);
    root.style.setProperty('--ut-reveal-y', `${y}px`);
    root.style.setProperty('--ut-reveal-radius', `${radius}px`);
  }
  // Apply the update immediately on repeated interactions, even if the browser
  // has yet to invoke the callback scheduled for the first snapshot.
  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    flushSync(update);
  };
  root.dataset.utTransition = kind;
  const transition = doc.startViewTransition(commit);
  const skip = () => {
    transition.skipTransition();
    commit();
    clean();
  };
  active.set(doc, skip);
  void transition.ready.catch(() => {});
  const clean = () => {
    if (active.get(doc) !== skip) return;
    active.delete(doc);
    delete root.dataset.utTransition;
    if (region) region.style.viewTransitionName = previousName ?? '';
    for (const name of ['x', 'y', 'radius']) root.style.removeProperty(`--ut-reveal-${name}`);
  };
  void transition.finished.then(clean, clean);
}
