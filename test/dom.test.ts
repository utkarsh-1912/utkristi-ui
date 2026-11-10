import { afterEach, expect, test } from 'vitest';
import { initUI } from '../src/react/dom.js';

afterEach(() => { document.body.replaceChildren(); });

test('standalone actions toggle, filter and disclose content within the initialized root', () => {
  document.body.innerHTML = `<section id="demo">
    <button data-ut-toggle aria-pressed="false">Pin</button>
    <button id="show" data-ut-reveal="notice">Show notice</button>
    <div id="notice" data-ut-return-focus="show" hidden><button data-ut-dismiss="notice">Dismiss</button></div>
    <input data-ut-filter="choices">
    <div id="choices"><a data-ut-option>Atlas</a><a data-ut-option>Studio</a></div>
  </section><button id="outside" data-ut-toggle>Outside</button>`;
  const root = document.querySelector<HTMLElement>('#demo')!;
  const dispose = initUI(root);
  const pin = root.querySelector<HTMLButtonElement>('[data-ut-toggle]')!;
  pin.click();
  expect(pin).toHaveAttribute('aria-pressed', 'true');
  const show = root.querySelector<HTMLButtonElement>('#show')!;
  show.click();
  expect(root.querySelector('#notice')).not.toHaveAttribute('hidden');
  root.querySelector<HTMLButtonElement>('[data-ut-dismiss]')!.click();
  expect(root.querySelector('#notice')).toHaveAttribute('hidden');
  expect(show).toHaveFocus();
  const search = root.querySelector<HTMLInputElement>('input')!;
  search.value = 'studio';
  search.dispatchEvent(new Event('input', { bubbles: true }));
  expect(root.querySelector('#choices > :first-child')).toHaveAttribute('hidden');
  expect(root.querySelector('#choices > :last-child')).not.toHaveAttribute('hidden');
  document.querySelector<HTMLButtonElement>('#outside')!.click();
  expect(document.querySelector('#outside')).not.toHaveAttribute('aria-pressed');
  dispose();
  pin.click();
  expect(pin).toHaveAttribute('aria-pressed', 'true');
});
