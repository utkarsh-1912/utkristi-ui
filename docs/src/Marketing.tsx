import { useEffect, useRef, useState } from 'react';
import { Button, Icon, iconManifest, themes } from '@utkristi/ui';
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
  return <figure className="marketing-stage"><figcaption><Icon name="layers" size={17} /> Component studio <span>Interactive</span></figcaption>
    <div className="marketing-stage-body"><span className="label">One API. Different intentions.</span><strong>Make it fit your product.</strong>
      <div className="marketing-variant-options">{(['solid','outlined','dashed','filled','text','link'] as const).map(value => <button key={value} aria-pressed={value === variant} onClick={() => setVariant(value)}>{value}</button>)}</div>
      <Button variant={variant} iconRight={<Icon name="arrow-right" />}>Explore the library</Button>
      <code>{'<Button variant="' + variant + '">Explore the library</Button>'}</code>
    </div></figure>;
}

export function MarketingHome() {
  const motion = useMarketingMotion();
  return <article ref={motion} className="marketing-home">
    <section className="marketing-hero" aria-labelledby="marketing-title">
      <div className="marketing-hero-copy">
        <span className="label">Utkristi UI</span>
        <h1 id="marketing-title">A design system for Utkristi.</h1>
        <p>Build the tools your teams use every day. Start with typed components, explore working variants, and compose an interface for your product.</p>
        <div className="marketing-actions">
          <Button href="#/getting-started" iconRight={<Icon name="arrow-right" />}>Get started</Button>
          <a href="#/components/button" className="marketing-link">Explore components</a>
        </div>
      </div>
      <ReleasePreview />
    </section>
    <section className="marketing-paths" aria-label="Start building">
      <a href="#/components/button"><Icon name="layers" /><h2>Choose a component</h2><p>Explore usage examples, props, and source together.</p></a>
      <a href="#/sandbox"><Icon name="code" /><h2>Make it yours</h2><p>Edit React or HTML, CSS, and JavaScript in a live sandbox.</p></a>
      <a href="#/frameworks"><Icon name="terminal" /><h2>Bring it to your stack</h2><p>Use the React package or standalone styles and DOM runtime.</p></a>
    </section>
    <WorkflowSection />
    <section className="marketing-section" aria-labelledby="theme-story" data-reveal>
      <div className="marketing-section-intro"><span className="label">Theming</span>
        <h2 id="theme-story">Choose the right appearance</h2>
        <a href="#/theming" className="marketing-link">Read the theme guide <Icon name="arrow-right" /></a>
      </div>
      <div className="marketing-appearances"><p>Choose a palette for your product and a workspace layout for the way people use it. Compact icon rails, command tabs, studio tools, and office navigation share the same component APIs.</p>
        <div>{themes.map(({ id: theme, label }) =>
          <a key={theme} href={`#/showcase?theme=${theme}`} className="marketing-appearance">
            <span data-theme={theme} aria-hidden="true"><i /></span>{label}<Icon name="arrow-up-right" size={14} />
          </a>)}</div>
      </div>
    </section>
    <section className="marketing-section" aria-labelledby="icon-story" data-reveal>
      <div className="marketing-section-intro"><span className="label">Icons</span>
        <h2 id="icon-story">From toolbar to feature artwork</h2>
        <a href="#/icons" className="marketing-link">Explore {iconManifest.length} icons <Icon name="arrow-right" /></a>
      </div>
      <div>
        <div className="marketing-icon-samples" aria-hidden="true">
          <Icon name="table" size={32} /><Icon name="settings" variant="filled" size={36} />
          <Icon name="palette" variant="duotone" size={48} />
          <Icon name="rocket" variant="2.5d" hue="violet" size={72} />
          <Icon name="database" variant="3d" hue="teal" size={88} />
        </div>
        <p>Use line icons in dense controls, duotone in feature cards, and dimensional artwork in empty states and onboarding. The catalog includes searchable company marks and live color controls.</p>
      </div>
    </section>
  </article>;
}
