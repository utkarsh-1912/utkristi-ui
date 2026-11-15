import { createContext, forwardRef, useContext, useEffect, useId, useState, type AnchorHTMLAttributes, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cx, type CSSVariables } from './utils/cx.js';
import { useControllable } from './utils/useControllable.js';
import { Button } from './Button.js';
import { Sheet } from './Overlays.js';

type DivProps = HTMLAttributes<HTMLDivElement>;

export const Alert = forwardRef<HTMLDivElement, DivProps & {
  title: string; tone?: 'neutral' | 'ok' | 'warn' | 'bad'; icon?: ReactNode;
  variant?: 'soft' | 'plain' | 'outlined' | 'solid';
  actions?: ReactNode; onDismiss?: () => void; dismissLabel?: string; banner?: boolean;
}>(function Alert({ title, tone = 'neutral', icon, variant = 'soft', actions, onDismiss, dismissLabel = 'Dismiss alert', banner, children, className, ...props }, ref) {
  return <div role={tone === 'bad' ? 'alert' : 'status'} {...props} ref={ref} className={cx('alert', className)} data-tone={tone} data-variant={variant} data-banner={banner || undefined}>
    {icon && <span className="alert-icon" aria-hidden="true">{icon}</span>}
    <div className="alert-content"><strong>{title}</strong>{children != null && <div className="alert-description">{children}</div>}{actions != null && <div className="alert-actions">{actions}</div>}</div>
    {onDismiss && <Button variant="plain" size="sm" className="alert-dismiss" aria-label={dismissLabel} onClick={onDismiss}>×</Button>}
  </div>;
});

export const AspectRatio = forwardRef<HTMLDivElement, DivProps & { ratio?: number }>(function AspectRatio(
  { ratio = 16 / 9, className, style, ...props }, ref,
) {
  return <div {...props} ref={ref} className={cx('aspect-ratio', className)}
    style={{ ...style, '--ut-ratio': Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9 } as CSSVariables} />;
});

export const Direction = forwardRef<HTMLDivElement, DivProps & { dir: 'ltr' | 'rtl' }>(function Direction(props, ref) {
  return <div {...props} ref={ref} />;
});

export const Separator = forwardRef<HTMLDivElement, DivProps & {
  decorative?: boolean; orientation?: 'horizontal' | 'vertical';
}>(function Separator({ decorative = true, orientation = 'horizontal', className, ...props }, ref) {
  return <div {...props} ref={ref} role={decorative ? 'none' : 'separator'}
    aria-orientation={decorative ? undefined : orientation} data-orientation={orientation} className={cx('separator', className)} />;
});

export const ScrollArea = forwardRef<HTMLDivElement, DivProps & {
  orientation?: 'horizontal' | 'vertical' | 'both';
}>(function ScrollArea({ orientation = 'vertical', className, ...props }, ref) {
  // A keyboard tab stop is needed for scroll regions without interactive descendants.
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  return <div role="region" aria-label="Scrollable content" tabIndex={0} {...props} ref={ref} className={cx('scroll-area', 'ut-scrollbar', className)} data-orientation={orientation} />;
});

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(function Label({ className, htmlFor, children, ...props }, ref) {
  return <label {...props} ref={ref} htmlFor={htmlFor} className={cx('field-label', className)}>{children}</label>;
});

export const Marker = forwardRef<HTMLDivElement, DivProps & {
  variant?: 'default' | 'border' | 'separator'; icon?: ReactNode;
}>(function Marker({ variant = 'default', icon, className, children, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('marker', className)} data-variant={variant}>
    {icon && <span aria-hidden="true">{icon}</span>}<span>{children}</span>
  </div>;
});

export const Item = forwardRef<HTMLDivElement, Omit<DivProps, 'title'> & {
  title: ReactNode; description?: ReactNode; leading?: ReactNode; actions?: ReactNode;
}>(function Item({ title, description, leading, actions, children, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('item', className)}>
    {leading && <div className="item-leading">{leading}</div>}
    <div className="item-content"><strong>{title}</strong>{description && <div className="muted">{description}</div>}{children}</div>
    {actions && <div className="item-actions">{actions}</div>}
  </div>;
});

export const Attachment = forwardRef<HTMLDivElement, DivProps & {
  name: string; href?: string; detail?: string; onRemove?: () => void;
}>(function Attachment({ name, href, detail, onRemove, className, ...props }, ref) {
  return <Item {...props} ref={ref} className={cx('attachment', className)}
    title={href ? <a className="link" href={href} download>{name}</a> : name} description={detail}
    actions={onRemove && <Button size="sm" variant="quiet" aria-label={`Remove ${name}`} onClick={onRemove}>×</Button>} />;
});

export const ButtonGroup = forwardRef<HTMLDivElement, DivProps & {
  orientation?: 'horizontal' | 'vertical';
}>(function ButtonGroup({ orientation = 'horizontal', className, ...props }, ref) {
  return <div role="group" {...props} ref={ref} data-orientation={orientation} className={cx('button-group', className)} />;
});

export interface BreadcrumbItem { label: ReactNode; href?: string; key?: string }
export const Breadcrumb = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & {
  items: readonly BreadcrumbItem[];
}>(function Breadcrumb({ items, className, ...props }, ref) {
  return <nav aria-label="Breadcrumb" {...props} ref={ref} className={cx('breadcrumb', className)}>
    <ol>{items.map(({ label, href, key }, index) => <li key={key ?? href ?? index}>
      {index > 0 && <span aria-hidden="true" className="breadcrumb-divider">/</span>}
      {index === items.length - 1 ? <span aria-current="page">{label}</span> : href ? <a href={href} className="link">{label}</a> : <span>{label}</span>}
    </li>)}</ol>
  </nav>;
});

