import { useEffect, useId, useRef, useState } from 'react';
import { Button, Icon, Kbd, Loader, Select, type ResolvedTheme, useTheme } from '@utkristi/ui';
import { CopyAction } from './CopyCode';
import { SourceEditor } from './SourceEditor';
import { blockPages, componentPages, examplePage, sandboxExamples as previews } from './examples';
import { variants, variantSets } from './variants';
import { examples } from 'virtual:utkristi-examples';
import { script, styles, domScript } from 'virtual:utkristi-runtime';
import { exampleMotion, motionOptions, type PreviewMotion } from './motion-options';

const policy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src data: blob:; media-src data: blob:; font-src data: https://fonts.gstatic.com; form-action 'none'; base-uri 'none'";
const frameHead = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta http-equiv="Content-Security-Policy" content="' + policy + '"><style>' +
  styles.replace(/<\/style/gi, '<\\/style') +
  'body{padding:16px;min-height:100vh}#playground{min-width:0}.sample-row{display:flex;flex-wrap:wrap;gap:8px}</style></head>';
const previewLinks = `<script>
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (event.defaultPrevented || !link || link.hasAttribute('download')) return;
    event.preventDefault();
    const href = link.getAttribute('href');
    if (href.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView();
  });
</script>`;
const reactFrame = frameHead + '<body>' + previewLinks + '<div id="playground"></div><script>' + script.replace(/<\/script/gi, '<\\/script') + '</script></body></html>';

const specimenFonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&amp;family=Geist:wght@400..800&amp;family=Inter:wght@400;500;600;700&amp;family=Manrope:wght@400..800&amp;family=Newsreader:opsz,wght@6..72,400..700&amp;display=swap">';

interface Run { token: string; source: string; theme: ResolvedTheme; motion: PreviewMotion; markup: boolean }
type Mode = 'react' | 'html';
const legacyJavaScriptHint = '// Add JavaScript for this HTML example. The kit initializes automatically.';
const safeScript = (source: string) => source.replace(/<\/script/gi, '<\\/script');

function htmlDocument(source: string, theme: ResolvedTheme, motion: PreviewMotion, token?: string) {
  const report = token ? `<script>
    let previewFailed = false;
    window.previewReport = (kind, error) => {
      if (kind === 'utkristi-html-ready' && previewFailed) return;
      if (kind === 'utkristi-preview-error') previewFailed = true;
      parent.postMessage({kind, token: ${JSON.stringify(token)}, error}, '*');
    };
    addEventListener('error', event => previewReport('utkristi-preview-error', event.message));
    addEventListener('unhandledrejection', event => previewReport('utkristi-preview-error', String(event.reason)));
  </script>` : '';
  const ready = token ? "<script>previewReport('utkristi-html-ready');</script>" : '';
  const head = token ? frameHead : frameHead.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
  return head.replace('<html>', `<html data-theme="${theme}" data-ut-motion="${motion}">`) +
    '<body>' + report + (token ? previewLinks : '') + '<script>' + safeScript(domScript) + '</script><div data-ut-enter>' + source +
    '</div><script>UtkristiDOM.initUI(document);</script>' + ready + '</body></html>';
}

function draftKey(slug: string, mode: Mode) { return `utkristi-sandbox:${mode === 'html' ? 'v2' : 'v1'}:${slug}:${mode}`; }
function readDraft(slug: string, mode: Mode, initial: string) {
  try {
    const saved = localStorage.getItem(draftKey(slug, mode));
    if (saved !== null || mode !== 'html') return saved?.trim() ? saved : initial;
    const legacy = `utkristi-sandbox:v1:${slug}`;
    const savedMarkup = localStorage.getItem(legacy + ':html');
    const markup = savedMarkup?.trim() ? savedMarkup : initial;
    const javascript = localStorage.getItem(legacy + ':js')?.trim();
    return javascript && javascript !== legacyJavaScriptHint
      ? `${markup}\n<script>\n${safeScript(javascript)}\n</script>` : markup;
  } catch { return initial; }
}

