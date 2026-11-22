'use client';

import { useState, type ReactNode } from 'react';
import { cx } from './utils/cx.js';

export interface WorkspaceProps {
  title: ReactNode;
  variant?: 'trading' | 'terminal' | 'studio' | 'office';
  /** IDs must be unique and stable across updates. */
  navigation: readonly { id: string; label: string; icon: ReactNode; content: ReactNode }[];
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
  actions?: ReactNode;
  status?: ReactNode;
  className?: string;
}

/** Purpose-specific application shell with accessible navigation and a single active workspace. */
export function Workspace({
  title, variant = 'office', navigation, activeId, defaultActiveId, onActiveChange,
  actions, status, className,
}: WorkspaceProps) {
  const [selected, setSelected] = useState(defaultActiveId ?? navigation[0]?.id);
  const active = navigation.find((item) => item.id === (activeId ?? selected)) ?? navigation[0];
  return <section className={cx('workspace', className)} data-variant={variant}>
    <header className="workspace-header"><strong>{title}</strong><div className="workspace-actions">{actions}</div></header>
    <div className="workspace-layout">
      <nav className="workspace-navigation" aria-label="Workspace">
        {navigation.map((item) => <button key={item.id} type="button"
          aria-current={item.id === active?.id ? 'page' : undefined}
          aria-label={item.label} title={item.label}
          onClick={() => {
            if (activeId === undefined) setSelected(item.id);
            onActiveChange?.(item.id);
          }}>
          <span aria-hidden="true">{item.icon}</span><span className="workspace-navigation-label">{item.label}</span>
        </button>)}
      </nav>
      <div className="workspace-content" role="region" aria-label={active?.label ?? 'Workspace content'}>{active?.content}</div>
    </div>
    {status != null && <footer className="workspace-status">{status}</footer>}
  </section>;
}
