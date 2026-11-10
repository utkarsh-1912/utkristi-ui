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

/** Add dismissal and focus return to native disclosures such as navbar groups. */
export function initDisclosures(root: Document | HTMLElement = document): () => void {
  const owner = root.ownerDocument ?? root as Document;
  const selector = 'details[data-ut-disclosure]';
  const open = () => Array.from(root.querySelectorAll<HTMLDetailsElement>(selector + '[open]'));
  const pointer = (event: PointerEvent) => {
    const target = event.target;
    if (target instanceof Node) open().forEach((details) => { if (!details.contains(target)) details.open = false; });
  };
  const key = (event: Event) => {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Escape' || event.defaultPrevented || !(event.target instanceof Element)) return;
    const details = event.target.closest<HTMLDetailsElement>(selector + '[open]');
    if (!details || !root.contains(details)) return;
    event.preventDefault();
    event.stopPropagation();
    details.open = false;
    details.querySelector<HTMLElement>(':scope > summary')?.focus();
  };
  const toggle = (event: Event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.matches(selector)) return;
    if (!details.open) details.querySelectorAll<HTMLDetailsElement>(selector + '[open]').forEach((child) => { child.open = false; });
    else open().forEach((other) => {
      if (other !== details && other.parentElement === details.parentElement) other.open = false;
    });
  };
  const follow = (event: Event) => {
    if (!(event.target instanceof Element) || !event.target.closest('a[href]')) return;
    let details = event.target.closest<HTMLDetailsElement>(selector + '[open]');
    let last: HTMLDetailsElement | undefined;
    while (details && root.contains(details)) {
      details.open = false;
      last = details;
      details = details.parentElement?.closest<HTMLDetailsElement>(selector + '[open]') ?? null;
    }
    if (last?.contains(owner.activeElement)) last.querySelector<HTMLElement>(':scope > summary')?.focus();
  };
  owner.addEventListener('pointerdown', pointer);
  root.addEventListener('keydown', key);
  root.addEventListener('toggle', toggle, true);
  root.addEventListener('click', follow);
  return () => {
    owner.removeEventListener('pointerdown', pointer);
    root.removeEventListener('keydown', key);
    root.removeEventListener('toggle', toggle, true);
    root.removeEventListener('click', follow);
  };
}

