import { ArrowUpRight } from 'lucide-react';
import { Button, Code, Tabs } from '@utkristi/ui';
import { api, examples as sampleSources } from 'virtual:utkristi-examples';
import { CopyCode } from './CopyCode';

export default function ComponentReference({ slug, html }: { slug: string; html: string }) {
  const sample = sampleSources[slug];
  const reactExample = sample.code;
  const tailwindExample = html.replace(/class="([^"]+)"/, 'class="$1 p-0"');
  return <>
    <div className="example-source">
      <div className="doc-section-head"><div><span className="label">Implementation</span><h2>Use in your app</h2></div>
        <Button href={`#/sandbox?component=${slug}`} variant="ghost" iconRight={<ArrowUpRight size={16} />}>Open sandbox</Button></div>
      <Tabs label="Usage examples" items={[
        { id: 'tailwind', label: 'Tailwind', content: <><p className="muted">Use utilities such as <Code inline>p-0</Code> to override component padding. Interactive examples use the React component or your own event handlers.</p><CopyCode text={tailwindExample} /></> },
        { id: 'css', label: 'Plain CSS', content: <><p className="muted">Import <Code inline>@utkristi/ui/utkristi-ui.css</Code> before using these classes. Use native controls or add behavior where needed.</p><CopyCode text={html} /></> },
        { id: 'react', label: 'React', content: <><p className="muted">Install the kit and import its stylesheet once in your app. This example includes its data and theme providers.</p><CopyCode text={reactExample} /></> },
      ]} />
    </div>
    <ComponentApi components={sample.components} />
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

