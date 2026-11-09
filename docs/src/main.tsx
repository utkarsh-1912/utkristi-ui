import { lazy, StrictMode, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import {
  Badge, Button, Card, CardBody, CardHeader, Code, Dot, Field, Input, Logo, SearchInput,
  Shell, Slider, Stat, Stats, Tabs, ThemeProvider, ThemeSwitch, ToastProvider, useTheme,
} from '@utkristi/ui';
import { componentPages, examples } from './examples';
import { FontDemo } from './catalog';
import { CopyCode } from './CopyCode';
import tokenCSS from '../../src/styles/tokens.css?raw';
import './styles.css';

const Playground = lazy(() => import('./Playground'));
const ComponentReference = lazy(() => import('./ComponentReference'));

const primary = [
  { href: '#/overview', label: 'Overview' },
  { href: '#/getting-started', label: 'Install' },
  { href: '#/components/button', label: 'Components' },
  { href: '#/showcase', label: 'Showcase' },
  { href: '#/sandbox', label: 'Sandbox' },
];
const guide = [
  { href: '#/getting-started', label: 'Getting started' },
  { href: '#/theming', label: 'Theming' },
  { href: '#/tokens', label: 'Tokens' },
  { href: '#/typography', label: 'Typography' },
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

function ComponentPage({ slug }: { slug: keyof typeof examples }) {
  const example = examples[slug];
  const Preview = example.preview;
  return <article className="doc-article">
    <PageTitle kicker="Components" title={example.name} detail={example.description} />
    <div className="theme-gallery">
      {themes.map((theme) => <Frame key={theme} theme={theme}><Preview /></Frame>)}
    </div>
    <Suspense fallback={<p className="muted">Loading examples and props…</p>}><ComponentReference slug={slug} html={example.html} /></Suspense>
  </article>;
}

function PageTitle({ kicker, title, detail }: { kicker: string; title: ReactNode; detail: ReactNode }) {
  return <header className="doc-title">
    <span className="label"><Dot static tone="off" /> {kicker}</span>
    <h1 className="display display-xl">{title}</h1>
    <p className="lede">{detail}</p>
  </header>;
}
function Overview() {
  return <>
    <PageTitle kicker="Utkristi ecosystem / UI kit" title={<>Utkristi <span className="faint">UI</span></>}
      detail={<>A shared component library for <b>every Utkristi app</b>, packaged for Tailwind, plain CSS, and React.</>} />
    <div className="sample-row"><Button href="#/getting-started" iconRight={<ArrowRight size={17} />}>Get started</Button>
      <Button href="#/showcase" variant="ghost" iconRight={<ArrowUpRight size={16} />}>View showcase</Button>
      <Button href="#/sandbox" variant="ghost" iconRight={<ArrowUpRight size={16} />}>Try the sandbox</Button></div>
    <div className="overview-grid">
      <Frame theme="dark"><Card><CardHeader><Logo /><Badge tone="accent">Night</Badge></CardHeader><CardBody>Warm ink, quiet borders, and blue accents.</CardBody></Card></Frame>
      <Frame theme="light"><Card><CardHeader><Logo /><Badge tone="accent">Paper</Badge></CardHeader><CardBody>Cool paper, dark ink, and the same component geometry.</CardBody></Card></Frame>
      <Frame theme="glass"><Card><CardHeader><Logo /><Badge tone="accent">Glass</Badge></CardHeader><CardBody>Frosted lilac surfaces, charcoal chrome, and lime actions.</CardBody></Card></Frame>
    </div>
  </>;
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
  const colors = Object.entries(palettes[0]).filter(([, value]) => /^(#|rgba\()/i.test(value)).map(([name]) => name);
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
  const { resolvedTheme } = useTheme();
  return <article className="showcase" data-showcase-theme={resolvedTheme}>
    <PageTitle kicker={resolvedTheme === 'glass' ? 'Glass / Component showcase' : 'Component showcase / 0.1.0'} title={<>Build <span className="faint">together.</span></>}
      detail={<>A workspace assembled from <b>Utkristi UI</b>, the shared kit for the Utkristi ecosystem.</>} />
    <div className="sample-row"><Button className="showcase-cta" href="#/components/button" iconLeft={<Plus size={16} />} iconRight={<ArrowUpRight size={16} />}>New workspace</Button><Button href="#/components/card" variant="ghost">Browse surfaces</Button>
      <Badge tone="ok">All systems operational</Badge></div>
    <div className="showcase-stats"><Stats>
      <Stat label="Active rooms" value="24" desc="Across three teams" /><Stat label="Members" value="86" desc="Working together" />
      <Stat label="Sync uptime" value="99" suffix="%" desc="Last 30 days" /><Stat label="Changes" value="128" desc="This week" />
    </Stats></div>
    <div className="showcase-grid">
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
    </div>
  </article>;
}

function Sidebar({ path }: { path: string }) {
  const [query, setQuery] = useState('');
  const matches = componentPages.filter(([, item]) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <aside className="doc-sidebar">
    <SearchInput aria-label="Filter components" placeholder="Filter components" value={query} onChange={(event) => setQuery(event.target.value)} />
    <nav aria-label="Documentation">
      <span className="label">Guide</span>
      {guide.map(({ href, label }) => <a key={href} href={href} aria-current={href === `#${path}` ? 'page' : undefined}>{label}</a>)}
      <span className="label">Components</span>
      {matches.map(([slug, { name }]) => <a key={slug} href={`#/components/${slug}`}
        aria-current={path === `/components/${slug}` ? 'page' : undefined}>{name}</a>)}
    </nav>
  </aside>;
}

function App() {
  const [{ path, theme, sample }, setRoute] = useState(route);
  useEffect(() => {
    const update = () => { setRoute(route()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
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
  const pages: Record<string, ReactNode> = {
    '/overview': <Overview />, '/getting-started': <GettingStarted />, '/theming': <Theming />,
    '/tokens': <Tokens />, '/typography': <Typography />, '/showcase': <Showcase />,
    '/sandbox': <Suspense fallback={<p className="muted">Loading sandbox…</p>}><Playground key={sample ?? 'carousel'} component={sample} /></Suspense>,
  };
  const content = component ? <ComponentPage key={component} slug={component} /> : pages[path] ?? <Overview />;
  const standalone = path === '/overview' || path === '/showcase' || path === '/sandbox';
  return <ThemeProvider forcedTheme={theme}><ToastProvider>
    <Shell navbar={{
      brand: <a href="#/overview" aria-label="Utkristi UI overview"><Logo size={27} /></a>,
      links: primary.map((item) => ({ ...item, active: item.href === `#${path}` || (item.label === 'Components' && !!component) })),
      strip: { left: <><Dot static /> Utkristi ecosystem UI</>, right: 'v0.1.0' },
      right: <ThemeSwitch className="nav-theme" />, sheetFoot: <ThemeSwitch />,
    }} footer={{
      lede: <><b>Utkristi UI.</b> The shared kit for Utkristi apps.</>,
      columns: [{ title: 'Guide', links: guide }, { title: 'Explore', links: primary }],
      word: <>Utkristi <span className="faint">UI</span></>,
      themeSwitch: <ThemeSwitch />, bottom: <><span>MIT · Utkristi UI</span><span>Version 0.1.0</span></>,
    }}>
      {standalone ? content : <div className="doc-layout"><Sidebar path={path} />{content}</div>}
    </Shell>
  </ToastProvider></ThemeProvider>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

