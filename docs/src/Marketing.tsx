import { useEffect, useRef } from 'react';
import { Button, Icon } from '@utkristi/ui';
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
  ['enterprise-landing', 'Marketing', 'A product landing page with a release preview and demo request.'],
  ['project-directory', 'Operations', 'A searchable directory with editing and bulk actions.'],
  ['execution-desk', 'Trading', 'An order blotter with linked routes and fills.'],
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
  return <figure className="marketing-stage">
    <figcaption><Icon name="layers" size={17} /> Release workspace <span>Example</span></figcaption>
    <div className="marketing-stage-body">
      <span className="label">Release 24.08</span>
      <strong>Ready to promote</strong>
      <ul>{['Build verified', 'Access review complete', 'Rollback tested'].map((item) =>
        <li key={item}><Icon name="check" size={16} />{item}</li>)}</ul>
    </div>
  </figure>;
}

export function MarketingHome() {
  const motion = useMarketingMotion();
  return <article ref={motion} className="marketing-home">
    <section className="marketing-hero" aria-labelledby="marketing-title">
      <div className="marketing-hero-copy">
        <span className="label">Utkristi UI</span>
        <h1 id="marketing-title">A design system for Utkristi.</h1>
        <p>Build apps and websites with shared components, working layouts, and a theme that fits your product.</p>
        <div className="marketing-actions">
          <Button href="#/getting-started" iconRight={<Icon name="arrow-right" />}>Get started</Button>
          <a href="#/components/button" className="marketing-link">Explore components</a>
        </div>
      </div>
      <ReleasePreview />
    </section>
    <WorkflowSection />
    <section className="marketing-section" aria-labelledby="theme-story" data-reveal>
      <div className="marketing-section-intro"><span className="label">Theming</span>
        <h2 id="theme-story">Choose the right appearance</h2>
        <a href="#/theming" className="marketing-link">Read the theme guide <Icon name="arrow-right" /></a>
      </div>
      <div className="marketing-appearances"><p>Try the same workspace in Night, Paper, or Glass.</p>
        <div>{[['dark', 'Night'], ['light', 'Paper'], ['glass', 'Glass']].map(([theme, label]) =>
          <a key={theme} href={`#/showcase?theme=${theme}`} className="marketing-appearance">
            <span data-theme={theme} aria-hidden="true"><i /></span>{label}<Icon name="arrow-up-right" size={14} />
          </a>)}</div>
      </div>
    </section>
  </article>;
}
