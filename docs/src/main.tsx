import { lazy, StrictMode, Suspense, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Plus } from 'lucide-react';
import {
  Badge, Button, Card, CardBody, CardHeader, Code, Dot, Field, Icon, IconPalettePicker, IconPaletteProvider, IconTile, Input, Logo, SearchInput,
  Select, Shell, Slider, Stat, Stats, Tabs, ThemeProvider, ThemeSelect, ToastProvider, useTheme, type Theme,
} from '@utkristi/ui';
import { blockPages, componentPages, examples, type Example } from './examples';
import { blocks } from './blocks';
import { variants, variantSets } from './variants';
import { FontDemo } from './catalog';
import { CopyCode } from './CopyCode';
import { DocsSearch } from './DocsSearch';
import { IconsPage, TokensPaletteSection } from './IconsPage';
import { MarketingHome, useMarketingMotion, WorkflowSection } from './Marketing';
import tokenCSS from '../../src/styles/tokens.css?raw';
import './styles.css';

const Playground = lazy(() => import('./Playground'));
const ComponentReference = lazy(() => import('./ComponentReference'));

const primary = [
  { href: '#/overview', label: 'Overview' },
  { href: '#/getting-started', label: 'Install' },
  { href: '#/icons', label: 'Icons' },
  { href: '#/components/button', label: 'Components' },
  { href: '#/blocks', label: 'Blocks' },
  { href: '#/sandbox', label: 'Sandbox' },
];
const primaryIcons = {
  Overview: 'home', Install: 'download', Icons: 'palette', Components: 'layers', Blocks: 'grid', Sandbox: 'terminal',
} as const;
const showcaseLink = { href: '#/showcase', label: 'Showcase' };
const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.platform);
const guide = [
  { href: '#/getting-started', label: 'Getting started' },
  { href: '#/theming', label: 'Theming' },
  { href: '#/tokens', label: 'Tokens' },
  { href: '#/icons', label: 'Icons' },
  { href: '#/typography', label: 'Typography' },
  { href: '#/blocks', label: 'Blocks' },
  { href: '#/sandbox', label: 'Sandbox' },
];

const themeLabels = { dark: 'Night', light: 'Paper', glass: 'Glass' } as const;
const themes = ['dark', 'light', 'glass'] as const;
type PreviewTheme = typeof themes[number];

