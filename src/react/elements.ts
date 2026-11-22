'use client';

import { initActions, initDialogs, initDisclosures, initTabs } from './dom.js';
import { isTheme, themeIds } from './theme/themes.js';

/** Register the kit's light-DOM custom elements in a browser. Safe to import on the server. */
export function registerElements(registry = globalThis.customElements, Base = globalThis.HTMLElement) {
  if (!registry || !Base) return;
  class KitElement extends Base {
    private cleanup?: () => void;
    protected connect(): (() => void) | undefined { return undefined; }
    connectedCallback() { this.cleanup ??= this.connect(); }
    disconnectedCallback() { this.cleanup?.(); this.cleanup = undefined; }
  }
  class MenuElement extends KitElement {
    protected connect() { return initDisclosures(this); }
  }
  class DialogElement extends KitElement {
    protected connect() { return initDialogs(this); }
  }
  class TabsElement extends KitElement {
    protected connect() { return initTabs(this); }
  }
  class ToastElement extends KitElement {
    protected connect() { return initActions(this); }
  }
  class ThemeElement extends KitElement {
    static observedAttributes = ['theme'];
    protected connect() {
      this.apply();
      const change = (event: Event) => {
        const select = event.target as HTMLSelectElement | null;
        if (select?.matches('select[data-ut-theme]') && select.closest('ut-theme') === this && isTheme(select.value)) {
          this.setAttribute('theme', select.value);
        }
      };
      this.addEventListener('change', change);
      return () => this.removeEventListener('change', change);
    }
    attributeChangedCallback() { this.apply(); }
    private apply() {
      const theme = this.getAttribute('theme');
      if (!isTheme(theme)) return;
      this.dataset.theme = theme;
      for (const name of themeIds) this.classList.toggle(name, name === theme);
    }
  }
  for (const [name, element] of [
    ['ut-menu', MenuElement], ['ut-dialog', DialogElement], ['ut-tabs', TabsElement],
    ['ut-toast', ToastElement], ['ut-theme', ThemeElement],
  ] as const) {
    if (!registry.get(name)) registry.define(name, element);
  }
}

registerElements();
