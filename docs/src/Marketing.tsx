import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Badge, Button, Checkbox, Dot, Icon, Input, Switch, Tabs, iconManifest, themes } from '@utkristi/ui';
import { createTheme, toCSS, type ContrastLevel, type ThemeScheme } from '../../src/react/theme-engine/index.js';
import { blocks } from './blocks';
import efficiency from './efficiency.json';

export function useMarketingMotion() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!root.current || window.CSS?.supports('animation-timeline: view()') ||
      typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-entered', '');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.14 });
    root.current.querySelectorAll('[data-rise]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return root;
}

const featured = [
  ['execution-desk', 'Trading', 'An order blotter with compact icon controls and linked routes and fills.'],
  ['console-workspace', 'Terminal', 'A local command console with history and service status.'],
  ['creative-workspace', 'Studio', 'Visual asset selection and an editable inspector.'],
  ['office-workspace', 'Operations', 'A daily task list and team directory with labelled navigation.'],
] as const;

export function WorkflowSection() {
  return <section className="marketing-section" data-rise aria-labelledby="workflow-title">
    <div className="marketing-section-intro">
      <span className="label">Templates</span>
      <h2 id="workflow-title">Start with a working screen</h2>
      <a href="#/blocks" className="marketing-link">Browse all blocks <Icon name="arrow-right" /></a>
    </div>
    <div className="marketing-featured">{featured.map(([slug, category, description]) =>
      <a key={slug} href={`#/blocks/${slug}`} className="marketing-featured-link">
        <div><span className="label">{category}</span><strong>{blocks[slug].name}</strong><p>{description}</p></div>
        <Icon name="arrow-up-right" size={18} />
      </a>)}</div>
  </section>;
}

function CopyInstall() {
  const [copied, setCopied] = useState(false);
  const command = 'npm i @utkristi/ui';
  return <button type="button" className="mk-install" onClick={() => {
    void navigator.clipboard?.writeText(command).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); });
  }} aria-label={copied ? 'Install command copied' : `Copy install command: ${command}`}>
    <span aria-hidden="true">$</span><code>{command}</code><Icon name={copied ? 'check' : 'copy'} size={15} />
  </button>;
}

const presets = ['#9CC3FF', '#7C3AED', '#0EA5E9', '#16A34A', '#F59E0B', '#E11D48'];

