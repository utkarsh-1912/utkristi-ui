import { useEffect, useRef } from 'react';
import { Badge, Button, Icon } from '@utkristi/ui';
import { blockPages, componentPages } from './examples';

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

export function WorkflowSection() {
  return <section className="marketing-band" data-reveal aria-labelledby="workflow-title">
    <div className="marketing-section-head"><div><span className="label">Start with a working screen</span><h2 id="workflow-title">Skip the blank page.</h2></div>
      <Button href="#/blocks" variant="ghost" iconRight={<Icon name="arrow-up-right" />}>Browse all blocks</Button></div>
    <div className="marketing-workflows">{blockPages.map(([slug, block], index) => <a key={slug} href={`#/blocks/${slug}`} className="marketing-workflow">
      <span className="label">0{index + 1} / {block.category}</span>
      <strong>{block.name}</strong><span>{block.description}</span><Icon name="arrow-up-right" />
    </a>)}</div>
  </section>;
}

const projects = [
  { name: 'Design system', team: 'Studio', status: 'In progress', icon: 'layers' },
  { name: 'Product website', team: 'Growth', status: 'In review', icon: 'globe' },
  { name: 'Partner launch', team: 'Operations', status: 'Planned', icon: 'rocket' },
] as const;

function WorkspacePreview() {
  return <div className="marketing-stage" data-theme="dark" aria-label="Example workspace">
    <div className="marketing-stage-head"><span className="label"><Icon name="layers" /> UI in practice</span><span className="label">01 / Workspace</span></div>
    <div className="marketing-stage-card">
      <div className="marketing-stage-top"><div><span className="label">Workspace / Studio</span><strong>Projects</strong></div><Badge tone="ok">Live</Badge></div>
      <div className="marketing-stage-list">{projects.map(({ name, team, status, icon }) => <div key={name} className="marketing-stage-row">
        <span className="marketing-stage-icon"><Icon name={icon} /></span><span><strong>{name}</strong><small>{team}</small></span><span className="marketing-stage-status">{status}</span>
      </div>)}</div>
      <a className="marketing-stage-link" href="#/blocks/project-directory">Try the project directory <Icon name="arrow-up-right" /></a>
    </div>
    <div className="marketing-stage-foot"><span>Same components. Three themes.</span><span className="marketing-stage-swatches" aria-hidden="true"><i /><i /><i /></span></div>
  </div>;
}

export function MarketingHome() {
  const motion = useMarketingMotion();
  return <article ref={motion} className="marketing-home">
    <section className="marketing-hero" aria-labelledby="marketing-title">
      <div className="marketing-hero-copy">
        <span className="label marketing-eyebrow"><Icon name="utkristi-mark" /> Utkristi UI</span>
        <h1 className="display" id="marketing-title">Make every app <span>feel like Utkristi.</span></h1>
        <p>Build consistent products across the ecosystem with accessible components, working layouts, and three themes that share the same design tokens.</p>
        <div className="marketing-actions">
          <Button href="#/getting-started" iconRight={<Icon name="arrow-right" />}>Get started</Button>
          <Button href="#/components/button" variant="ghost">Explore components</Button>
        </div>
      </div>
      <WorkspacePreview />
    </section>
    <section className="marketing-facts" aria-label="Library at a glance" data-reveal>
      <div><strong>{componentPages.length}</strong><span>Component pages</span></div>
      <div><strong>3</strong><span>Built-in themes</span></div>
      <div><strong>{blockPages.length}</strong><span>Interactive blocks</span></div>
      <div><strong>React + CSS</strong><span>With a Tailwind preset</span></div>
    </section>
    <WorkflowSection />
    <section className="marketing-band" aria-labelledby="theme-story" data-reveal>
      <div className="marketing-section-head"><div><span className="label">Theme system</span><h2 id="theme-story">One kit. Three moods.</h2></div>
        <Button href="#/theming" variant="ghost" iconRight={<Icon name="arrow-up-right" />}>Explore theming</Button></div>
      <div className="marketing-themes">{[
        ['dark', 'Night', 'Warm ink and soft blue for focused work.'],
        ['light', 'Paper', 'Cool whites and clear contrast for everyday use.'],
        ['glass', 'Glass', 'Lilac surfaces, charcoal controls, and lime accents.'],
      ].map(([theme, label, description]) => <div key={theme} data-theme={theme} className="marketing-theme">
        <span className="label">{label}</span><strong>{description}</strong><span className="marketing-theme-dot" />
      </div>)}</div>
    </section>
    <section className="marketing-band marketing-cta" data-reveal>
      <div><span className="label">Try before you install</span><h2>Change it. Run it. Make it yours.</h2>
        <p>Edit a working example and switch themes live in the sandbox.</p></div>
      <Button href="#/sandbox" iconRight={<Icon name="arrow-up-right" />}>Open sandbox</Button>
    </section>
  </article>;
}
