import { Copy } from 'lucide-react';
import { Code, IconButton, useToast } from '@utkristi/ui';

export function CopyCode({ text }: { text: string }) {
  const toast = useToast();
  return <div className="code-example">
    <IconButton size="sm" label="Copy code" className="copy-code" onClick={async () => {
      try {
        await navigator.clipboard.writeText(text);
        toast.show({ title: 'Copied', tone: 'ok' });
      } catch {
        toast.show({ title: 'Could not copy code', tone: 'bad' });
      }
    }}><Copy size={15} /></IconButton>
    <Code>{text}</Code>
  </div>;
}

