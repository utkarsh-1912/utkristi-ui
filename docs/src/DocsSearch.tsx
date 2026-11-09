import { useRef } from 'react';
import { Command, Modal } from '@utkristi/ui';
import { componentPages } from './examples';

interface SearchLink { href: string; label: string }
const components = componentPages.map(([slug, { name }]) => ({ href: '#/components/' + slug, label: name }));

export function DocsSearch({ onClose, pages }: { onClose: () => void; pages: readonly SearchLink[] }) {
  const input = useRef<HTMLInputElement | null>(null);
  const options = [...pages, ...components].map(({ href, label }) => ({
    value: href,
    label,
    onSelect: () => { onClose(); window.location.hash = href; },
  }));
  return <Modal open onClose={onClose} title="Search docs" initialFocus={input}>
    <Command ref={(node) => { input.current = node?.querySelector('input') ?? null; }} options={options}
      label="Find a component or guide" placeholder="Find a component or guide" />
  </Modal>;
}
