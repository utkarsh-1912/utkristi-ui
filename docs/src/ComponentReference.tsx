import { ArrowUpRight } from 'lucide-react';
import { Button, Code, Tabs } from '@utkristi/ui';
import { api, examples as sampleSources } from 'virtual:utkristi-examples';
import { CopyCode } from './CopyCode';
import enterpriseStyles from './enterprise.css?raw';
import { exampleMotion } from './motion-options';

export default function ComponentReference({ slug, html }: { slug: string; html: string }) {
  const sample = sampleSources[slug];
  const reactExample = sample?.code;
  const template = slug === 'enterprise-landing' || slug === 'execution-desk';
  return <>
    <div className="example-source">
      <div className="doc-section-head"><div><span className="label">Implementation</span><h2>Use in your app</h2></div>
        <Button href={`#/sandbox?component=${slug}`} variant="ghost" iconRight={<ArrowUpRight size={16} />}>Open sandbox</Button></div>
      <Tabs label="Usage examples" defaultValue="react" items={[
        { id: 'css', label: 'HTML / CSS / JS', content: <><p className="muted">Place the stylesheet and runtime beside the HTML file. The script activates controls marked with <Code inline>data-ut-*</Code>.</p>
          <div className="sample-row">
            <a className="link" href={`${import.meta.env.BASE_URL}utkristi-ui.css`} download>Download stylesheet</a>
            <a className="link" href={`${import.meta.env.BASE_URL}utkristi-dom.js`} download>Download runtime</a>
          </div>
          <CopyCode text={`<link rel="stylesheet" href="./utkristi-ui.css">\n<script src="./utkristi-dom.js"></script>\n<div data-ut-motion="${exampleMotion(slug)}" data-ut-enter>\n${html}\n</div>\n<script>UtkristiDOM.initUI(document);</script>`} language="HTML / CSS / JS" /></> },
        { id: 'react', label: 'React', content: reactExample
          ? <><p className="muted">Install the kit and import its stylesheet once in your app. This example includes its data and theme providers.</p>
            {template && <p className="muted">Copy the stylesheet from the Layout CSS tab and import it beside this example.</p>}
            <CopyCode text={reactExample} language="TSX" /></>
          : <p className="muted">The React example is temporarily unavailable. See the HTML tab for the markup.</p> },
        { id: 'motion', label: 'Motion', content: <><p className="muted">Choose fade, rise, scale, slide, or none. The scope also sets the entry motion for supported overlays inside it.</p>
          <CopyCode text={`<div data-ut-motion="${exampleMotion(slug)}" data-ut-enter>\n  {/* Place the component here. */}\n</div>`} language="TSX" /></> },
        ...(template ? [{ id: 'layout-css', label: 'Layout CSS', content: <CopyCode text={enterpriseStyles} language="CSS" /> }] : []),
      ]} />
    </div>
    {slug === 'data-table' && <section className="example-source">
      <h2>Server-backed tables</h2>
      <p>Pass the current page in <Code inline>rows</Code>, a stable <Code inline>getRowKey</Code>, and
        the full matching count in <Code inline>remote.totalRows</Code>. The table sends one-based page changes, queries,
        and sorting through <Code inline>remote.onStateChange</Code>. Set <Code inline>sortable</Code> on server-sortable columns.</p>
      <p>Keep request cancellation and error handling in your data layer. Keep the last result during a refresh,
        reset the page when app filters change, and provide a retry callback for recoverable errors.</p>
      <Button href="#/blocks/project-worklist" variant="ghost">Try the project worklist</Button>
    </section>}
    {sample && <ComponentApi components={sample.components} />}
  </>;
}

function ComponentApi({ components }: { components: string[] }) {
  return <section className="component-api" aria-label="API reference">
    <h2>API reference</h2>
    <p className="muted">The tables list kit-specific props. Components also forward their supported HTML attributes.</p>
    {components.map((name) => <details key={name}>
      <summary>{name}</summary>
      {api[name]?.length ? <div className="table-wrap"><table className="table api-table"><thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Required</th></tr></thead>
        <tbody>{api[name].map((prop) => <tr key={prop.name}><th scope="row"><Code inline>{prop.name}</Code></th><td><code>{prop.type}</code>{prop.description && <p>{prop.description}</p>}</td><td>{prop.required ? "Yes" : "Optional"}</td></tr>)}</tbody>
      </table></div> : <p className="muted">Uses standard HTML attributes and children.</p>}
    </details>)}
  </section>;
}

