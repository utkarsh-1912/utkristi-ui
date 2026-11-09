import { useEffect, useId, useRef, useState } from 'react';
import { Button, Icon, Kbd, Select, type ResolvedTheme, useTheme } from '@utkristi/ui';
import { CopyAction } from './CopyCode';
import { SourceEditor } from './SourceEditor';
import { blockPages, componentPages, examplePage, sandboxExamples as previews } from './examples';
import { variants, variantSets } from './variants';
import { examples } from 'virtual:utkristi-examples';
import { script, styles } from 'virtual:utkristi-runtime';

const policy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src data: blob:; media-src data: blob:; font-src data: https://fonts.gstatic.com; form-action 'none'; base-uri 'none'";
const frameHead = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta http-equiv="Content-Security-Policy" content="' + policy + '"><style>' +
  styles.replace(/<\/style/gi, '<\\/style') +
  'body{padding:16px;min-height:100vh}#playground{min-width:0}.sample-row{display:flex;flex-wrap:wrap;gap:8px}</style></head>';
const reactFrame = frameHead + '<body><div id="playground"></div><script>' + script.replace(/<\/script/gi, '<\\/script') + '</script></body></html>';

const specimenFonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&amp;family=Geist:wght@400..800&amp;family=Inter:wght@400;500;600;700&amp;family=Manrope:wght@400..800&amp;family=Newsreader:opsz,wght@6..72,400..700&amp;display=swap">';

interface Run { token: string; source: string; theme: ResolvedTheme; markup: boolean }
type Mode = 'react' | 'html';

function draftKey(slug: string, mode: Mode) { return `utkristi-sandbox:v1:${slug}:${mode}`; }
function readDraft(slug: string, mode: Mode, initial: string) {
  try { return localStorage.getItem(draftKey(slug, mode)) ?? initial; } catch { return initial; }
}

