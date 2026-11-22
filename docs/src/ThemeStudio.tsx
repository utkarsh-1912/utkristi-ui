import { useMemo, useState } from 'react';
import { Button, Field, Input, Select, Tabs } from '@utkristi/ui';
import { createTheme, toCSS, tokensToDTCG2025, tokensToTokensStudio, toTailwindV4 } from '../../src/react/theme-engine/index';
import { blocks } from './blocks';
import { examples } from './examples';
import { CopyCode } from './CopyCode';
import { studioSettings } from './studio-settings';

export default function ThemeStudio() {
  const [settings, setSettings] = useState(() => new URLSearchParams(location.hash.split('?')[1]));
  const options = studioSettings(settings);
  const theme = useMemo(() => createTheme(studioSettings(settings)), [settings]);
  const css = toCSS(theme);
  const dtcg = JSON.stringify(tokensToDTCG2025({ [theme.name]: theme.tokens }), null, 2);
  const presets = new URLSearchParams({ brand: options.brand, scheme: options.scheme!, contrast: options.contrast!,
    radius: String(options.radius!.card), density: options.density! });
  const sandbox = new URLSearchParams(presets);
  sandbox.set('component', 'workspace');

  function change(key: string, value: string) {
    const next = new URLSearchParams(presets);
    next.set(key, value);
    history.replaceState(history.state, '', `#/theme-studio?${next}`);
    setSettings(next);
  }
  function download() {
    const url = URL.createObjectURL(new Blob([dtcg], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'studio.tokens.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
  const previews = [['project-worklist', 'Project worklist', blocks['project-worklist'].preview],
    ['workspace', 'Workspace', examples.workspace.preview], ['conversation', 'Conversation', examples['message-scroller'].preview]] as const;
  return <section className="page theme-studio">
    <style>{css}</style>
    <h1>Theme Studio</h1>
    <p>Generate a theme from a brand colour, preview it with real components, and export the tokens.</p>
    <div className="theme-studio-controls">
      <Field label="Brand colour"><Input type="color" value={options.brand} onChange={(event) => change('brand', event.target.value)} /></Field>
      <Field label="Scheme"><Select value={options.scheme} onChange={(event) => change('scheme', event.target.value)}><option value="dark">Dark</option><option value="light">Light</option></Select></Field>
      <Field label="Contrast"><Select value={options.contrast} onChange={(event) => change('contrast', event.target.value)}><option>AA</option><option>AAA</option></Select></Field>
      <Field label={`Radius (${options.radius!.card}px)`}><Input type="range" min={0} max={32} value={options.radius!.card} onChange={(event) => change('radius', event.target.value)} /></Field>
      <Field label="Density"><Select value={options.density} onChange={(event) => change('density', event.target.value)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></Select></Field>
    </div>
    <div className="sample-row">
      <Button onClick={download}>Download JSON</Button>
      <Button variant="ghost" href={`#/sandbox?${sandbox}`}>Open in sandbox</Button>
    </div>
    <div className={`theme-studio-preview theme-canvas ${theme.scheme}`} data-theme="studio">
      <Tabs label="Theme preview" items={previews.map(([id, label, Preview]) => ({ id, label, content: <Preview /> }))} />
    </div>
    <h2>Contrast report</h2>
    <p role="status">{theme.report.filter(({ pass }) => pass).length} of {theme.report.length} checks pass.</p>
    <div className="table-wrap"><table className="table"><thead><tr><th scope="col">Token pair</th><th scope="col">WCAG ratio</th><th scope="col">Required</th><th scope="col">APCA Lc</th><th scope="col">Result</th></tr></thead>
      <tbody>{theme.report.map(({ pair, ratio, target, pass, lc }, index) => <tr key={`${pair}-${index}`}><th scope="row">{pair}</th><td>{ratio}:1</td><td>{target}:1</td><td>{lc}</td><td>{pass ? 'Pass' : 'Fail'}</td></tr>)}</tbody></table></div>
    <h2>Export</h2>
    <Tabs label="Theme exports" items={[
      { id: 'css', label: 'CSS', content: <CopyCode text={css} language="CSS" /> },
      { id: 'tailwind', label: 'Tailwind 4', content: <CopyCode text={toTailwindV4(theme)} language="CSS" /> },
      { id: 'dtcg', label: 'DTCG JSON', content: <CopyCode text={dtcg} language="JSON" /> },
      { id: 'figma', label: 'Tokens Studio', content: <CopyCode text={JSON.stringify(tokensToTokensStudio(theme.name, theme.tokens), null, 2)} language="JSON" /> },
    ]} />
  </section>;
}