function route() {
  const [path, options] = location.hash.replace(/^#/, '').split('?');
  const requestedTheme = new URLSearchParams(options ?? location.search).get('theme');
  const theme = requestedTheme === 'dark' || requestedTheme === 'light' || requestedTheme === 'glass' ? requestedTheme : undefined;
  return { path: path || '/overview', theme, sample: new URLSearchParams(options).get('component') ?? undefined } as const;
}

function Frame({ theme, children }: { theme: PreviewTheme; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  return <div ref={panel} data-theme={theme} className="theme-preview">
    <span className="label"><Dot static tone="off" /> {themeLabels[theme]}</span>
    <div className="preview-content">
      <ThemeProvider defaultTheme={theme} storageKey={null} target={() => panel.current}>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </div>
  </div>;
}

function ExamplePreview({ example, initialTheme, description, children }: {
  example: Example; initialTheme: PreviewTheme; description?: string; children?: ReactNode;
}) {
  const [previewTheme, setPreviewTheme] = useState(initialTheme);
  const Preview = example.preview;
  return <div className="docs-example">
    <div className="docs-example-toolbar">
      <div className="docs-example-title"><strong>Live preview</strong>{description && <span className="muted">{description}</span>}</div>
      <div className="docs-example-controls">{children}<Select aria-label="Preview theme" value={previewTheme}
        onChange={(event) => setPreviewTheme(event.target.value as PreviewTheme)}>
        {themes.map((theme) => <option key={theme} value={theme}>{themeLabels[theme]}</option>)}
      </Select></div>
    </div>
    <Frame key={previewTheme} theme={previewTheme}><Preview key={example.name} /></Frame>
  </div>;
}

function ComponentPage({ slug }: { slug: keyof typeof examples }) {
  const { resolvedTheme } = useTheme();
  const [variant, setVariant] = useState<keyof typeof variants>();
  const example = examples[slug];
  const choices = variantSets[slug] ?? [];
  const selected = variant ? variants[variant] : example;
  return <article className="doc-article">
    <PageTitle kicker="Components" title={example.name} detail={example.description} />
    <ExamplePreview key={resolvedTheme} example={selected} initialTheme={resolvedTheme} description={variant ? selected.description : undefined}>
      {choices.length > 0 && <Select aria-label="Example variant" value={variant ?? ''}
        onChange={(event) => setVariant(choices.find((key) => key === event.target.value))}>
        <option value="">Default example</option>
        {choices.map((key) => <option key={key} value={key}>{variants[key].name}</option>)}
      </Select>}
    </ExamplePreview>
    <Suspense fallback={<p className="muted">Loading examples and props…</p>}><ComponentReference slug={variant ?? slug} html={selected.html} /></Suspense>
  </article>;
}

function BlocksPage() {
  const motion = useMarketingMotion();
  return <article ref={motion} className="doc-article">
    <PageTitle kicker="UI library" title="Blocks" detail="Working layouts for application screens, account flows, and marketing pages. Open a block to try it and copy its source." />
    {['Application', 'Account', 'Marketing'].map((category) => <section key={category} className="blocks-section" data-reveal>
      <h2>{category}</h2>
      <div className="blocks-grid">{blockPages.filter(([, block]) => block.category === category).map(([slug, block]) =>
        <a key={slug} href={`#/blocks/${slug}`} className="block-link">
          <span className="block-link-icon"><Icon name={category === 'Application' ? 'grid' : category === 'Account' ? 'lock' : 'ai-spark'} size={22} /></span>
          <span><strong>{block.name}</strong><span className="muted">{block.description}</span></span><Icon name="arrow-up-right" />
        </a>)}
      </div>
    </section>)}
  </article>;
}

function BlockPage({ slug }: { slug: keyof typeof blocks }) {
  const { resolvedTheme } = useTheme();
  const block = blocks[slug];
  return <article className="doc-article">
    <a href="#/blocks" className="link block-back"><Icon name="arrow-left" /> All blocks</a>
    <PageTitle kicker={`Blocks / ${block.category}`} title={block.name} detail={block.description} />
    <ExamplePreview key={resolvedTheme} example={block} initialTheme={resolvedTheme} />
    <Suspense fallback={<p className="muted">Loading example source…</p>}><ComponentReference slug={slug} html={block.html} /></Suspense>
  </article>;
}

function PageTitle({ kicker, title, detail }: { kicker: string; title: ReactNode; detail: ReactNode }) {
  return <header className="doc-title">
    <span className="label"><Dot static tone="off" /> {kicker}</span>
    <h1 className="display display-xl">{title}</h1>
    <p className="lede">{detail}</p>
  </header>;
}
function GettingStarted() {
  return <article className="doc-article">
    <PageTitle kicker="Guide" title="Getting started" detail="Install the kit and choose how to load its styles." />
    <CopyCode text="npm install @utkristi/ui" />
    <h2>Tailwind CSS 3.4</h2>
    <p>Add the preset to your Tailwind configuration. Include the compiled kit when you use its React components.</p>
    <Tabs label="Tailwind configuration formats" items={[
      { id: 'esm', label: 'ESM', content: <CopyCode text={`import preset from '@utkristi/ui/preset';\n\nexport default {\n  content: ['./src/**/*.{html,js,jsx,ts,tsx}', './node_modules/@utkristi/ui/dist/**/*.js'],\n  presets: [preset],\n};`} /> },
      { id: 'cjs', label: 'CommonJS', content: <CopyCode text={`module.exports = {\n  content: ['./src/**/*.{html,js,jsx,ts,tsx}', './node_modules/@utkristi/ui/dist/**/*.js'],\n  presets: [require('@utkristi/ui/preset')],\n};`} /> },
      { id: 'plugin', label: 'Plugin', content: <CopyCode text={`import utkristi from '@utkristi/ui/plugin';\n\nexport default {\n  content: ['./src/**/*.{html,js,jsx,ts,tsx}', './node_modules/@utkristi/ui/dist/**/*.js'],\n  plugins: [utkristi()],\n};`} /> },
    ]} />
    <h2>Standalone CSS and fonts</h2>
    <CopyCode text={`import '@utkristi/ui/fonts.css';\nimport '@utkristi/ui/utkristi-ui.css';`} />
    <p>In HTML, load the same font stylesheet and CSS with link elements.</p>
    <CopyCode text={`<link rel="stylesheet" href="https://unpkg.com/@utkristi/ui@0.1.0/fonts.css">\n<link rel="stylesheet" href="https://unpkg.com/@utkristi/ui@0.1.0/utkristi-ui.css">`} />
    <h2>React</h2>
    <CopyCode text={`import { Button, ThemeProvider } from '@utkristi/ui';\nimport '@utkristi/ui/utkristi-ui.css';\n\nexport function App() {\n  return <ThemeProvider><Button>New workspace</Button></ThemeProvider>;\n}`} />
    <h2>Host the documentation</h2>
    <p>Build the site and deploy the contents of <Code inline>docs/dist</Code> to a static host. The site uses hash routes and works under a subdirectory.</p>
    <CopyCode text={'npm ci\nnpm run docs:build'} />
    <h2>Tailwind CSS 4</h2>
    <p>Load the preset through your JavaScript config with <Code inline>@config</Code>, or load the plugin directly with <Code inline>@plugin</Code>. Add an explicit source path for the React package.</p>
    <CopyCode text={`@import "tailwindcss";\n@plugin "@utkristi/ui/plugin";\n@source "../node_modules/@utkristi/ui/dist";`} />
    <p><a className="link" href="https://tailwindcss.com/docs/functions-and-directives#compatibility">Tailwind compatibility directives <ArrowUpRight size={14} /></a></p>
  </article>;
}

function Theming() {
  return <article className="doc-article">
    <PageTitle kicker="Guide" title="Theming" detail="Night, Paper, and Glass share one set of components. Night is the default." />
    <div className="theme-gallery">{themes.map((theme) => <Frame key={theme} theme={theme}><Button>{themeLabels[theme]}</Button></Frame>)}</div>
    <h2>Set the theme</h2>
    <p>Use <Code inline>data-theme="dark"</Code>, <Code inline>data-theme="light"</Code>, or <Code inline>data-theme="glass"</Code> on the root or a nested panel.
      The <Code inline>.dark</Code>, <Code inline>.light</Code>, <Code inline>.light-theme</Code>, and <Code inline>.glass</Code> selectors are aliases.
      <Code inline>data-theme="system"</Code> follows the operating-system colour preference.</p>
    <CopyCode text={`<section data-theme="glass">\n  <button class="btn btn-solid">Glass button</button>\n</section>`} />
    <p>Place <Code inline>{'<ThemeSelect />'}</Code> inside <Code inline>{'<ThemeProvider>'}</Code> to let people choose Night, Paper, Glass, or System and keep that preference across visits.</p>
    <h2>Avoid a theme flash</h2>
    <p>Render the result of <Code inline>themeScript()</Code> into an inline script in the document head.
      Pass the same storage key to the script and provider when you customize it.</p>
    <CopyCode text={`import { themeScript } from '@utkristi/ui';\n\n// Render in the document head.\n<script dangerouslySetInnerHTML={{ __html: themeScript() }} />`} />
    <h2>Brand overrides and variants</h2>
    <CopyCode text={`[data-theme="light"] {\n  --ut-accent: #3450a4;\n  --ut-on-accent: #fff;\n}\n\n<p class="light:text-accent night:text-ink glass:text-accent">A themed label</p>`} />
  </article>;
}

const palettes = [...tokenCSS.matchAll(/(?:\[data-theme="(?:dark|light|glass)"\])\s*\{([^}]+)\}/g)].map(([, text]) =>
  Object.fromEntries([...text.matchAll(/--ut-([\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value])),
).filter((palette) => Object.hasOwn(palette, 'on-solid'));
function color(value: string) {
  return value.startsWith('#') ? value.slice(1).match(/../g)!.map((channel) => Number.parseInt(channel, 16))
    : value.match(/[\d.]+/g)!.map(Number);
}
function ratio(foreground: string, background: string, canvas: string) {
  const fg = color(foreground);
  const rawBackground = color(background);
  const opacity = rawBackground[3] ?? 1;
  const bg = color(canvas).map((channel, index) => opacity * rawBackground[index] + (1 - opacity) * channel);
  const a = fg[3] ?? 1;
  const luminance = (rgb: number[]) => rgb.reduce((total, component, index) => {
    const x = component / 255;
    return total + [.2126, .7152, .0722][index] * (x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  }, 0);
  const values = [luminance(bg.map((channel, index) => a * fg[index] + (1 - a) * channel)), luminance(bg)];
  return (Math.max(...values) + .05) / (Math.min(...values) + .05);
}
function Tokens() {
  const colors = Object.entries(palettes[0])
    .filter(([name, value]) => /^(#|rgba\()/i.test(value) && !name.startsWith('hue-') && !name.startsWith('icon-'))
    .map(([name]) => name);
  const pairs = [...['bg', 'bg-2', 'raise'].flatMap((bg) => ['ink', 'ink-2', 'ink-3'].map((fg) => [fg, bg])),
    ['on-solid', 'solid'], ['on-accent', 'accent'], ['on-bad', 'bad'], ['ok-ink', 'bg'], ['bad-ink', 'bg'], ['warn-ink', 'bg'], ['accent', 'bg'], ['mark', 'bg']];
  const rows = pairs.map(([fg, bg]) => ({
    pair: `${fg} on ${bg}`,
    ratios: palettes.map((palette) => `${ratio(palette[fg], palette[bg], palette.bg).toFixed(2)}:1`),
  }));
  return <article className="doc-article">
    <PageTitle kicker="Guide" title="Tokens" detail="The same custom properties drive all three themes, the CSS bundle, and the Tailwind plugin." />
    <div className="swatches">{colors.map((name) => <div key={name} className="swatch-row">
      <Code inline>--ut-{name}</Code>
      {themes.map((theme, i) => <div key={theme} className="swatch" data-theme={theme}>
        <span style={{ backgroundColor: `var(--ut-${name})` }} aria-hidden="true" /><small><span className="sr-only">{themeLabels[theme]} </span>{palettes[i][name]}</small>
      </div>)}
    </div>)}</div>
    <h2>Contrast</h2>
    <p>Ratios composite translucent colours over the theme canvas. The mark is checked as a UI colour.</p>
    <ContrastTable rows={rows} />
    <TokensPaletteSection ratio={ratio} />
  </article>;
}

function ContrastTable({ rows }: { rows: Array<{ pair: string; ratios: string[] }> }) {
  return <div className="table-wrap"><table className="table"><thead><tr><th scope="col">Pair</th>
    {themes.map((theme) => <th key={theme} scope="col" className="num">{themeLabels[theme]}</th>)}</tr></thead>
    <tbody>{rows.map(({ pair, ratios }) => <tr key={pair}><td>{pair}</td>{themes.map((theme, i) => <td key={theme} className="num">{ratios[i]}</td>)}</tr>)}</tbody>
  </table></div>;
}

function Typography() {
  return <article className="doc-article">
    <PageTitle kicker="Guide" title="Typography" detail="Compare Archivo, Geist, Inter, Manrope, and Newsreader. Geist Mono remains available for labels and code." />
    <FontDemo />
    <div className="type-samples">
      <div><span className="label">Display / Archivo condensed</span><p className="display display-lg">Build together</p></div>
      <div><span className="label">Lede / Archivo medium</span><p className="lede"><b>One workspace.</b> Everything your team needs to start.</p></div>
      <div><span className="label">Mono / Geist Mono</span><p className="mono">0123456789 / UTKRISTI UI</p></div>
    </div>
    <CopyCode text={`<h1 class="display display-xl">Build together</h1>\n<p class="lede">One workspace.</p>\n<span class="label">Ready to go</span>`} />
  </article>;
}

const SplitPreview = examples['split-button'].preview;

function Showcase() {
  const motion = useMarketingMotion();
  const { resolvedTheme } = useTheme();
  return <article ref={motion} className="showcase" data-showcase-theme={resolvedTheme}>
    <PageTitle kicker={resolvedTheme === 'glass' ? 'Glass / Component showcase' : 'Component showcase / 0.1.0'} title={<>Build <span className="faint">together.</span></>}
      detail={<>A workspace assembled from <b>Utkristi UI</b>, the shared kit for the Utkristi ecosystem.</>} />
    <div className="sample-row"><Button className="showcase-cta" href="#/components/button" iconLeft={<Plus size={16} />} iconRight={<ArrowUpRight size={16} />}>New workspace</Button><Button href="#/components/card" variant="ghost">Browse surfaces</Button>
      <Badge tone="ok">All systems operational</Badge></div>
    <div className="showcase-stats"><Stats>
      <Stat label="Active rooms" value="24" desc="Across three teams" /><Stat label="Members" value="86" desc="Working together" />
      <Stat label="Sync uptime" value="99" suffix="%" desc="Last 30 days" /><Stat label="Changes" value="128" desc="This week" />
    </Stats></div>
    <div className="showcase-grid" data-reveal>
      <Card><CardHeader><strong>Workspace settings</strong><Badge tone="accent">Studio</Badge></CardHeader><CardBody className="sample-stack">
        <Field label="Workspace name" hint="Visible to everyone in your workspace"><Input defaultValue="Studio" /></Field>
        <Field label="Find a collaborator"><SearchInput placeholder="Search names" shortcut="⌘ K" /></Field>
        <div><span className="label">Notification volume</span><Slider label="Notification volume" defaultValue={60} marks={[0, 25, 50, 75, 100]} /></div>
        <div className="sample-row"><Button>Save changes</Button><Button variant="ghost">Cancel</Button></div>
      </CardBody></Card>
      <Card pane><CardBody className="showcase-pane">
        <span className="label">Workspace / Live</span><h2 className="display display-lg">Studio</h2>
        <p className="muted">A shared space for the things you’re making.</p>
        <examples.avatar.preview />
        <Button variant="solid" iconRight={<ArrowUpRight size={16} />}>Open workspace</Button>
      </CardBody></Card>
      <Card><CardHeader><strong>Contributors</strong><Badge tone="count">3</Badge></CardHeader><CardBody><examples.table.preview /></CardBody></Card>
      <Card><CardHeader><strong>Project setup</strong><Dot label="In progress" tone="warn" /></CardHeader><CardBody className="sample-stack">
        <examples.steps.preview /><examples.tabs.preview /><div className="sample-row"><SplitPreview /></div>
      </CardBody></Card>
      <Card><CardHeader><strong>Custom 2D &amp; 3D icons</strong><Badge tone="accent">135 glyphs</Badge></CardHeader><CardBody className="sample-stack">
        <div className="sample-row">
          <Icon name="rocket" variant="3d" size={52} />
          <Icon name="palette" variant="3d" size={52} />
          <Icon name="ai-spark" variant="3d" size={52} />
          <Icon name="shield" variant="3d" size={52} />
          <IconTile name="room" hue="violet" size="md" />
          <IconTile name="terminal" hue="teal" size="md" />
        </div>
        <IconPalettePicker showPreview={false} />
      </CardBody></Card>
    </div>
    <WorkflowSection />
  </article>;
}

function Sidebar({ path }: { path: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const id = useId();
  const current = componentPages.find(([slug]) => path === `/components/${slug}`)?.[1].name
    ?? guide.find(({ href }) => href === `#${path}`)?.label;
  const filter = query.trim().toLowerCase();
  const matches = componentPages.filter(([slug, item]) => `${slug} ${item.name}`.toLowerCase().includes(filter));
  const close = () => { setOpen(false); setQuery(''); };
  return <aside className="doc-sidebar" data-open={open}>
    <Button className="doc-index-toggle" variant="ghost" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <Icon name="list" /><span>Docs index{current && <small>{current}</small>}</span><Icon name="chevron-down" />
    </Button>
    <div className="doc-index" id={id}>
      <div className="doc-index-search"><span className="label">Documentation</span>
        <SearchInput aria-label="Filter components" placeholder="Filter components" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <nav aria-label="Documentation" className="ut-scrollbar">
      <span className="label">Guide</span>
      {guide.map(({ href, label }) => <a key={href} href={href} onClick={close} aria-current={href === `#${path}` ? 'page' : undefined}>{label}</a>)}
      <span className="label doc-index-count">Components <small>{matches.length}</small></span>
      {matches.map(([slug, { name }]) => <a key={slug} href={`#/components/${slug}`} onClick={close}
        aria-current={path === `/components/${slug}` ? 'page' : undefined}>{name}</a>)}
      {!matches.length && <p className="muted doc-index-empty" role="status">No matching components.</p>}
      </nav>
    </div>
  </aside>;
}

function DocsThemeSelect({ previewTheme, releasePreviewTheme, className }: {
  previewTheme?: PreviewTheme; releasePreviewTheme: () => void; className: string;
}) {
  const [pending, setPending] = useState<Theme>();
  const { setTheme } = useTheme();
  useEffect(() => {
    if (previewTheme || !pending) return;
    setTheme(pending);
    setPending(undefined);
  }, [pending, previewTheme, setTheme]);
  return <ThemeSelect className={className} onChange={(event) => {
    if (!previewTheme) return;
    event.preventDefault();
    setPending(event.currentTarget.value as Theme);
    releasePreviewTheme();
  }} />;
}

function App() {
  const [{ path, theme, sample }, setRoute] = useState(route);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const update = () => { setRoute(route()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && !event.isComposing && !event.repeat && !event.shiftKey &&
        event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey &&
        !document.querySelector('[aria-modal="true"]')) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (path !== '/typography' && path !== '/components/typography') return;
    if (document.getElementById('utkristi-specimen-fonts')) return;
    const stylesheet = document.createElement('link');
    stylesheet.id = 'utkristi-specimen-fonts';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@400..800&family=Manrope:wght@400..800&family=Newsreader:opsz,wght@6..72,400..700&display=swap';
    document.head.append(stylesheet);
  }, [path]);
  const slug = path.slice('/components/'.length);
  const component = path.startsWith('/components/') && Object.hasOwn(examples, slug) ? slug as keyof typeof examples : undefined;
  const blockSlug = path.slice('/blocks/'.length);
  const block = path.startsWith('/blocks/') && Object.hasOwn(blocks, blockSlug) ? blockSlug as keyof typeof blocks : undefined;
  const pages: Record<string, ReactNode> = {
    '/overview': <MarketingHome />, '/getting-started': <GettingStarted />, '/theming': <Theming />,
    '/tokens': <Tokens />, '/icons': <IconsPage />, '/typography': <Typography />, '/showcase': <Showcase />,
    '/blocks': <BlocksPage />,
    '/sandbox': <Suspense fallback={<p className="muted">Loading sandbox…</p>}><Playground key={sample ?? 'carousel'} component={sample} /></Suspense>,
  };
  const content = component ? <ComponentPage key={component} slug={component} /> : block ? <BlockPage key={block} slug={block} /> : pages[path] ?? <MarketingHome />;
  const standalone = path === '/overview' || path === '/showcase' || path === '/sandbox' || path === '/blocks' || !!block;
  function releasePreviewTheme() {
    const url = new URL(location.href);
    const [, options] = url.hash.split('?');
    const params = new URLSearchParams(options);
    params.delete('theme');
    url.searchParams.delete('theme');
    url.hash = params.size ? `${path}?${params}` : path;
    history.replaceState(history.state, '', url);
    setRoute(route());
  }
  const themeSelect = (className = 'docs-theme-select') => <DocsThemeSelect className={className}
    previewTheme={theme} releasePreviewTheme={releasePreviewTheme} />;
  return <ThemeProvider forcedTheme={theme}><IconPaletteProvider><ToastProvider>
    <Shell mainClassName="docs-main" navbar={{
      variant: 'dock',
      className: 'docs-navbar',
      brand: <a href="#/overview" aria-label="Utkristi UI overview"><Logo size={32} /></a>,
      links: primary.map((item) => ({
        ...item,
        icon: <Icon name={primaryIcons[item.label as keyof typeof primaryIcons]} size={16} />,
        active: item.href === `#${path}` || (item.label === 'Components' && !!component) || (item.label === 'Blocks' && !!block),
      })),
      onSearch: () => setSearchOpen(true),
      searchLabel: 'Search docs',
      searchShortcut: isMac ? '⌘K' : 'Ctrl K',
      right: themeSelect('nav-theme docs-theme-select'),
      sheetFoot: <div className="docs-sheet-theme"><span className="label">Appearance</span>{themeSelect()}</div>,
    }} footer={{
      className: 'docs-footer',
      lede: <div className="docs-footer-brand"><Logo size={32} /><p>Design and build across the Utkristi ecosystem.</p></div>,
      cta: <Button href="#/sandbox" variant="ghost">Open sandbox <Icon name="arrow-up-right" /></Button>,
      columns: [{ title: 'Build', links: [guide[0], guide[1], primary[3]] },
        { title: 'Design', links: [guide[2], guide[3], guide[4]] }, { title: 'Explore', links: [primary[0], primary[4], showcaseLink] }],
      themeSwitch: <div className="docs-footer-appearance"><span className="label">Appearance</span>{themeSelect()}</div>,
      bottom: <><span>Utkristi UI · MIT license</span><span>Version 0.1.0</span></>,
    }}>
      {standalone ? content : <div className="doc-layout"><Sidebar path={path} />{content}</div>}
    </Shell>
    {searchOpen && <DocsSearch onClose={() => setSearchOpen(false)} pages={[...guide, primary[0], showcaseLink]} />}
  </ToastProvider></IconPaletteProvider></ThemeProvider>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

