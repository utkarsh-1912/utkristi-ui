import { useEffect, useId, useState, type RefObject } from 'react';
import { Button, Icon } from '@utkristi/ui';

interface Heading {
  element: HTMLHeadingElement;
  id: string;
  title: string;
  nested: boolean;
}

export default function DocsOutline({ content, path, section }: {
  content: RefObject<HTMLDivElement>;
  path: string;
  section?: string;
}) {
  const id = useId();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = content.current;
    if (!root) return;
    let frame = 0;
    const collect = () => {
      const taken = new Set<string>();
      const next: Heading[] = [];
      for (const element of root.querySelectorAll<HTMLHeadingElement>('h2, h3')) {
        if (element.closest('.docs-example, .theme-preview, [role="tabpanel"], .ut-native-dialog, [data-outline-ignore]')) continue;
        const title = element.textContent?.trim();
        if (!title) continue;
        const stem = element.id || 'section-' + (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'heading');
        let id = stem;
        let suffix = 2;
        while (taken.has(id)) id = `${stem}-${suffix++}`;
        taken.add(id);
        element.id = id;
        element.tabIndex = -1;
        next.push({ element, id, title, nested: element.tagName === 'H3' });
      }
      setHeadings((previous) => previous.length === next.length && previous.every((item, index) =>
        item.element === next[index].element && item.id === next[index].id && item.title === next[index].title) ? previous : next);
    };
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(collect);
    });
    collect();
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [content]);

  useEffect(() => {
    if (!headings.length) return;
    let frame = 0;
    const track = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const atEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        if (atEnd) {
          const destination = headings.find(({ id }) => id === section);
          const top = destination?.element.getBoundingClientRect().top;
          setActive(top !== undefined && top >= 0 && top < window.innerHeight ? section : headings[headings.length - 1].id);
          return;
        }
        const current = [...headings].reverse().find(({ element }) => element.getBoundingClientRect().top <= 145);
        setActive(current?.id ?? headings[0].id);
      });
    };
    track();
    window.addEventListener('scroll', track, { passive: true });
    window.addEventListener('resize', track);
    return () => {
      window.removeEventListener('scroll', track);
      window.removeEventListener('resize', track);
      cancelAnimationFrame(frame);
    };
  }, [headings, section]);

  const target = headings.find((heading) => heading.id === section)?.element;
  useEffect(() => {
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);

  if (!headings.length) return null;
  const params = new URLSearchParams(location.hash.split('?')[1] ?? location.search);
  return <aside className="doc-outline" data-open={open}>
    <p className="label doc-outline-title">On this page</p>
    <Button variant="ghost" className="doc-outline-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <Icon name="list" /> On this page <Icon name="chevron-down" />
    </Button>
    <nav id={id} aria-label="On this page" className="ut-scrollbar">
      {headings.map((heading) => {
        params.set('section', heading.id);
        return <a key={heading.id} href={`#${path}?${params}`} data-nested={heading.nested || undefined}
          aria-current={active === heading.id ? 'location' : undefined} onClick={() => {
            setOpen(false);
            if (section === heading.id) {
              heading.element.focus({ preventScroll: true });
              heading.element.scrollIntoView({ block: 'start' });
            }
          }}>{heading.title}</a>;
      })}
    </nav>
  </aside>;
}
