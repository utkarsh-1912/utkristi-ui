import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { GitHubStars } from '../docs/src/GitHubStars';

const key = 'github-stars:utkarsh-1912/utkristi-ui';
afterEach(() => { localStorage.removeItem(key); vi.unstubAllGlobals(); });

test('reads the public star count, including zero, and reuses a fresh count', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stargazers_count: 0 }) });
  vi.stubGlobal('fetch', fetch);
  const first = render(<GitHubStars />);
  expect(await screen.findByRole('link', { name: /0 stars/ })).toHaveAttribute('href', 'https://github.com/utkarsh-1912/utkristi-ui');
  first.unmount();
  render(<GitHubStars />);
  expect(screen.getByRole('link', { name: /0 stars/ })).toBeVisible();
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('keeps a previous count available when GitHub rate limits the request', async () => {
  localStorage.setItem(key, JSON.stringify({ count: 14, at: 0 }));
  const fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
  vi.stubGlobal('fetch', fetch);
  render(<GitHubStars />);
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  expect(screen.getByRole('link', { name: /14 stars/ })).toBeVisible();
});
