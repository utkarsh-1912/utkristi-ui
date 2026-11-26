import { useEffect, useState } from 'react';
import { Icon } from '@utkristi/ui';

const repo = 'utkarsh-1912/utkristi-ui';
const cacheKey = 'github-stars:' + repo;
const freshness = 15 * 60 * 1000;

function cachedStars(): { count: number; at: number } | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(cacheKey) ?? 'null');
    if (Number.isSafeInteger(value?.count) && value.count >= 0 && Number.isFinite(value.at)) return value;
  } catch { /* Storage can be disabled. */ }
}

export function GitHubStars() {
  const [count, setCount] = useState(() => cachedStars()?.count);
  useEffect(() => {
    const cached = cachedStars();
    if (cached && Date.now() >= cached.at && Date.now() - cached.at < freshness) return;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch('https://api.github.com/repos/' + repo, { signal: controller.signal });
        if (!response.ok) return;
        const { stargazers_count: stars } = await response.json();
        if (controller.signal.aborted || !Number.isSafeInteger(stars) || stars < 0) return;
        setCount(stars);
        localStorage.setItem(cacheKey, JSON.stringify({ count: stars, at: Date.now() }));
      } catch { /* Keep the repository link usable offline or when rate limited. */ }
    }
    void refresh();
    return () => controller.abort();
  }, []);
  const label = 'Utkristi UI on GitHub' + (count === undefined ? '' : ', ' + count.toLocaleString() + (count === 1 ? ' star' : ' stars'));
  return <a className="docs-github" href={'https://github.com/' + repo} title={label} aria-label={label}>
    <Icon name="github" size={18} />
    {count !== undefined && <span aria-hidden="true">{Intl.NumberFormat('en', { notation: 'compact' }).format(count)}</span>}
  </a>;
}