export default function Playground({ component }: { component?: string }) {
  const { resolvedTheme } = useTheme();
  const id = useId();
  const [viewport, setViewport] = useState<'fluid' | 'phone' | 'tablet'>('fluid');
  const [pane, setPane] = useState<'source' | 'preview'>('source');
  const slug = component && Object.hasOwn(previews, component) && Object.hasOwn(examples, component)
    ? component as keyof typeof previews : 'carousel';
  const example = previews[slug];
  const docs = examplePage(slug);
  const [theme, setTheme] = useState<ResolvedTheme>(resolvedTheme);
  const [mode, setMode] = useState<Mode>('react');
  const [reactCode, setReactCode] = useState(() => readDraft(slug, 'react', examples[slug].code));
  const [htmlCode, setHtmlCode] = useState(() => readDraft(slug, 'html', example.html));
  const [run, setRun] = useState<Run>();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [executed, setExecuted] = useState({ code: '', mode: 'react' as Mode });
  const iframe = useRef<HTMLIFrameElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const previewHeading = useRef<HTMLSpanElement>(null);
  const requested = useRef(0);
  const code = mode === 'react' ? reactCode : htmlCode;
  const initialSource = mode === 'react' ? examples[slug].code : example.html;
  const filename = slug + (mode === 'react' ? '.tsx' : '.html');
  function update(next: string) {
    (mode === 'react' ? setReactCode : setHtmlCode)(next);
    try {
      const key = draftKey(slug, mode);
      if (next === initialSource || next.length > 200_000) localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    } catch { /* Editing remains available without storage. */ }
  }
  const last = useRef({ code, mode, theme });
  last.current = { code, mode, theme };

  const compiler = useRef<Worker | null>(null);
  function compile(source: string, language: 'react' | 'html', previewTheme: ResolvedTheme) {
    const token = String(++requested.current);
    setExecuted({ code: source, mode: language });
    setError('');
    setStatus('');
    if (language === 'html') {
      setRun({ token, source, theme: previewTheme, markup: true });
      setStatus('HTML preview ready');
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      const worker = compiler.current ??= new Worker(new URL('./compile.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event: MessageEvent<{ token: string; code?: string; error?: string }>) => {
        if (event.data.token !== token || token !== String(requested.current)) return;
        setBusy(false);
        if (event.data.error || event.data.code === undefined) { setError(event.data.error ?? 'The compiler produced no code.'); return; }
        setRun({ token, source: event.data.code, theme: previewTheme, markup: false });
      };
      worker.onerror = (event) => {
        if (token !== String(requested.current)) return;
        setError(event.message || 'The preview compiler could not start.');
        setBusy(false);
        worker.terminate();
        compiler.current = null;
      };
      worker.postMessage({ token, source });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  }

  useEffect(() => {
    const initial = last.current;
    void compile(initial.code, initial.mode, initial.theme);
    const pending = requested;
    const activeCompiler = compiler;
    return () => { pending.current++; activeCompiler.current?.terminate(); activeCompiler.current = null; };
  }, []);

  useEffect(() => {
    function message(event: MessageEvent) {
      if (event.source !== iframe.current?.contentWindow || event.data?.token !== String(requested.current)) return;
      if (event.data?.kind === 'utkristi-preview-ready') setStatus('React preview ready');
      if (event.data?.kind === 'utkristi-preview-error') { setError(String(event.data.error)); setStatus(''); }
    }
    window.addEventListener('message', message);
    return () => window.removeEventListener('message', message);
  }, []);

  const previewDocument = run?.markup ? frameHead.replace('<html>', '<html data-theme="' + run.theme + '">') + '<body>' + run.source + '</body></html>' : reactFrame;

  function changeMode(next: Mode) {
    setMode(next);
    void compile(next === 'react' ? reactCode : htmlCode, next, theme);
  }

  function runExample() {
    setPane('preview');
    void compile(code, mode, theme);
    if (window.matchMedia('(max-width: 900px)').matches) {
      window.requestAnimationFrame(() => previewHeading.current?.focus());
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <article className="doc-article playground">
    <header className="doc-title"><span className="label">Build and test</span>
      <h1 className="display display-xl">Sandbox</h1>
      <p className="lede">Edit a working example, run it in any theme, and copy the code into your app.</p>
    </header>
    <div className="playground-toolbar">
      <label htmlFor={id + "-component"}>Example<Select id={id + "-component"} value={slug} onChange={(event) => {
        window.location.hash = '/sandbox?' + new URLSearchParams({ component: event.target.value, theme });
      }}>
        <optgroup label="Components">{componentPages.map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}</optgroup>
        <optgroup label="Component variants">{componentPages.flatMap(([key, item]) => (variantSets[key] ?? []).map((variant) =>
          <option key={variant} value={variant}>{item.name} / {variants[variant].name}</option>))}</optgroup>
        <optgroup label="Blocks">{blockPages.map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}</optgroup>
      </Select></label>
      <label htmlFor={id + "-theme"}>Theme<Select id={id + "-theme"} value={theme} onChange={(event) => {
        const next = event.target.value as ResolvedTheme;
        setTheme(next);
        void compile(code, mode, next);
      }}><option value="dark">Night</option><option value="light">Paper</option><option value="glass">Glass</option></Select></label>
      <label htmlFor={id + "-mode"}>Editor<Select id={id + "-mode"} value={mode} onChange={(event) => changeMode(event.target.value as 'react' | 'html')}>
        <option value="react">React / TSX</option><option value="html">HTML / CSS / JS</option>
      </Select></label>
    </div>
    <div className="playground-panes" role="group" aria-label="Workspace view">
      <Button size="sm" variant="quiet" aria-pressed={pane === 'source'} onClick={() => setPane('source')}>Source</Button>
      <Button size="sm" variant="quiet" aria-pressed={pane === 'preview'} onClick={() => setPane('preview')}>Preview</Button>
    </div>
    <div className="playground-workspace" data-pane={pane}>
    <section className="playground-editor" aria-label="Source editor">
      <div className="playground-head"><label className="playground-filename" htmlFor="sandbox-source"><Icon name="code" size={16} />{filename}</label>
        <div className="playground-actions">
          <Button size="sm" variant="quiet" disabled={code === initialSource} onClick={() => {
            update(initialSource); void compile(initialSource, mode, theme);
          }}>Reset</Button>
          <CopyAction key={filename} value={code} onFailure={() => { editor.current?.focus(); editor.current?.select(); }} />
          <Button size="sm" variant="quiet" title="Download source" aria-label="Download source" onClick={download}><Icon name="download" size={16} /></Button>
          <Button size="sm" loading={busy} onClick={runExample} iconLeft={<Icon name="arrow-right" size={15} />}>Run</Button>
        </div>
      </div>
      <SourceEditor key={filename} input={editor} source={code} onChange={update} onRun={runExample} />
    </section>
    <section className="playground-result" aria-label="Preview">
      <div className="playground-head"><span className="label" ref={previewHeading} tabIndex={-1}>Live preview</span>
      <div className="playground-devices" role="group" aria-label="Preview width">
        {(['fluid', 'phone', 'tablet'] as const).map((device) => <Button key={device} size="sm" variant="quiet"
          aria-pressed={viewport === device} onClick={() => setViewport(device)}
          iconLeft={<Icon name={device === 'fluid' ? 'desktop' : device} />}>
          {device === 'fluid' ? 'Fit' : device === 'phone' ? 'Phone' : 'Tablet'}
        </Button>)}
      </div></div>
      <div className="playground-stage ut-scrollbar" data-viewport={viewport}>
      {run ? <iframe key={run.token} ref={iframe} data-preview-run={run.token} title={example.name + ' sandbox preview'} sandbox="allow-scripts"
        srcDoc={slug === 'typography' ? previewDocument.replace('</head>', specimenFonts + '</head>') : previewDocument}
        onLoad={() => {
          if (!run.markup) iframe.current?.contentWindow?.postMessage({
            kind: 'utkristi-preview', code: run.source, theme: run.theme, token: run.token,
          }, '*');
        }} /> : <p className="muted playground-loading">Preparing preview…</p>}
      </div>
      {error && <div role="alert" className="playground-error">{error}</div>}
      <div className="source-status"><span className="playground-run-status" role="status">{busy ? 'Compiling…' : status || (error ? 'Run failed' : 'Preparing preview…')}</span>
        <a className="link" href={docs.href}>{docs.label}</a></div>
    </section>
    </div>
    <p className="playground-help muted"><span>{executed.code !== code || executed.mode !== mode ? 'Source changed. Run to update the preview.' : 'Drafts are kept in this browser.'}</span>
      <span><Kbd>Ctrl / ⌘</Kbd> <Kbd>Enter</Kbd> Run example</span></p>
  </article>;
}
