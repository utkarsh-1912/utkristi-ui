import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Icon, iconManifest, themes, type Theme } from '@utkristi/ui';
import { blocks } from './blocks';

export function useMarketingMotion() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-entered', '');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.14 });
    root.current.querySelectorAll('[data-reveal]').forEach((section) => observer.observe(section));
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

const capabilities = [
  { icon: 'table', title: 'Data tables', detail: 'Column pinning, resizing, expandable rows, inline validation, keyboard grid nav, and virtualization.' },
  { icon: 'layers', title: 'Navigation', detail: 'Shared responsive sidebar state, persisted collapse preferences, nested sections, and modal drawers.' },
  { icon: 'sliders', title: 'Forms & ranges', detail: 'Fieldsets, debounced async validation, form reset semantics, and localized date-time range pickers.' },
  { icon: 'shield', title: 'Overlays', detail: 'Collision-aware placement, top-down Escape stack, focus restoration, and reduced-motion support.' },
] as const;

export function WorkflowSection() {
  return <section className="marketing-section" data-reveal aria-labelledby="workflow-title">
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

function ReleasePreview() {
  const [variant, setVariant] = useState<'solid' | 'outlined' | 'dashed' | 'filled' | 'text' | 'link'>('solid');
  const [stageTheme, setStageTheme] = useState<Theme>('dark');
  return <figure className="marketing-stage" data-theme={stageTheme}>
    <figcaption>
      <Icon name="layers" size={17} />
      <span>Component studio</span>
      <div className="marketing-stage-themes" role="group" aria-label="Preview theme">
        {(['dark', 'light', 'glass'] as const).map((id) => (
          <button key={id} type="button" aria-pressed={stageTheme === id} onClick={() => setStageTheme(id)}>
            {id === 'dark' ? 'Night' : id === 'light' ? 'Paper' : 'Glass'}
          </button>
        ))}
      </div>
    </figcaption>
    <div className="marketing-stage-body">
      <div className="marketing-stage-head">
        <span className="label">One API · 12 themes</span>
        <Badge tone="ok">Verified</Badge>
      </div>
      <strong>Make it fit your product.</strong>
      <div className="marketing-variant-options" role="group" aria-label="Button variant">
        {(['solid', 'outlined', 'dashed', 'filled', 'text', 'link'] as const).map((value) => (
          <button key={value} type="button" aria-pressed={value === variant} onClick={() => setVariant(value)}>{value}</button>
        ))}
      </div>
      <div className="marketing-stage-preview">
        <Button variant={variant} iconRight={<Icon name="arrow-right" />}>Explore the library</Button>
      </div>
      <pre className="marketing-stage-code"><code>{`<Button variant="${variant}">Explore the library</Button>`}</code></pre>
    </div>
  </figure>;
}

export function MarketingHome() {
  const motion = useMarketingMotion();
  return <article ref={motion} className="marketing-home">
    <section className="marketing-hero" aria-labelledby="marketing-title">
      <div className="marketing-hero-copy">
        <span className="label">Utkristi UI · Design system</span>
        <h1 id="marketing-title">A design system for Utkristi.</h1>
        <p>Compose data-dense workspaces, creative tools, and everyday apps with typed React components, standalone CSS, and verified accessibility.</p>
        <div className="marketing-actions">
          <Button href="#/getting-started" iconRight={<Icon name="arrow-right" />}>Get started</Button>
          <Button href="#/components/button" variant="ghost">Explore components</Button>
          <a href="#/sandbox" className="marketing-link">Open sandbox <Icon name="arrow-up-right" size={15} /></a>
        </div>
        <dl className="marketing-metrics" aria-label="Verified system scope">
          <div><dt>Components</dt><dd>110+</dd></div>
          <div><dt>Themes</dt><dd>12</dd></div>
          <div><dt>2D / 3D Icons</dt><dd>{iconManifest.length}</dd></div>
          <div><dt>Accessibility</dt><dd>WCAG AA</dd></div>
        </dl>
      </div>
      <ReleasePreview />
    </section>

    <section className="marketing-paths" aria-label="Start building">
      <a href="#/components/button" className="marketing-path-card">
        <span className="marketing-path-icon"><Icon name="layers" size={20} /></span>
        <h2>Choose a component</h2>
        <p>Explore 110+ components with live theme previews, prop tables, and copyable React &amp; HTML source.</p>
      </a>
      <a href="#/sandbox" className="marketing-path-card">
        <span className="marketing-path-icon"><Icon name="code" size={20} /></span>
        <h2>Make it yours</h2>
        <p>Edit React or HTML, CSS, and JavaScript in a responsive sandbox with phone, tablet, and desktop viewports.</p>
      </a>
      <a href="#/frameworks" className="marketing-path-card">
        <span className="marketing-path-icon"><Icon name="terminal" size={20} /></span>
        <h2>Bring it to your stack</h2>
        <p>Use the tree-shakable React package, Tailwind CSS preset/plugin, or standalone CSS and DOM runtime.</p>
      </a>
    </section>

    <section className="marketing-section" data-reveal aria-labelledby="enterprise-title">
      <div className="marketing-section-intro">
        <span className="label">Application primitives</span>
        <h2 id="enterprise-title">Built for production workflows</h2>
        <a href="#/components/table" className="marketing-link">Inspect table &amp; form APIs <Icon name="arrow-right" /></a>
      </div>
      <div className="marketing-capabilities">
        {capabilities.map(({ icon, title, detail }) => (
          <article key={title} className="marketing-capability">
            <Icon name={icon} size={20} />
            <h3>{title}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    </section>

    <WorkflowSection />

    <section className="marketing-section" aria-labelledby="theme-story" data-reveal>
      <div className="marketing-section-intro">
        <span className="label">Theming</span>
        <h2 id="theme-story">Choose the right appearance</h2>
        <a href="#/theming" className="marketing-link">Read the theme guide <Icon name="arrow-right" /></a>
      </div>
      <div className="marketing-appearances">
        <p>Switch seamlessly across Night, Paper, Glass, Trading, Terminal, High Contrast, and more. Every surface shares the same component APIs and verified contrast ratios.</p>
        <div>{themes.map(({ id: theme, label }) =>
          <a key={theme} href={`#/showcase?theme=${theme}`} className="marketing-appearance">
            <span data-theme={theme} aria-hidden="true"><i /></span>{label}<Icon name="arrow-up-right" size={14} />
          </a>)}</div>
      </div>
    </section>

    <section className="marketing-section" aria-labelledby="icon-story" data-reveal>
      <div className="marketing-section-intro">
        <span className="label">Icons</span>
        <h2 id="icon-story">From toolbar to feature artwork</h2>
        <a href="#/icons" className="marketing-link">Explore {iconManifest.length} icons <Icon name="arrow-right" /></a>
      </div>
      <div>
        <div className="marketing-icon-samples" aria-hidden="true">
          <Icon name="table" size={32} />
          <Icon name="settings" variant="filled" size={36} />
          <Icon name="palette" variant="duotone" size={48} />
          <Icon name="rocket" variant="2.5d" hue="violet" size={72} />
          <Icon name="database" variant="3d" hue="teal" size={88} />
        </div>
        <p>Use line icons in dense controls, duotone in feature cards, and 2.5D/3D soft-clay artwork in empty states and onboarding—all with live palette selection.</p>
      </div>
    </section>
  </article>;
}