/** Wire pressable buttons, copy targets, dismiss targets, carousels, and text filters. */
export function initActions(root: Document | HTMLElement = document): () => void {
  const owner = root.ownerDocument ?? root as Document;
  const byId = (id?: string) => {
    const target = id ? owner.getElementById(id) : null;
    return target && root.contains(target) ? target : null;
  };
  root.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-ut-mixed]').forEach((input) => { input.indeterminate = true; });
  const click = (event: Event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('button');
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    if (button.hasAttribute('data-ut-toggle')) {
      const state = button.getAttribute('role') === 'switch' ? 'aria-checked' : 'aria-pressed';
      button.setAttribute(state, String(button.getAttribute(state) !== 'true'));
    }
    const reveal = byId(button.dataset.utReveal);
    if (reveal) {
      reveal.dataset.utHidden = '';
      reveal.hidden = !reveal.hidden;
      button.setAttribute('aria-expanded', String(!reveal.hidden));
    }
    const dismiss = byId(button.dataset.utDismiss);
    if (dismiss) {
      const returnTo = byId(dismiss.dataset.utReturnFocus);
      dismiss.dataset.utHidden = '';
      dismiss.hidden = true;
      returnTo?.focus();
    }
    const clipboard = byId(button.dataset.utCopy);
    if (clipboard) {
      const text = clipboard instanceof HTMLInputElement || clipboard instanceof HTMLTextAreaElement
        ? clipboard.value : clipboard.textContent ?? '';
      const status = byId(button.dataset.utStatus);
      const service = owner.defaultView?.navigator.clipboard;
      if (!service) { if (status) status.textContent = 'Copy is unavailable. Select and copy the text.'; return; }
      void service.writeText(text).then(() => { if (status) status.textContent = 'Copied'; },
        () => { if (status) status.textContent = 'Copy failed. Select and copy the text.'; });
    }
    const track = byId(button.dataset.utTrack);
    if (track) {
      const direction = button.dataset.utStep === 'previous' ? -1 : 1;
      const rtl = owner.defaultView?.getComputedStyle(track).direction === 'rtl';
      const reduced = owner.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const vertical = track.closest('[data-orientation="vertical"]') !== null;
      const axis = vertical ? 'top' : 'left';
      const sign = !vertical && rtl ? -1 : 1;
      const viewport = vertical ? track.clientHeight : track.clientWidth;
      const extent = vertical ? track.scrollHeight : track.scrollWidth;
      const current = Math.abs(vertical ? track.scrollTop : track.scrollLeft);
      const behavior = reduced ? 'instant' : 'smooth';
      if (track.hasAttribute('data-ut-loop') && (direction > 0 ? current >= extent - viewport - 1 : current <= 1)) {
        track.scrollTo({ [axis]: direction > 0 ? 0 : (extent - viewport) * sign, behavior });
      } else track.scrollBy({ [axis]: viewport * direction * sign, behavior });
    }
  };
  const input = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const list = byId(event.target.dataset.utFilter);
    const query = event.target.value.trim().toLocaleLowerCase();
    list?.querySelectorAll<HTMLElement>('[data-ut-option]').forEach((option) => {
      option.hidden = !(option.textContent ?? '').toLocaleLowerCase().includes(query);
    });
  };
  const change = (event: Event) => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement) || !select.hasAttribute('data-ut-theme')) return;
    if (!['dark', 'light', 'glass', 'system'].includes(select.value)) return;
    const target = select.closest<HTMLElement>('[data-theme]') ?? owner.documentElement;
    target.dataset.theme = select.value;
    for (const theme of ['dark', 'light', 'glass']) target.classList.toggle(theme, theme === select.value);
  };
  root.addEventListener('click', click);
  root.addEventListener('input', input);
  root.addEventListener('change', change);
  return () => {
    root.removeEventListener('click', click);
    root.removeEventListener('input', input);
    root.removeEventListener('change', change);
  };
}

/** Let a native file picker accept dropped files and announce the selected count. */
export function initFileDrops(root: Document | HTMLElement = document): () => void {
  const zoneFor = (target: EventTarget | null) => target instanceof Element ? target.closest('[data-ut-dropzone]') : null;
  const announce = (input: HTMLInputElement) => {
    const status = zoneFor(input)?.querySelector<HTMLElement>('[role="status"]');
    const count = input.files?.length ?? 0;
    if (status) status.textContent = count === 0 ? 'No files selected' : `${count} ${count === 1 ? 'file' : 'files'} selected`;
  };
  const drag = (event: Event) => {
    if (!(event instanceof DragEvent) || !event.dataTransfer?.types.includes('Files')) return;
    const input = zoneFor(event.target)?.querySelector<HTMLInputElement>('input[type="file"]:not(:disabled)');
    if (!input) return;
    event.preventDefault();
    if (event.type !== 'drop' || !event.dataTransfer.files.length) return;
    if (!input.multiple && event.dataTransfer.files.length > 1) {
      const first = new DataTransfer();
      first.items.add(event.dataTransfer.files[0]);
      input.files = first.files;
    } else input.files = event.dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const change = (event: Event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === 'file') announce(event.target);
  };
  root.addEventListener('dragover', drag);
  root.addEventListener('drop', drag);
  root.addEventListener('change', change);
  return () => {
    root.removeEventListener('dragover', drag);
    root.removeEventListener('drop', drag);
    root.removeEventListener('change', change);
  };
}

export function initUI(root: Document | HTMLElement = document): () => void {
  const dispose = [initDialogs(root), initTabs(root), initDisclosures(root), initActions(root), initFileDrops(root)];
  return () => dispose.forEach((cleanup) => cleanup());
}
