import { useRef, useState } from 'react';
import { Button, Dialog, Navbar, ScrollArea, SearchInput, type NavbarLink } from '@utkristi/ui';
import type { Example } from './examples';

const baseLinks: NavbarLink[] = [
  { href: '#home', label: 'Home', active: true },
  { href: '#guides', label: 'Guides' },
];
const resources: NavbarLink = { href: '#resources', label: 'Resources', children: [
  { href: '#api', label: 'API reference' }, { href: '#examples', label: 'Examples' },
] };
const nestedResources: NavbarLink = { ...resources, children: [
  { href: '#api', label: 'API reference' },
  { href: '#teams', label: 'Teams', children: [
    { href: '#engineering', label: 'Engineering' }, { href: '#design', label: 'Design' },
  ] },
] };
const sectionLinks: NavbarLink[] = [{ href: '#overview', label: 'Overview' }, { href: '#activity', label: 'Activity' }];
const scrollStyle = { maxHeight: 220, overflowY: 'auto' as const };

function SearchNavbar() {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return <>
    <Navbar links={baseLinks} sticky={false} onSearch={() => setOpen(true)} />
    <Dialog open={open} title="Search resources" onClose={() => setOpen(false)} initialFocus={input}>
      <SearchInput ref={input} aria-label="Search resources" placeholder="Type a resource name" />
    </Dialog>
  </>;
}

function htmlLinks(items: NavbarLink[], linkClass: string): string {
  return items.map(({ href, label, active, children }) => children?.length
    ? `<details class="navbar-disclosure${linkClass === 'navbar-overflow-link' ? ' navbar-disclosure-nested' : ''}" data-ut-disclosure>
  <summary class="${linkClass} navbar-disclosure-trigger">${label} <span aria-hidden="true">⌄</span></summary>
  <div class="pop navbar-submenu" data-ut-enter>${htmlLinks(children, 'navbar-overflow-link')}</div>
</details>`
    : `<a class="${linkClass}" href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n');
}

function htmlNavbar(links: NavbarLink[], options: { sticky?: boolean; dock?: boolean; right?: string; submenu?: string } = {}) {
  const { sticky, dock, right = '', submenu = '' } = options;
  return `<header class="header${sticky ? '' : ' header-static'}${dock ? ' header-dock' : ''}">
  <div class="navbar navbar-html${dock ? ' navbar-dock' : ''}"><div class="navbar-inner">
    <div class="navbar-left"><strong>Workspace</strong>${dock ? '' : `<nav class="navbar-links" aria-label="Primary">${htmlLinks(links, 'navbar-link')}</nav>`}</div>
    ${dock ? `<nav class="navbar-links" aria-label="Primary">${htmlLinks(links, 'navbar-dock-link')}</nav>` : ''}
    <div class="navbar-right">${right}
      <details class="navbar-html-mobile navbar-disclosure" data-ut-disclosure>
        <summary class="btn btn-ghost navbar-disclosure-trigger">Menu</summary>
        <nav class="pop navbar-submenu" aria-label="Mobile primary">${htmlLinks(links, 'navbar-overflow-link')}</nav>
      </details>
    </div>
  </div></div>${submenu}
</header>`;
}

const navbarExample = (name: string, description: string, preview: Example['preview'], html: string): Example =>
  ({ name, description, preview, html, jsx: '' });

export const navbarVariants = {
  'navbar-dock': navbarExample('Floating dock', 'Center links in an inset bar and move crowded links into an overflow menu.',
    () => <Navbar variant="dock" collapseLinks sticky={false} links={baseLinks} />, htmlNavbar(baseLinks, { dock: true })),
  'navbar-dropdown': navbarExample('Navbar with dropdown', 'Group related destinations in a disclosure.',
    () => <Navbar sticky={false} links={[...baseLinks, resources]} />, htmlNavbar([...baseLinks, resources])),
  'navbar-multilevel': navbarExample('Multi-level dropdown', 'Open a second level of navigation within the first group.',
    () => <Navbar sticky={false} links={[...baseLinks, nestedResources]} />, htmlNavbar([...baseLinks, nestedResources])),
  'navbar-sticky': navbarExample('Sticky navbar', 'Scroll the preview to see the navbar stay at the top.',
    () => <ScrollArea style={scrollStyle} aria-label="Scroll to test sticky navigation">
      <Navbar links={baseLinks} sticky /><div style={{ minHeight: 440, padding: 16 }}>Scroll down to see the header stay in view.</div>
    </ScrollArea>, `<div style="max-height:220px;overflow:auto" tabindex="0" role="region" aria-label="Scroll to test sticky navigation">${htmlNavbar(baseLinks, { sticky: true })}<div style="min-height:440px;padding:16px">Scroll down to see the header stay in view.</div></div>`),
  'navbar-submenu': navbarExample('Navbar with submenu', 'Put section links on a separate row below the primary navigation.',
    () => <Navbar sticky={false} links={baseLinks}><nav className="navbar-secondary" aria-label="Section">
      {sectionLinks.map(({ href, label }) => <a key={href} className="navbar-link" href={href}>{label}</a>)}
    </nav></Navbar>, htmlNavbar(baseLinks, { submenu: `<nav class="navbar-secondary" aria-label="Section">${htmlLinks(sectionLinks, 'navbar-link')}</nav>` })),
  'navbar-search': navbarExample('Navbar with search', 'Open a focused search dialog from the desktop bar or mobile menu.',
    SearchNavbar, htmlNavbar(baseLinks, { right: '<button class="btn btn-ghost" type="button" data-ut-open-dialog="navbar-search-dialog">Search</button>' }) +
    '\n<dialog id="navbar-search-dialog" class="modal ut-native-dialog" aria-labelledby="navbar-search-title"><div class="modal-body"><h2 id="navbar-search-title">Search resources</h2><input class="input" type="search" aria-label="Search resources" autofocus><form method="dialog"><button class="btn btn-ghost">Close</button></form></div></dialog>'),
  'navbar-cta': navbarExample('Navbar with CTA button', 'Keep one primary action beside the navigation.',
    () => <Navbar sticky={false} links={baseLinks} right={<Button size="sm" href="#get-started">Get started</Button>} />,
    htmlNavbar(baseLinks, { right: '<a class="btn btn-sm btn-solid" href="#get-started">Get started</a>' })),
} satisfies Record<string, Example>;

export const defaultNavbarHtml = htmlNavbar(baseLinks);
