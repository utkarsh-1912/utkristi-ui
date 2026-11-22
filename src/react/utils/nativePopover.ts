/** Keep React in control of dismissal while delegating placement and stacking to the browser. */
export function showAnchoredPopover(panel: HTMLElement, anchor: HTMLElement, id: string) {
  const css = panel.ownerDocument.defaultView?.CSS;
  if (typeof panel.showPopover !== 'function' || !css?.supports('position-area: block-end span-inline-end') ||
    !css.supports('position-try-fallbacks: flip-block')) return;
  const name = `--ut-anchor-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const previous = anchor.style.getPropertyValue('anchor-name');
  const existing = previous === 'none' ? [] : previous.split(',').map((value) => value.trim()).filter(Boolean);
  anchor.style.setProperty('anchor-name', [...existing, name].join(', '));
  panel.style.setProperty('position-anchor', name);
  panel.setAttribute('popover', 'manual');
  panel.dataset.utNativePopover = '';
  const cleanup = () => {
    if (panel.matches(':popover-open')) panel.hidePopover();
    panel.removeAttribute('popover');
    delete panel.dataset.utNativePopover;
    panel.style.removeProperty('position-anchor');
    const names = anchor.style.getPropertyValue('anchor-name').split(',').map((value) => value.trim()).filter((value) => value && value !== name);
    if (names.length) anchor.style.setProperty('anchor-name', names.join(', '));
    else anchor.style.removeProperty('anchor-name');
  };
  try { panel.showPopover(); } catch {
    cleanup();
    return;
  }
  return cleanup;
}
