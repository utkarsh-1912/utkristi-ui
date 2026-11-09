/** Connect data-ut-open-dialog buttons to native dialogs within this root. */
export function initDialogs(root: Document | HTMLElement = document): () => void {
  const owner = root.ownerDocument ?? root as Document;

  function openDialog(event: Event) {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLButtonElement>('button[data-ut-open-dialog]');
    if (!trigger || trigger.disabled || trigger.getAttribute('aria-disabled') === 'true' || !root.contains(trigger)) return;
    const id = trigger.dataset.utOpenDialog;
    const dialog = id ? owner.getElementById(id) as HTMLDialogElement | null : null;
    if (!dialog || dialog.localName !== 'dialog' || !root.contains(dialog) || dialog.open) return;
    dialog.showModal();
  }

  root.addEventListener('click', openDialog);
  return () => root.removeEventListener('click', openDialog);
}

/** Activate server-rendered tabs marked with data-ut-tabs. */
export function initTabs(root: Document | HTMLElement = document): () => void {
  const owner = root.ownerDocument ?? root as Document;

  function handleTab(event: Event) {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const tab = event.target.closest<HTMLButtonElement>('button[role="tab"]');
    const list = tab?.closest<HTMLElement>('[role="tablist"][data-ut-tabs]');
    if (!tab || !list || !root.contains(list)) return;
    const tabs = [...list.querySelectorAll<HTMLButtonElement>('button[role="tab"]')]
      .filter((item) => item.closest('[role="tablist"]') === list);
    const enabled = tabs.filter((item) => !item.disabled && item.getAttribute('aria-disabled') !== 'true');
    const current = enabled.indexOf(tab);
    if (current < 0) return;

    let next = tab;
    if (event instanceof KeyboardEvent) {
      const vertical = list.getAttribute('aria-orientation') === 'vertical';
      const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
      const rtl = !vertical && owner.defaultView?.getComputedStyle(list).direction === 'rtl';
      if (event.key === 'Home') next = enabled[0];
      else if (event.key === 'End') next = enabled[enabled.length - 1];
      else if (event.key === previousKey || event.key === nextKey) {
        const step = (event.key === nextKey) !== rtl ? 1 : -1;
        next = enabled[(current + step + enabled.length) % enabled.length];
      } else return;
      event.preventDefault();
    }

    for (const item of tabs) {
      const selected = item === next;
      item.tabIndex = selected ? 0 : -1;
      item.setAttribute('aria-selected', String(selected));
      const id = item.getAttribute('aria-controls');
      const panel = id ? owner.getElementById(id) : null;
      if (panel?.getAttribute('role') === 'tabpanel' && root.contains(panel)) panel.hidden = !selected;
    }
    if (event instanceof KeyboardEvent) next.focus();
  }

  root.addEventListener('click', handleTab);
  root.addEventListener('keydown', handleTab);
  return () => {
    root.removeEventListener('click', handleTab);
    root.removeEventListener('keydown', handleTab);
  };
}

export function initUI(root: Document | HTMLElement = document): () => void {
  const disposeDialogs = initDialogs(root);
  const disposeTabs = initTabs(root);
  return () => {
    disposeDialogs();
    disposeTabs();
  };
}
