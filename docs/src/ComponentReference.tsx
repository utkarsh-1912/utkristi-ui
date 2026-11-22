import { ArrowUpRight } from 'lucide-react';
import { Button, Code, Tabs } from '@utkristi/ui';
import { api, examples as sampleSources } from 'virtual:utkristi-examples';
import { CopyCode } from './CopyCode';
import enterpriseStyles from './enterprise.css?raw';
import { exampleMotion } from './motion-options';
import { splitWebSource } from './sandbox-source';

export default function ComponentReference({ slug, html, showApi = true }: { slug: string; html: string; showApi?: boolean }) {
  const sample = sampleSources[slug];
  const reactExample = sample?.code;
  const template = slug === 'enterprise-landing' || slug === 'execution-desk';
  const web = splitWebSource(html, true);
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
          <Tabs label="Web source files" items={[
            { id: 'html-file', label: 'HTML', content: <CopyCode text={`<link rel="stylesheet" href="./utkristi-ui.css">\n<link rel="stylesheet" href="./example.css">\n<script src="./utkristi-dom.js" defer></script>\n<script src="./example.js" defer></script>\n${web.html}`} language="HTML" /> },
            { id: 'css-file', label: 'CSS', content: <CopyCode text={web.css || '/* Uses the shared utkristi-ui.css stylesheet. */'} language="CSS" /> },
            { id: 'js-file', label: 'JavaScript', content: <CopyCode text={`${web.js}\nUtkristiDOM.initUI(document);`.trim()} language="JavaScript" /> },
          ]} /></> },
        { id: 'react', label: 'React', content: reactExample
          ? <><p className="muted">Install the kit and use the example with its stylesheet and providers.</p>
            {template && <p className="muted">Copy the stylesheet from the Layout CSS tab and import it beside this example.</p>}
            <CopyCode text={reactExample} language="TSX" /></>
          : <p className="muted">The React example is temporarily unavailable. See the HTML tab for the markup.</p> },
        { id: 'motion', label: 'Motion', content: <><p className="muted">Choose fade, rise, scale, slide, or none. The scope also sets the entry motion for supported overlays inside it.</p>
          <CopyCode text={`<div data-ut-motion="${exampleMotion(slug)}" data-ut-enter>\n  {/* Place the component here. */}\n</div>`} language="TSX" /></> },
        ...(['popover', 'menu', 'tooltip'].includes(slug) ? [{ id: 'native', label: 'Native HTML', content: <>
          <p><strong>Zero JavaScript</strong> {slug === 'tooltip' ? 'for a short description that appears on hover and keyboard focus.'
            : 'in browsers with the Popover API. Anchor positioning places the popup beside its trigger when supported.'}</p>
          <CopyCode language="HTML" text={slug === 'tooltip'
            ? '<button class="btn btn-ghost" type="button" data-tip="Copy the release URL" aria-label="Copy release URL">Copy link</button>'
            : `<button class="btn btn-ghost" type="button" popovertarget="release-details">Release details</button>
<div id="release-details" class="menu ut-html-popover" popover aria-label="Release details">
  <p>Version 4.2 is ready to review.</p>
  <a class="link" href="/releases/4.2">Read the release notes</a>
</div>`} />
          {slug !== 'tooltip' && <p className="muted">For browsers without the Popover API, use a details disclosure or the React component with its placement fallback.</p>}
        </> }] : []),
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
      <p>Set <Code inline>pageSizeOptions</Code> to let users choose a page size. Fetch using the emitted
        <Code inline>state.pageSize</Code> when present. Use <Code inline>columnVisibility</Code> for saved views,
        <Code inline>hideable=false</Code> for identifying columns, and <Code inline>labels</Code> for translations.</p>
      <Button href="#/blocks/project-worklist" variant="ghost">Try the project worklist</Button>
    </section>}
    {sample && showApi && <ComponentApi components={sample.components} />}
  </>;
}

function ComponentApi({ components }: { components: string[] }) {
  return <section className="component-api" aria-label="API reference">
    <h2>API reference</h2>
    <p className="muted">The tables list kit-specific props. Components also forward their supported HTML attributes.</p>
    {components.map((name) => <details key={name}>
      <summary>{name}</summary>
      {api[name]?.length ? <div className="table-wrap"><table className="table api-table"><thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Required</th></tr></thead>
        <tbody>{api[name].map((prop) => <tr key={prop.name}><th scope="row"><Code inline>{prop.name}</Code></th><td><code>{prop.type}</code>{prop.description && <p>{prop.description}</p>}</td><td><code>{prop.defaultValue ?? '—'}</code></td><td>{prop.required ? "Yes" : "Optional"}</td></tr>)}</tbody>
      </table></div> : <p className="muted">Uses standard HTML attributes and children.</p>}
    </details>)}
  </section>;
}