/** The Theme Engine, live: every token of the preview below comes from one brand colour. */
function ThemeEngineDemo() {
  const [brand, setBrand] = useState('#7C3AED');
  const [draft, setDraft] = useState('#7C3AED');
  const [scheme, setScheme] = useState<ThemeScheme>('dark');
  const [level, setLevel] = useState<ContrastLevel>('AA');
  const [copied, setCopied] = useState(false);
  const theme = useMemo(() => createTheme({ brand, scheme, contrast: level, name: 'my-brand' }), [brand, scheme, level]);
  const passing = theme.report.filter((check) => check.pass).length;
  const lowest = theme.report.reduce((low, check) => (check.ratio / check.target < low.ratio / low.target ? check : low), theme.report[0]);
  const style = Object.fromEntries(Object.entries(theme.tokens).map(([key, value]) => [key === 'color-scheme' ? 'colorScheme' : key, value])) as CSSProperties;
  const commit = (value: string) => { setDraft(value); if (/^#[0-9a-f]{6}$/i.test(value)) setBrand(value); };

  return <section className="mk-engine" data-rise aria-labelledby="engine-title">
    <div className="mk-engine-copy">
      <span className="label">Theme Engine</span>
      <h2 id="engine-title" className="display mk-h2">One colour.<br /><span className="faint">A whole theme.</span></h2>
      <p>Pick any brand colour. The engine solves every text, control and focus pair in OKLCH until it passes WCAG, so the theme can't ship unreadable text. It works the same from the CLI.</p>
      <div className="mk-engine-controls">
        <label className="mk-color">
          <span className="label">Brand</span>
          <input type="color" value={brand} onChange={(event) => commit(event.target.value.toUpperCase())} aria-label="Brand colour picker" />
          <Input value={draft} onChange={(event) => commit(event.target.value.trim())} aria-label="Brand colour hex" spellCheck={false} />
        </label>
        <div className="mk-swatches" role="group" aria-label="Example brand colours">
          {presets.map((value) => <button key={value} type="button" style={{ background: value }} aria-label={`Use ${value}`} aria-pressed={brand === value} onClick={() => commit(value)} />)}
        </div>
        <div className="seg" role="radiogroup" aria-label="Scheme">
          {(['dark', 'light'] as const).map((value) => <button key={value} type="button" role="radio" className="seg-item" aria-checked={scheme === value} onClick={() => setScheme(value)}>{value === 'dark' ? 'Dark' : 'Light'}</button>)}
        </div>
        <div className="seg" role="radiogroup" aria-label="Contrast level">
          {(['AA', 'AAA'] as const).map((value) => <button key={value} type="button" role="radio" className="seg-item" aria-checked={level === value} onClick={() => setLevel(value)}>WCAG {value}</button>)}
        </div>
      </div>
      <p className="mk-report" aria-live="polite">
        <Dot static tone={passing === theme.report.length ? 'ok' : 'bad'} />
        <b>{passing}/{theme.report.length}</b> contrast checks pass · tightest: {lowest.pair} {lowest.ratio}:1 (needs {lowest.target})
      </p>
      <div className="mk-engine-actions">
        <Button variant="ghost" size="sm" href="#/theme-studio">Open Theme Studio</Button>
        <Button variant="ghost" size="sm" iconLeft={<Icon name={copied ? 'check' : 'copy'} />} onClick={() => {
          void navigator.clipboard?.writeText(toCSS(theme)).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); });
        }}>{copied ? 'Copied' : 'Copy theme CSS'}</Button>
        <code className="mk-cli">npx @utkristi/ui theme --brand "{brand}"{scheme === 'light' ? ' --scheme light' : ''}</code>
      </div>
    </div>

    <div className="mk-engine-preview theme-canvas" style={style} aria-label="Preview of the generated theme">
      <div className="mk-preview-bar"><Dot tone="ok" /> <span className="mono">workspace / release-42</span><Badge tone="accent">Live</Badge></div>
      <div className="mk-preview-body">
        <span className="label">Deploy</span>
        <strong className="display mk-preview-title">Ship v4.2</strong>
        <Input placeholder="Release notes" aria-label="Release notes (preview)" />
        <div className="mk-preview-row">
          <Checkbox label="Run checks" defaultChecked />
          <Switch label="Notify team" defaultChecked />
        </div>
        <div className="mk-preview-row">
          <Badge tone="ok">Passing</Badge><Badge tone="warn">2 flaky</Badge><Badge tone="bad">1 blocked</Badge>
        </div>
        <div className="mk-preview-row">
          <Button variant="solid">Deploy</Button>
          <Button variant="ghost">Preview</Button>
          <Button variant="quiet">Cancel</Button>
        </div>
      </div>
    </div>
  </section>;
}

type Row = (typeof efficiency.results)[number];
const kb = (bytes: number) => (bytes ? `${(bytes / 1024).toFixed(1)} KB` : '—');

