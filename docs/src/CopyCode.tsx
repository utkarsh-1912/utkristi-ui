import { useEffect, useRef, useState } from 'react';
import { Button, Code, Icon } from '@utkristi/ui';
import { HighlightedCode } from './SourceEditor';

export function CopyAction({ value, label = 'Copy', className, onFailure }: {
  value: string | (() => string | undefined);
  label?: string;
  className?: string;
  onFailure?: () => void;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number>();
  const revision = useRef(0);
  useEffect(() => () => { revision.current++; window.clearTimeout(timer.current); }, []);
  async function copy() {
    const attempt = ++revision.current;
    window.clearTimeout(timer.current);
    let result: typeof state = 'copied';
    try {
      const source = typeof value === 'function' ? value() : value;
      if (source == null) throw new Error('No source');
      await navigator.clipboard.writeText(source);
    } catch {
      result = 'failed';
    }
    if (attempt !== revision.current) return;
    if (result === 'failed') onFailure?.();
    setState(result);
    timer.current = window.setTimeout(() => setState('idle'), 2200);
  }
  return <span className={'copy-control' + (className ? ' ' + className : '')}>
    <Button size="sm" variant="quiet" data-copy-state={state}
      onClick={() => void copy()} iconLeft={<Icon name={state === 'copied' ? 'check' : 'copy'} size={15} />}>
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Retry copy' : label}
    </Button>
    <span className="docs-visually-hidden" aria-live="polite">{state === 'copied' ? 'Copied to clipboard'
      : state === 'failed' ? 'Could not copy. Select and copy the source manually.' : ''}</span>
  </span>;
}

export function CopyCode({ text, language }: { text: string; language?: string }) {
  const selection = useRef<HTMLDivElement>(null);
  const type = language ?? (/^\s*</.test(text) ? 'HTML' : /^\s*npm /.test(text) ? 'Shell' : 'Code');
  return <div className="code-example">
    <div className="code-example-head"><span className="label">{type}</span>
      <CopyAction value={text} onFailure={() => {
        const source = selection.current;
        const range = document.createRange();
        if (!source) return;
        range.selectNodeContents(source);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }} />
    </div>
    <div ref={selection}><Code><HighlightedCode source={text} /></Code></div>
  </div>;
}
