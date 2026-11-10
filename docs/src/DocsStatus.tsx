import { Component, useEffect, useRef, type ReactNode } from 'react';
import { Button, Icon } from '@utkristi/ui';

type Status = 'missing' | 'asset' | 'error';
const recoveryKey = 'utkristi-docs:asset-recovery';
const assetFailure = /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css/i;

function reloadOnce() {
  if (!import.meta.env.PROD || !navigator.onLine) return;
  try {
    const build = import.meta.url;
    if (sessionStorage.getItem(recoveryKey) === build) return;
    sessionStorage.setItem(recoveryKey, build);
  } catch {
    // Without a durable guard, leave the reload up to the user.
    return;
  }
  window.location.reload();
}

export function DocsStatus({ status }: { status: Status }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const missing = status === 'missing';
  const asset = status === 'asset';
  return <section className="docs-status" aria-labelledby="docs-status-title">
    <span className="docs-status-icon" aria-hidden="true"><Icon name={missing ? 'search' : 'warning'} size={25} /></span>
    <span className="label">{missing ? 'Error 404' : 'Utkristi UI'}</span>
    <h1 id="docs-status-title" ref={heading} tabIndex={-1}>
      {missing ? 'Page not found' : asset ? 'This page couldn’t load' : 'Something went wrong'}
    </h1>
    <p>{missing ? 'This page may have moved. Try the overview or browse the component reference.'
      : asset ? 'A file needed for this page is unavailable. Reload to get the latest version.'
        : 'This part of the site ran into a problem. Reload the page or return to the overview.'}</p>
    <div className="docs-status-actions">
      {missing ? <Button href="#/overview" iconRight={<Icon name="arrow-right" />}>Back to overview</Button>
        : <Button onClick={() => window.location.reload()} iconRight={<Icon name="arrow-right" />}>Reload page</Button>}
      <Button href={missing ? '#/components/button' : '#/overview'} variant="quiet">
        {missing ? 'Browse components' : 'Back to overview'}
      </Button>
    </div>
  </section>;
}

export class DocsErrorBoundary extends Component<{ children: ReactNode; root?: boolean }, { status?: 'asset' | 'error' }> {
  state: { status?: 'asset' | 'error' } = {};

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: assetFailure.test(message) ? 'asset' : 'error' } as const;
  }

  componentDidCatch(error: unknown) {
    if (DocsErrorBoundary.getDerivedStateFromError(error).status === 'asset') reloadOnce();
  }

  render() {
    if (!this.state.status) return this.props.children;
    const status = <DocsStatus status={this.state.status} />;
    return this.props.root ? <main className="page docs-status-root">{status}</main> : status;
  }
}
