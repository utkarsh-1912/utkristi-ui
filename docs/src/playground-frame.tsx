import React, { Component, useEffect, type ReactNode } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { createRoot } from 'react-dom/client';
import * as kit from '@utkristi/ui';
import { ArrowUpRight, Bell, Check, Copy, Ellipsis, FolderOpen, Plus, Search, Trash2 } from 'lucide-react';

const modules: Record<string, unknown> = {
  react: React, 'react/jsx-runtime': jsxRuntime, '@utkristi/ui': kit,
  'lucide-react': { ArrowUpRight, Bell, Check, Copy, Ellipsis, FolderOpen, Plus, Search, Trash2 },
};
const container = document.getElementById('playground');
if (!container) throw new Error('Preview mount is missing');
const root = createRoot(container);

function report(token: string, error: string) {
  window.parent.postMessage({ kind: 'utkristi-preview-error', token, error }, '*');
}

class PreviewBoundary extends Component<{ children: ReactNode; token: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { report(this.props.token, error.message); }
  render() { return this.state.failed ? <p role="alert">The example could not render.</p> : this.props.children; }
}

function Ready({ token }: { token: string }) {
  useEffect(() => { window.parent.postMessage({ kind: 'utkristi-preview-ready', token }, '*'); }, [token]);
  return null;
}

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.data?.kind !== 'utkristi-preview') return;
  const { code, theme, motion, token } = event.data;
  try {
    container.dataset.utMotion = motion;
    const module = { exports: {} as { default?: React.ComponentType<{ theme: kit.ResolvedTheme }> } };
    const requireModule = (id: string) => {
      if (!Object.hasOwn(modules, id)) throw new Error('Unsupported sandbox import: ' + id);
      return modules[id];
    };
    new Function('require', 'module', 'exports', code)(requireModule, module, module.exports);
    const Example = module.exports.default;
    if (!Example) throw new Error('Export a default React component.');
    root.render(<PreviewBoundary key={token} token={token}>
      <kit.ThemeProvider defaultTheme={theme} storageKey={null}><kit.ToastProvider>
        <div data-ut-enter=""><Example theme={theme} /></div><Ready token={token} />
      </kit.ToastProvider></kit.ThemeProvider>
    </PreviewBoundary>);
  } catch (error) {
    report(token, error instanceof Error ? error.message : String(error));
  }
});