export default function Playground({ component, editorMode, initialMotion }: { component?: string; editorMode?: string; initialMotion?: string }) {
  const { resolvedTheme } = useTheme();
  const id = useId();
  const [viewport, setViewport] = useState<'fluid' | 'phone' | 'tablet'>('fluid');
  const [pane, setPane] = useState<'source' | 'preview'>('source');
  const slug = component && Object.hasOwn(previews, component) && Object.hasOwn(examples, component)
    ? component as keyof typeof previews : 'carousel';
  const example = previews[slug];
  const docs = examplePage(slug);
  const parent = Object.entries(variantSets).find(([, keys]) => keys?.some((key) => key === slug))?.[0] ?? slug;
  const related = variantSets[parent] ?? [];
  const [theme, setTheme] = useState<ResolvedTheme>(resolvedTheme);
  const [motion, setMotion] = useState(() => motionOptions.find(([value]) => value === initialMotion)?.[0] ?? exampleMotion(slug));
  const [mode, setMode] = useState<Mode>(editorMode === 'html' || editorMode === 'js' ? 'html' : 'react');
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
      if ((mode === 'react' && next === initialSource) || next.length > 200_000) localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    } catch { /* Editing remains available without storage. */ }
  }
  const compiler = useRef<Worker | null>(null);
  function compile(source: string, language: Mode, previewTheme: ResolvedTheme, previewMotion = motion) {
    const token = String(++requested.current);
    setExecuted({ code: source, mode: language });
    setError('');
    setStatus('');
    if (language === 'html') {
      setRun({ token, source, theme: previewTheme, motion: previewMotion, markup: true });
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
        setRun({ token, source: event.data.code, theme: previewTheme, motion: previewMotion, markup: false });
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

  const initialRun = useRef(() => compile(code, mode, theme));
  useEffect(() => {
    initialRun.current();
    const pending = requested;
    const activeCompiler = compiler;
    return () => { pending.current++; activeCompiler.current?.terminate(); activeCompiler.current = null; };
  }, []);

  useEffect(() => {
    function message(event: MessageEvent) {
      if (event.source !== iframe.current?.contentWindow || event.data?.token !== String(requested.current)) return;
      if (event.data?.kind === 'utkristi-preview-ready') setStatus('React preview ready');
      if (event.data?.kind === 'utkristi-html-ready') setStatus('HTML preview ready');
      if (event.data?.kind === 'utkristi-preview-error') { setError(String(event.data.error)); setStatus(''); }
    }
    window.addEventListener('message', message);
    return () => window.removeEventListener('message', message);
  }, []);

  const previewDocument = run?.markup ? htmlDocument(run.source, run.theme, run.motion, run.token) : reactFrame;

  function changeMode(next: Mode) {
    setMode(next);
    setPane('source');
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
    const exported = mode === 'html' ? htmlDocument(htmlCode, theme, motion) : code;
    const url = URL.createObjectURL(new Blob([exported], { type: mode === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const selectExample = (next: string) => {
    window.location.hash = '/sandbox?' + new URLSearchParams({ component: next, theme, editor: mode, motion });
  };

  return <article className="doc-article playground">
    <header className="doc-title"><span className="label">Build and test</span>
      <h1 className="display display-xl">Sandbox</h1>
      <p className="lede">Edit a working example, run it in any theme, and copy the code into your app.</p>
    </header>
    <div className="playground-toolbar">
      <label htmlFor={id + "-component"}>Example<Select id={id + "-component"} value={parent} onChange={(event) => selectExample(event.target.value)}>
        <optgroup label="Components">{componentPages.map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}</optgroup>
        <optgroup label="Blocks">{blockPages.map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}</optgroup>
      </Select></label>
      {related.length > 0 && <label htmlFor={id + "-variant"}>Variant<Select id={id + "-variant"} value={slug} onChange={(event) => selectExample(event.target.value)}>
        <option value={parent}>Default example</option>
        {related.map((key) => <option key={key} value={key}>{variants[key].name}</option>)}
      </Select></label>}
      <label htmlFor={id + "-theme"}>Theme<Select id={id + "-theme"} value={theme} onChange={(event) => {
        const next = event.target.value as ResolvedTheme;
        setTheme(next);
        void compile(code, mode, next);
      }}><option value="dark">Night</option><option value="light">Paper</option><option value="glass">Glass</option></Select></label>
      <label htmlFor={id + "-mode"}>Editor<Select id={id + "-mode"} value={mode} onChange={(event) => changeMode(event.target.value as Mode)}>
        <option value="react">React / TSX</option><option value="html">HTML / CSS / JS</option>
      </Select></label>
      <label htmlFor={id + "-motion"}>Motion<Select id={id + "-motion"} value={motion} onChange={(event) => {
        const next = event.currentTarget.value as PreviewMotion;
        setMotion(next);
        compile(code, mode, theme, next);
      }}>{motionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
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
      {run ? <iframe key={run.token} ref={iframe} data-preview-run={run.token} title={example.name + ' sandbox preview'} sandbox="allow-scripts allow-forms"
        srcDoc={slug === 'typography' ? previewDocument.replace('</head>', specimenFonts + '</head>') : previewDocument}
        onLoad={() => {
          if (!run.markup) iframe.current?.contentWindow?.postMessage({
            kind: 'utkristi-preview', code: run.source, theme: run.theme, motion: run.motion, token: run.token,
          }, '*');
        }} /> : !error && <Loader variant="brand" className="playground-loading" label="Preparing preview…" aria-hidden="true" />}
      </div>
      {error && <div role="alert" className="playground-error">{error}</div>}
      <div className="source-status"><span className="playground-run-status" role="status">{busy ? 'Compiling…' : status || (error ? 'Run failed' : 'Preparing preview…')}</span>
        <a className="link" href={docs.href}>{docs.label}</a></div>
    </section>
    </div>
    <p className="playground-help muted"><span>{executed.code !== code || executed.mode !== mode ? 'Source changed. Run to update the preview.'
      : mode === 'html' ? 'Add CSS with a style tag and JavaScript with a script tag.' : 'Drafts are kept in this browser.'}</span>
      <span><Kbd>Ctrl / ⌘</Kbd> <Kbd>Enter</Kbd> Run example</span></p>
  </article>;
}
