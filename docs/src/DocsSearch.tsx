import { useRef } from 'react';
import { Command, Icon, Kbd, Modal } from '@utkristi/ui';
import { blockPages, componentPages } from './examples';

interface SearchLink { href: string; label: string }
const components = componentPages.map(([slug, { name, description }]) => ({ href: '#/components/' + slug, label: name,
  description, keywords: slug.split('-') }));
const blocks = blockPages.map(([slug, { name, description, category }]) => ({ href: '#/blocks/' + slug, label: name,
  description, keywords: [...slug.split('-'), category] }));

const guideDetails: Record<string, string> = {
  Overview: 'Explore the shared design system.',
  'Getting started': 'Install the kit and add it to your first app.',
  Theming: 'Use Night, Paper, Glass, or your own theme.',
  Tokens: 'Browse colours, spacing, and contrast.',
  Icons: 'Find SVG icons and dimensional artwork.',
  Typography: 'Compare typefaces and reading styles.',
  Sandbox: 'Edit and run React or HTML examples.',
  Showcase: 'See the kit in a sample workspace.',
  Blocks: 'Try complete layouts and copy their source.',
  Frameworks: 'Use Utkristi CSS and native dialog behavior in Vue, Svelte, Angular, or HTML.',
  About: 'Learn about Utkristi UI and its source repository.',
  Terms: 'Read the MIT License and how the examples are provided.',
  Privacy: 'Review browser storage, the sandbox, and hosting.',
};

const aliases: Record<string, string[]> = {
  '#/getting-started': ['installation', 'setup', 'npm'],
  '#/icons': ['glyphs', 'svg', '3d'],
  '#/sandbox': ['playground', 'editor'],
  '#/frameworks': ['vue', 'svelte', 'angular', 'vanilla', 'html'],
  '#/terms': ['license', 'mit'],
  '#/privacy': ['data', 'storage'],
  '#/components/data-table': ['grid', 'rows'],
  '#/components/dialog': ['modal'],
  '#/components/command': ['palette', 'launcher'],
};

export function DocsSearch({ onClose, pages }: { onClose: () => void; pages: readonly SearchLink[] }) {
  const input = useRef<HTMLInputElement | null>(null);
  const options = [...pages.map((item) => ({ ...item, group: 'Guides', description: guideDetails[item.label], keywords: [] })),
    ...components.map((item) => ({ ...item, group: 'Components' })), ...blocks.map((item) => ({ ...item, group: 'Blocks' }))].map(({ href, label, group, description, keywords }) => ({
    value: href,
    label,
    group,
    description,
    keywords: [...keywords, ...(aliases[href] ?? [])],
    icon: <Icon name={group === 'Guides' ? 'document' : 'layers'} size={18} />,
    onSelect: () => { onClose(); window.location.hash = href; },
  }));
  return <Modal open onClose={onClose} title="Search documentation" label="Utkristi UI" initialFocus={input}
    className="docs-search-dialog" footer={<div className="docs-search-keys" aria-hidden="true">
      <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> Navigate</span><span><Kbd>↵</Kbd> Open</span><span><Kbd>Esc</Kbd> Close</span>
    </div>}>
    <Command ref={(node) => { input.current = node?.querySelector('input') ?? null; }} options={options}
      inputIcon={<Icon name="search" size={20} />} label="Find a component or guide" placeholder="Search components and guides…"
      emptyText="No matches. Try a component name or a shorter phrase." />
  </Modal>;
}