function EfficiencyMatrix() {
  const rows = [...efficiency.results].sort((a, b) => (a.js.all + a.css.all) - (b.js.all + b.css.all));
  const max = Math.max(...rows.map((row) => row.js.all + row.css.all));
  const ours = rows.find((row) => row.id === 'utkristi') as Row;
  const styled = rows.filter((row) => row.id !== 'utkristi' && row.css.all + row.js.all > 0 && !/Unstyled|Tailwind/.test(row.styling));
  const lighterThan = styled.filter((row) => row.js.all + row.css.all > ours.js.all + ours.css.all);
  return <section className="mk-efficiency" data-rise aria-labelledby="efficiency-title">
    <div className="mk-section-head">
      <span className="label">Efficiency, measured</span>
      <h2 id="efficiency-title" className="display mk-h2">Six components.<br /><span className="faint">What they cost.</span></h2>
      <p>Button, dialog, menu, tabs, tooltip and select, bundled the same way for every library: esbuild, minified, React left out, gzipped. CSS is each library's own stylesheet for those components.
        {lighterThan.length > 0 && <> Utkristi ships styled components in less than {lighterThan.map((row) => row.name).join(', ')}.</>}</p>
    </div>
    <p className="mk-scroll-hint">Scroll across to compare individual components.</p>
    <div className="table-wrap mk-matrix-wrap" role="region" aria-label="Bundle size comparison" tabIndex={0}>
      <table className="table mk-matrix" aria-describedby="efficiency-notes">
        <caption className="sr-only">Gzipped size for six components per library</caption>
        <thead><tr>
          <th scope="col">Library</th><th scope="col" className="num">Total</th><th scope="col">Styling</th>
          {efficiency.components.map((name) => <th key={name} scope="col" className="num">{name}</th>)}
          <th scope="col" className="num">All six JS</th><th scope="col" className="num">CSS</th>
        </tr></thead>
        <tbody>{rows.map((row) => {
          const total = row.js.all + row.css.all;
          return <tr key={row.id} aria-current={row.id === 'utkristi' ? 'true' : undefined} className={row.id === 'utkristi' ? 'mk-ours' : undefined}>
            <th scope="row">{row.name}<small className="mono"> {row.version}</small></th>
            <td className="num mk-total"><strong>{kb(total)}</strong><span className="mk-bar" aria-hidden="true" style={{ inlineSize: `${(total / max) * 100}%` }} /></td>
            <td className="mk-styling">{row.styling}</td>
            {efficiency.components.map((name) => <td key={name} className="num">{kb(row.js[name as keyof Row['js']])}</td>)}
            <td className="num"><b>{kb(row.js.all)}</b></td>
            <td className="num">{kb(row.css.all)}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <div className="mk-footnote" id="efficiency-notes">
      <p><strong>Measurement.</strong> Results from {efficiency.measured} cover only the library code in the versions shown. Total combines the bundled JavaScript for all six components with the library’s CSS.</p>
      <p><strong>CSS and Select.</strong> A dash means the benchmark included no library CSS. Utkristi CSS includes all twelve themes. Its <code>Select</code> uses the browser’s built-in control. Use <code>Combobox</code> for a custom listbox.</p>
      <p>To reproduce, run <code>node scripts/compare-competitors.mjs</code>.</p>
    </div>
  </section>;
}

const usage = [
  { id: 'react', label: 'React', content: <pre className="code"><code>{`import { Button, ThemeProvider } from '@utkristi/ui';
import '@utkristi/ui/utkristi-ui.css';

<ThemeProvider>
  <Button variant="solid">Deploy</Button>
</ThemeProvider>`}</code></pre> },
  { id: 'tailwind', label: 'Tailwind 4', content: <pre className="code"><code>{`/* app.css */
@import "tailwindcss";
@import "@utkristi/ui/tailwind.css";

<button class="btn btn-solid glass:px-6">Deploy</button>`}</code></pre> },
  { id: 'css', label: 'Plain CSS', content: <pre className="code"><code>{`<link rel="stylesheet" href="…/dist/css/core.css">
<link rel="stylesheet" href="…/dist/css/button.css">

<button class="btn btn-solid">Deploy</button>`}</code></pre> },
];

export function MarketingHome() {
  const motion = useMarketingMotion();
  const ours = efficiency.results.find((row) => row.id === 'utkristi');
  return <article ref={motion} className="marketing-home mk">
    <section className="mk-hero" aria-labelledby="marketing-title">
      <span className="label"><Dot /> Utkristi UI · React · Tailwind 4 · Plain CSS</span>
      <h1 id="marketing-title" className="display mk-title">Interfaces for{' '}<br /><span className="faint">live, dense,</span>{' '}<br />shared work.</h1>
      <div className="mk-hero-foot">
        <p className="lede">Build a trading desk with streaming rows and price tickers, an incident console with searchable logs, or a shared workspace with presence and comments. Each uses the same theme tokens.</p>
        <div className="mk-hero-actions">
          <Button href="#/getting-started" size="lg" iconRight={<Icon name="arrow-right" />}>Get started</Button>
          <Button href="#/components/button" size="lg" variant="ghost">Components</Button>
          <CopyInstall />
        </div>
      </div>
      <dl className="mk-metrics" aria-label="Scope">
        <div><dt>Components</dt><dd>110+</dd></div>
        <div><dt>Themes</dt><dd>12<small>+ yours</small></dd></div>
        <div><dt>Icons</dt><dd>{iconManifest.length}</dd></div>
        <div><dt>Six components, gzipped</dt><dd>{ours ? ((ours.js.all + ours.css.all) / 1024).toFixed(0) : '—'}<small>KB</small></dd></div>
      </dl>
    </section>

    <ThemeEngineDemo />

    <EfficiencyMatrix />

    <section className="marketing-section" data-rise aria-labelledby="usage-title">
      <div className="marketing-section-intro">
        <span className="label">Three ways in</span>
        <h2 id="usage-title">Same classes, any stack</h2>
        <p className="marketing-section-copy">Use the typed React components, the Tailwind 4 entry, or plain stylesheets, either the full sheet or only the components you use. Every route uses the same <code>--ut-*</code> tokens.</p>
        <a href="#/frameworks" className="marketing-link">Framework guides <Icon name="arrow-right" /></a>
      </div>
      <div><Tabs items={usage} /><a href="./operations.html" className="marketing-link">Explore the plain HTML operations dashboard <Icon name="arrow-right" /></a></div>
    </section>

    <WorkflowSection />

    <section className="marketing-section" aria-labelledby="theme-story" data-rise>
      <div className="marketing-section-intro">
        <span className="label">Theming</span>
        <h2 id="theme-story">Twelve appearances, one API</h2>
        <p className="marketing-section-copy">Every theme passes the same contrast suite. Set <code>data-theme</code> on the page or on any section.</p>
        <a href="#/theming" className="marketing-link">Read the theme guide <Icon name="arrow-right" /></a>
      </div>
      <div className="marketing-appearance-grid">
        {themes.map(({ id: theme, label }) =>
          <a key={theme} href={`#/showcase?theme=${theme}`} className="marketing-appearance-card" data-theme={theme}>
            <span className="marketing-appearance-swatch" aria-hidden="true"><i /></span>
            <span className="marketing-appearance-name">{label}</span>
            <Icon name="arrow-up-right" size={14} />
          </a>)}
      </div>
    </section>

    <section className="marketing-section" aria-labelledby="icon-story" data-rise>
      <div className="marketing-section-intro">
        <span className="label">Icons</span>
        <h2 id="icon-story">From toolbar to feature artwork</h2>
        <p className="marketing-section-copy">Use line icons in dense controls, duotone in feature cards, and 2.5D and 3D artwork in empty states, all from one palette per theme.</p>
        <a href="#/icons" className="marketing-link">Explore {iconManifest.length} icons <Icon name="arrow-right" /></a>
      </div>
      <div className="marketing-icon-grid" aria-label="Icon style specimens">
        <div className="marketing-icon-tile"><Icon name="table" size={28} /><span>Line</span></div>
        <div className="marketing-icon-tile"><Icon name="settings" variant="filled" size={28} /><span>Filled</span></div>
        <div className="marketing-icon-tile"><Icon name="palette" variant="duotone" size={34} /><span>Duotone</span></div>
        <div className="marketing-icon-tile"><Icon name="rocket" variant="2.5d" hue="violet" size={48} /><span>2.5D</span></div>
        <div className="marketing-icon-tile"><Icon name="database" variant="3d" hue="teal" size={54} /><span>3D clay</span></div>
      </div>
    </section>

    <section className="mk-cta" data-rise aria-labelledby="cta-title">
      <h2 id="cta-title" className="display mk-h2">Build the<br /><span className="faint">next screen.</span></h2>
      <div className="mk-hero-actions">
        <Button href="#/getting-started" size="lg" iconRight={<Icon name="arrow-right" />}>Get started</Button>
        <Button href="#/sandbox" size="lg" variant="ghost">Open the sandbox</Button>
      </div>
    </section>
  </article>;
}
