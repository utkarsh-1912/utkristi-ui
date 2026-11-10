import type { ReactNode } from 'react';
import { Button, Code, Icon } from '@utkristi/ui';
import license from '../../LICENSE?raw';

const repository = 'https://github.com/utkarsh-1912/utkristi-ui';

function SiteInfo({ title, label, description, children }: {
  title: string;
  label: string;
  description: string;
  children: ReactNode;
}) {
  return <article className="doc-article site-info">
    <header className="doc-title">
      <span className="label">{label}</span>
      <h1 className="display display-xl">{title}</h1>
      <p className="lede">{description}</p>
    </header>
    {children}
  </article>;
}

export function About() {
  return <SiteInfo title="About" label="The project"
    description="Utkristi UI is the shared design system for the Utkristi ecosystem.">
    <h2>What’s included</h2>
    <p>The kit brings together React components, a standalone stylesheet, design tokens, an icon library, and a Tailwind preset.
      Night, Paper, and Glass use the same component APIs. Signal, Ledger, and Terminal add scoped accent and shape presets.</p>
    <h2>Learn by building</h2>
    <p>Browse components and complete layouts, then open an example in the sandbox to edit its source and try it in a different appearance.</p>
    <div className="sample-row">
      <Button href="#/components/button" iconRight={<Icon name="arrow-right" />}>Browse components</Button>
      <Button href="#/sandbox" variant="quiet">Open sandbox</Button>
    </div>
    <h2>Source and contributions</h2>
    <p>Read the source, report a bug, or suggest an improvement in the <a className="link" href={repository}>Utkristi UI repository</a>.</p>
  </SiteInfo>;
}

export function Terms() {
  return <SiteInfo title="Terms" label="Site information"
    description="How the Utkristi UI package and documentation examples are provided.">
    <h2>Using the kit</h2>
    <p>The Utkristi UI package and associated documentation are distributed under the MIT License. The license permits use,
      modification, and distribution subject to its notice requirements.</p>
    <h2>Interactive examples</h2>
    <p>Examples are provided for evaluation and learning. The execution desk uses simulated orders, and example forms and workflows
      are demonstrations. Review and test any code you copy before using it in your application.</p>
    <h2>MIT License</h2>
    <Code>{license.trim()}</Code>
  </SiteInfo>;
}

export function Privacy() {
  return <SiteInfo title="Privacy" label="Site information"
    description="How this documentation site handles browser preferences, sandbox drafts, and requests.">
    <h2>Data stored in your browser</h2>
    <p>The docs save your appearance and icon palette in local storage. The sandbox saves supported drafts on this device,
      separately for each example and editor mode. Session storage records whether the app has already tried to reload after a missing bundle.</p>
    <h2>Sandbox and clipboard</h2>
    <p>The sandbox compiles and previews your edits in your browser. The docs do not send your draft to a server to run it.
      Copy controls write the selected example to your clipboard when you click them.</p>
    <h2>Hosting and fonts</h2>
    <p>Vercel delivers the hosted site and may process request information such as your IP address. Your browser may also contact Google Fonts
      to download typefaces. See the <a className="link" href="https://vercel.com/legal/privacy-notice">Vercel Privacy Notice</a> and{' '}
      <a className="link" href="https://fonts.google.com/faq">Google Fonts FAQ</a> for provider details.</p>
    <h2>Your choices</h2>
    <p>Use Reset in the sandbox to remove the current draft. You can also clear this site’s stored data in your browser,
      which removes saved drafts and preferences from that browser.</p>
    <p>For general questions about the docs, use the <a className="link" href={repository + '/issues'}>project issue tracker</a>.
      Issues are public.</p>
  </SiteInfo>;
}
