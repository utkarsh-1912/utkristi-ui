import { useEffect, useRef, useState } from 'react';
import { Button, Select, type ResolvedTheme, useTheme } from '@utkristi/ui';
import { componentPages, examples as previews } from './examples';
import { examples } from 'virtual:utkristi-examples';
import { script, styles } from 'virtual:utkristi-runtime';

const policy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; form-action 'none'; base-uri 'none'";
const frameHead = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta http-equiv="Content-Security-Policy" content="' + policy + '"><style>' +
  styles.replace(/<\/style/gi, '<\\/style') +
  'body{padding:16px;min-height:100vh}#playground{min-width:0}.sample-row{display:flex;flex-wrap:wrap;gap:8px}</style></head>';
const reactFrame = frameHead + '<body><div id="playground"></div><script>' + script.replace(/<\/script/gi, '<\\/script') + '</script></body></html>';

interface Run { token: string; source: string; theme: ResolvedTheme; markup: boolean }

export default function Playground({ component }: { component?: string }) {
  const { resolvedTheme } = useTheme();
  const slug = component && Object.hasOwn(previews, component) ? component as keyof typeof previews : 'carousel';
  const example = previews[slug];
  const [theme, setTheme] = useState<ResolvedTheme>(resolvedTheme);
  const [mode, setMode] = useState<'react' | 'html'>('react');
  const [reactCode, setReactCode] = useState(examples[slug].code);
  const [htmlCode, setHtmlCode] = useState(example.html);
  const [run, setRun] = useState<Run>();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const iframe = useRef<HTMLIFrameElement>(null);
  const requested = useRef(0);
  const code = mode === 'react' ? reactCode : htmlCode;
  const update = mode === 'react' ? setReactCode : setHtmlCode;
  const last = useRef({ code, mode, theme });
  last.current = { code, mode, theme };

  async function compile(source: string, language: 'react' | 'html', previewTheme: ResolvedTheme) {
    const token = String(++requested.current);
    setBusy(true);
    setError('');
    setStatus('');
    try {
      let output = source;
      if (language === 'react') {
        const ts = await import('typescript');
        const result = ts.transpileModule(source, {
          fileName: 'example.tsx', reportDiagnostics: true,
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
        });
        const syntax = result.diagnostics?.find((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
        if (syntax) throw new Error(ts.flattenDiagnosticMessageText(syntax.messageText, '\n'));
        output = result.outputText;
      }
      if (token !== String(requested.current)) return;
      setRun({ token, source: output, theme: previewTheme, markup: language === 'html' });
      setStatus('Preview updated');
    } catch (cause) {
      if (token === String(requested.current)) setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      if (token === String(requested.current)) setBusy(false);
    }
  }

  useEffect(() => {
    const initial = last.current;
    void compile(initial.code, initial.mode, initial.theme);
    return () => { requested.current++; };
  }, []);

  useEffect(() => {
    function message(event: MessageEvent) {
      if (event.source !== iframe.current?.contentWindow || event.data?.kind !== 'utkristi-preview-error'
        || event.data.token !== run?.token) return;
      setError(String(event.data.error));
      setStatus('');
    }
    window.addEventListener('message', message);
    return () => window.removeEventListener('message', message);
  }, [run]);

  function changeMode(next: 'react' | 'html') {
    setMode(next);
    void compile(next === 'react' ? reactCode : htmlCode, next, theme);
  }

  return <article className="doc-article playground">
    <header className="doc-title"><span className="label">Build and test</span>
      <h1 className="display display-xl">Sandbox</h1>
      <p className="lede">Edit a working example, run it in any theme, and copy the code into your app.</p>
    </header>
    <div className="playground-toolbar">
      <label>Component<Select value={slug} onChange={(event) => {
        window.location.hash = '/sandbox?component=' + encodeURIComponent(event.target.value);
      }}>{componentPages.map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}</Select></label>
      <label>Theme<Select value={theme} onChange={(event) => {
        const next = event.target.value as ResolvedTheme;
        setTheme(next);
        void compile(code, mode, next);
      }}><option value="dark">Night</option><option value="light">Paper</option><option value="glass">Glass</option></Select></label>
      <label>Editor<Select value={mode} onChange={(event) => changeMode(event.target.value as 'react' | 'html')}>
        <option value="react">React / TSX</option><option value="html">HTML / CSS / JS</option>
      </Select></label>
    </div>
    <div className="playground-result">
      <div className="playground-head"><span className="label">Live preview</span>
        <a className="link" href={`#/components/${slug}`}>Component docs</a></div>
      {run ? <iframe key={run.token} ref={iframe} title={example.name + ' sandbox preview'} sandbox="allow-scripts"
        srcDoc={run.markup ? frameHead.replace('<html>', '<html data-theme="' + run.theme + '">') + '<body>' + run.source + '</body></html>' : reactFrame}
        onLoad={() => {
          if (!run.markup) iframe.current?.contentWindow?.postMessage({
            kind: 'utkristi-preview', code: run.source, theme: run.theme, token: run.token,
          }, '*');
        }} /> : <p className="muted playground-loading">Preparing preview…</p>}
      {error && <div role="alert" className="playground-error">{error}</div>}
    </div>
    <div className="playground-editor">
      <div className="playground-head"><label className="label" htmlFor="sandbox-source">Example source</label>
        <div className="sample-row">
          <Button size="sm" variant="plain" onClick={() => {
            const initial = mode === 'react' ? examples[slug].code : example.html;
            update(initial); void compile(initial, mode, theme);
          }}>Reset</Button>
          <Button size="sm" variant="ghost" onClick={async () => {
            try { await navigator.clipboard.writeText(code); setStatus('Copied source'); }
            catch { setStatus('Clipboard unavailable. Select and copy the source.'); }
          }}>Copy</Button>
          <Button size="sm" loading={busy} onClick={() => void compile(code, mode, theme)}>Run</Button>
        </div>
      </div>
      <textarea id="sandbox-source" value={code} onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault(); void compile(code, mode, theme);
          }
        }} spellCheck={false} autoCapitalize="off" autoComplete="off" />
    </div>
    <p className="muted" role="status">{status}</p>
    <p className="muted">React examples can import the kit, React, and the icons used in these docs. Press Ctrl or ⌘ + Enter to run.</p>
  </article>;
}