export { Pagination, type PaginationProps } from './Pagination.js';

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider.');
  return ctx;
}

export interface SidebarProviderProps {
  children: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  defaultMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  storageKey?: string | null;
}

export function SidebarProvider({
  children, collapsed: controlledCollapsed, defaultCollapsed = false, onCollapsedChange,
  mobileOpen: controlledMobileOpen, defaultMobileOpen = false, onMobileOpenChange, storageKey = 'utkristi-sidebar-collapsed',
}: SidebarProviderProps) {
  const [initialCollapsed] = useState(() => {
    if (defaultCollapsed || !storageKey || typeof window === 'undefined') return defaultCollapsed;
    try { return window.localStorage.getItem(storageKey) === 'true'; } catch { return defaultCollapsed; }
  });
  const [collapsed, setCollapsedState] = useControllable(controlledCollapsed, initialCollapsed, onCollapsedChange);
  const [mobileOpen, setMobileOpen] = useControllable(controlledMobileOpen, defaultMobileOpen, onMobileOpenChange);

  const setCollapsed = (next: boolean) => {
    setCollapsedState(next);
    if (storageKey && typeof window !== 'undefined') {
      try { window.localStorage.setItem(storageKey, String(next)); } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    if (!mobileOpen || typeof window === 'undefined' || !window.matchMedia) return;
    const narrow = window.matchMedia('(max-width: 980px)');
    const onChange = (event: MediaQueryListEvent) => { if (!event.matches) setMobileOpen(false); };
    narrow.addEventListener('change', onChange);
    return () => narrow.removeEventListener('change', onChange);
  }, [mobileOpen, setMobileOpen]);

  return <SidebarContext.Provider value={{
    collapsed,
    setCollapsed,
    toggleCollapsed: () => setCollapsed(!collapsed),
    mobileOpen,
    setMobileOpen,
  }}>{children}</SidebarContext.Provider>;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  heading?: ReactNode;
  variant?: 'panel' | 'rail';
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  toggleLabel?: string;
  collapseMode?: 'content' | 'icons' | 'offcanvas';
  togglePosition?: 'header' | 'edge';
  footer?: ReactNode;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar({
  heading, variant = 'panel', collapsible = false, collapsed, defaultCollapsed = false,
  onCollapsedChange, toggleLabel = 'Toggle sidebar navigation', collapseMode = 'content', togglePosition = 'header', footer, className, children, ...props
}, ref) {
  const contentId = useId();
  const ctx = useContext(SidebarContext);
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? ctx?.collapsed ?? localCollapsed;
  const handleToggle = () => {
    const next = !isCollapsed;
    if (collapsed === undefined) {
      if (ctx) ctx.setCollapsed(next);
      else setLocalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };
  return <aside {...props} ref={ref} className={cx('sidebar', variant === 'rail' && 'sidebar-rail', className)}
    data-collapsed={isCollapsed || undefined} data-collapse-mode={collapseMode} data-toggle-position={togglePosition}>
    {collapsible ? <div className="sidebar-header">
      {heading != null && <div className="sidebar-heading">{heading}</div>}
      <Button variant="ghost" size="sm" className="sidebar-toggle" type="button"
        aria-label={toggleLabel} aria-expanded={!isCollapsed} aria-controls={contentId}
        onClick={handleToggle}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </div> : heading != null && <div className="sidebar-heading">{heading}</div>}
    <div className="sidebar-content" id={contentId} hidden={isCollapsed && collapseMode !== 'icons'}>{children}</div>
    {footer != null && <div className="sidebar-footer" hidden={isCollapsed}>{footer}</div>}
  </aside>;
});

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
  heading: ReactNode;
  icon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(function SidebarSection(
  { heading, icon, open, defaultOpen = true, onOpenChange, className, children, ...props }, ref,
) {
  const id = useId();
  const [expanded, setExpanded] = useControllable(open, defaultOpen, onOpenChange);
  return <div {...props} ref={ref} className={cx('sidebar-section', className)} data-open={expanded || undefined}>
    <button type="button" className="sidebar-section-trigger" aria-expanded={expanded} aria-controls={id}
      onClick={() => setExpanded(!expanded)}>
      {icon && <span className="sidebar-link-icon" aria-hidden="true">{icon}</span>}
      <span className="sidebar-section-label">{heading}</span>
      <svg className="sidebar-section-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    <div id={id} className="sidebar-section-items" hidden={!expanded}>{children}</div>
  </div>;
});

export interface SidebarDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  side?: 'start' | 'end';
  className?: string;
  children: ReactNode;
}

export function SidebarDrawer({ open, onOpenChange, title = 'Navigation', side = 'start', className, children }: SidebarDrawerProps) {
  const ctx = useContext(SidebarContext);
  const isOpen = open ?? ctx?.mobileOpen ?? false;
  const close = () => {
    if (onOpenChange) onOpenChange(false);
    else ctx?.setMobileOpen(false);
  };
  return <Sheet open={isOpen} onClose={close} title={title} side={side} className={cx('sidebar-drawer', className)}>
    {children}
  </Sheet>;
}

/** Labels stay available to assistive technology when an icon rail is collapsed. */
export const SidebarLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & {
  label: string; icon?: ReactNode; badge?: ReactNode;
}>(function SidebarLink({ label, icon, badge, className, ...props }, ref) {
  return <a title={label} aria-label={label} {...props} ref={ref} className={cx('sidebar-link', className)}>
    <span className="sidebar-link-icon" aria-hidden="true">{icon ?? label.slice(0, 1)}</span>
    <span className="sidebar-link-label">{label}</span>{badge != null && <span className="sidebar-link-badge">{badge}</span>}
  </a>;
});
