import { memo, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

const tokens = /(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|(?<!:)\/\/[^\n]*)|("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`)|(<\/?[A-Za-z][\w.:-]*|\b[A-Za-z_$][\w$-]*(?=\s*=\s*["'{]))|(\b(?:import|from|export|default|function|const|let|return|if|else|new|class|extends|type|interface|async|await|throw|true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)/g;
const tokenClasses = ['comment', 'string', 'markup', 'keyword', 'number'];

export const HighlightedCode = memo(function HighlightedCode({ source }: { source: string }) {
  if (source.length > 50_000) return source;
  const parts = [];
  let offset = 0;
  for (const match of source.matchAll(tokens)) {
    const index = match.index;
    if (index > offset) parts.push(source.slice(offset, index));
    parts.push(<span key={index} className={'syntax-' + tokenClasses[match.slice(1).findIndex(Boolean)]}>{match[0]}</span>);
    offset = index + match[0].length;
  }
  parts.push(source.slice(offset));
  return <>{parts}</>;
});

export function SourceEditor({ source, onChange, onRun, input }: {
  source: string;
  onChange: (code: string) => void;
  onRun: () => void;
  input: RefObject<HTMLTextAreaElement>;
}) {
  const hint = useId();
  const highlight = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const allowTab = useRef(false);
  const [position, setPosition] = useState({ line: 1, column: 1 });
  const lines = source.split('\n');
  function sync(editor: HTMLTextAreaElement) {
    if (highlight.current) highlight.current.style.transform = `translate(${-editor.scrollLeft}px, ${-editor.scrollTop}px)`;
    if (gutter.current) gutter.current.style.transform = `translateY(${-editor.scrollTop}px)`;
  }
  function moveCaret(editor: HTMLTextAreaElement) {
    const start = editor.selectionStart;
    const before = editor.value.slice(0, start);
    const next = { line: before.split('\n').length, column: start - before.lastIndexOf('\n') };
    setPosition((current) => current.line === next.line && current.column === next.column ? current : next);
  }
  function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      onRun();
      return;
    }
    if (event.key === 'Escape') { allowTab.current = true; return; }
    if (event.key !== 'Tab') { allowTab.current = false; return; }
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey || allowTab.current) {
      allowTab.current = false;
      return;
    }
    event.preventDefault();
    // Chromium and Firefox preserve native undo when inserting into a textarea this way.
    if (!document.execCommand('insertText', false, '  ')) {
      const editor = event.currentTarget;
      editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
      onChange(editor.value);
      moveCaret(editor);
    }
  }
  return <>
    <div className="source-editor" style={{ gridTemplateColumns: `calc(${String(lines.length).length}ch + 22px) minmax(0, 1fr)` }}>
      <div className="source-gutter" aria-hidden="true"><div ref={gutter}>
        {lines.length < 4000 ? lines.map((_, i) => <span key={i} data-current={position.line === i + 1 || undefined}>{i + 1}</span>) : null}
      </div></div>
      <div className="source-input">
        <pre ref={highlight} aria-hidden="true"><HighlightedCode source={source} />{'\n'}</pre>
        <textarea ref={input} id="sandbox-source" className="ut-scrollbar" wrap="off" value={source}
          aria-describedby={hint} onScroll={(event) => sync(event.currentTarget)} onSelect={(event) => moveCaret(event.currentTarget)}
          onChange={(event) => { onChange(event.target.value); moveCaret(event.target); }}
          onKeyDown={handleKey} onBlur={() => { allowTab.current = false; }}
          spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" />
      </div>
    </div>
    <div className="source-status"><span>Ln {Math.min(position.line, lines.length)}, Col {position.line <= lines.length ? position.column : 1}</span>
      <span id={hint}>Tab indents · Esc then Tab moves focus</span></div>
  </>;
}
