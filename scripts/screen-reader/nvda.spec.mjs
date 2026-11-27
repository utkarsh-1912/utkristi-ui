import { expect } from '@playwright/test';
import { nvdaTest as test } from '@guidepup/playwright';

// The fixture defaults to capturing startup speech only. These actions run after startup.
test.use({ nvdaStartOptions: { capture: true } });

const cases = [
  { slug: 'modal', action: async ({ page, preview }) => {
    await preview.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog', { name: 'Rename workspace' })).toBeVisible();
  }, phrase: /rename workspace/i },
  { slug: 'menu', action: async ({ preview }) => {
    await preview.getByRole('button', { name: 'Actions' }).press('ArrowDown');
    await expect(preview.getByRole('menuitem', { name: /open/i })).toBeFocused();
  }, phrase: /open/i },
  { slug: 'tabs', action: async ({ preview }) => {
    const first = preview.getByRole('tab').first();
    await first.focus();
    await first.press('ArrowRight');
    await expect(preview.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
  }, phrase: /tab/i },
  { slug: 'data-table', action: async ({ preview }) => {
    const checkbox = preview.getByRole('checkbox', { name: 'Select Design', exact: true });
    await checkbox.press('Space');
    await expect(checkbox).toBeChecked();
  }, phrase: /checked|selected/i },
  { slug: 'combobox', action: async ({ preview }) => {
    const input = preview.getByRole('combobox');
    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  }, phrase: /expanded|combo box/i },
];

for (const { slug, action, phrase } of cases) {
  test(`NVDA announces ${slug}`, async ({ page, nvda }, info) => {
    await page.goto(`/#/components/${slug}?theme=dark`);
    const preview = page.locator('.theme-preview').first();
    await expect(preview).toBeVisible();
    await nvda.navigateToWebContent();
    await nvda.clearSpokenPhraseLog();
    try {
      await action({ page, preview });
      await expect.poll(async () => (await nvda.spokenPhraseLog()).join(' '), {
        message: 'NVDA speech after the ' + slug + ' interaction',
      }).toMatch(phrase);
    } finally {
      await info.attach(`${slug}-spoken-output.json`, {
        body: JSON.stringify(await nvda.spokenPhraseLog(), null, 2),
        contentType: 'application/json',
      });
    }
  });
}
