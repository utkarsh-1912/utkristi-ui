import {
  forwardRef, useEffect, useLayoutEffect, useRef, useState, Fragment,
  type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode,
} from 'react';
import { IconButton } from './Button.js';
import { initDisclosures } from './dom.js';
import { Icon } from './icons.js';
import { Logo } from './Logo.js';
import { Popover } from './Overlays.js';
import { cx, type CSSVariables } from './utils/cx.js';
import { useDialogFocus } from './utils/focus.js';
import { Portal } from './utils/Portal.js';
import { useScrollLock } from './utils/useScrollLock.js';
import { useId } from './utils/useId.js';

export interface NavbarLink {
  href: string;
  label: ReactNode;
  active?: boolean;
  /** Optional leading icon, rendered decoratively before the label. */
  icon?: ReactNode;
  /** Optional trailing badge, such as a count or "New". */
  badge?: ReactNode;
  /** Group related destinations. Groups may contain further groups. */
  children?: NavbarLink[];
}
type RenderLink = (link: NavbarLink, props: AnchorHTMLAttributes<HTMLAnchorElement>) => ReactNode;

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  brand?: ReactNode;
  /** `standard` is a full-width bar; `dock` is a floating inset bar with centered links. */
  variant?: 'standard' | 'dock';
  /** Align dock links beside the brand and move links that do not fit into a disclosure. */
  collapseLinks?: boolean;
  links?: NavbarLink[];
  renderLink?: RenderLink;
  right?: ReactNode;
  strip?: { left?: ReactNode; right?: ReactNode };
  /** Keep the bar at the top of its scroll container. Defaults to true. */
  sticky?: boolean;
  hideOnScroll?: boolean;
  /** Shows a search trigger in the bar and in the mobile sheet. */
  onSearch?: () => void;
  /** Accessible name and visible text of the search trigger. */
  searchLabel?: string;
  /** Keyboard hint shown inside the search trigger, such as `⌘K`. */
  searchShortcut?: ReactNode;
  sheetFoot?: ReactNode;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const defaultLink: RenderLink = (link, { children, ...props }) => <a href={link.href} {...props}>{children}</a>;

function linkContent(link: NavbarLink) {
  return <>
    {link.icon && <span className="navbar-link-icon" aria-hidden="true">{link.icon}</span>}
    <span className="navbar-link-label">{link.label}</span>
    {link.badge != null && link.badge !== false && <span className="navbar-link-badge">{link.badge}</span>}
  </>;
}

function currentLink(link: NavbarLink): boolean {
  return !!link.active || !!link.children?.some(currentLink);
}

function NavEntry({ link, renderLink, className, hidden, onSelect, nested }: {
  link: NavbarLink; renderLink: RenderLink; className: string; hidden?: boolean; onSelect?: () => void; nested?: boolean;
}) {
  if (!link.children?.length) return renderLink(link, { className, 'aria-current': link.active ? 'page' : undefined,
    tabIndex: hidden ? -1 : undefined, onClick: onSelect, children: linkContent(link) });
  return <details data-ut-disclosure="" className={cx('navbar-disclosure', nested && 'navbar-disclosure-nested')}>
    <summary className={cx(className, 'navbar-disclosure-trigger')} tabIndex={hidden ? -1 : undefined}
      data-nav-current={currentLink(link) || undefined}>{linkContent(link)}<Icon name="chevronDown" size={14} /></summary>
    <div className="pop navbar-submenu" data-ut-enter="">
      {link.children.map((child) => <NavEntry key={child.href} link={child} renderLink={renderLink} nested
        className="navbar-overflow-link" onSelect={onSelect} />)}
    </div>
  </details>;
}

function MobileSheet({ id, brand, links, renderLink, onSearch, searchLabel, sheetFoot, variant, onClose }: Pick<NavbarProps, 'brand' | 'onSearch' | 'sheetFoot' | 'variant'> & {
  id: string; links: NavbarLink[]; renderLink: RenderLink; searchLabel: string; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dock = variant === 'dock';
  useDialogFocus(ref, onClose, dock ? closeButton : undefined);
  useScrollLock(true);
  useEffect(() => ref.current && initDisclosures(ref.current) || undefined, []);
  const content = <div id={id} ref={ref} role="dialog" aria-modal="true" aria-label="Menu" tabIndex={-1} className={cx('sheet', dock && 'sheet-dock')}>
    <div className="sheet-top" onClickCapture={(event) => {
      if (event.target instanceof Element && event.target.closest('a[href]')) onClose();
    }}>{brand}<IconButton ref={closeButton} label="Close menu" onClick={onClose}><Icon name="close" size={22} /></IconButton></div>
    {onSearch && <button type="button" className="sheet-search" onClick={() => { onClose(); onSearch(); }}>
      <Icon name="search" size={18} /><span>{searchLabel === 'Search' ? 'Search pages' : searchLabel}</span>
    </button>}
    <nav aria-label="Primary" className={cx('sheet-nav', !dock && 'sheet-lines')}>
      {links.map((link, index) => <div key={link.href} style={{ '--d': `${80 + index * 60}ms` } as CSSVariables}>
        {link.children?.length ? <NavEntry link={link} renderLink={renderLink} className="sheet-dock-link" onSelect={onClose} />
          : renderLink(link, {
            className: dock ? 'sheet-dock-link' : 'display', 'aria-current': link.active ? 'page' : undefined, onClick: onClose,
            children: dock ? <span className="sheet-dock-link-main">{linkContent(link)}</span> : <span>{link.label}</span>,
          })}
      </div>)}
    </nav>
    {sheetFoot && <div className="sheet-foot">{sheetFoot}</div>}
  </div>;
  return dock ? <div className="sheet-dock-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>{content}</div> : content;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { brand = <Logo size={28} />, variant = 'standard', links = [], renderLink = defaultLink, right, strip, sticky = true, hideOnScroll, onSearch,
    searchLabel = 'Search', searchShortcut, sheetFoot, collapseLinks, className, children, ...props }, ref,
) {
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const [fit, setFit] = useState<number>();
  const [moreOpen, setMoreOpen] = useState(false);
  const track = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const moveFocusToMore = useRef(false);
  const id = useId();
  const dock = variant === 'dock';
  const collapsible = dock && !!collapseLinks;
  const activeIndex = links.findIndex(currentLink);
  useEffect(() => bar.current && initDisclosures(bar.current) || undefined, []);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 4);
        if (hideOnScroll && (Math.abs(y - last) > 6 || y <= 160)) {
          setAway(y > last && y > 160);
          last = y;
        }
        frame = 0;
      });
    };
    setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [hideOnScroll]);

  useEffect(() => {
    if (!open) return;
    const closeIfExpanded = () => {
      const button = burger.current;
      if (button && getComputedStyle(button).display === 'none') setOpen(false);
    };
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(closeIfExpanded);
    if (bar.current) observer?.observe(bar.current);
    window.addEventListener('resize', closeIfExpanded);
    return () => { observer?.disconnect(); window.removeEventListener('resize', closeIfExpanded); };
  }, [open]);

  // Slide a single indicator under the active link instead of repainting each link.
  useIsomorphicLayoutEffect(() => {
    const nav = track.current;
    if (!nav || dock) return;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>(':scope > [aria-current="page"], :scope > details > [data-nav-current]');
      setIndicator(active && active.offsetWidth ? { x: active.getBoundingClientRect().left - nav.getBoundingClientRect().left, w: active.offsetWidth } : null);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    for (const child of Array.from(nav.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [activeIndex, links.length, dock]);

  useIsomorphicLayoutEffect(() => {
    const nav = track.current;
    if (!collapsible || !nav) return;
    const items = Array.from(nav.querySelectorAll<HTMLElement>(':scope > .navbar-fit-item'));
    const more = nav.querySelector<HTMLElement>(':scope > .navbar-more');
    if (!more) return;
    const measure = () => {
      if (!nav.clientWidth) { setMoreOpen(false); return; }
      const style = getComputedStyle(nav);
      const gap = parseFloat(style.columnGap) || 0;
      const available = nav.clientWidth - (parseFloat(style.paddingInlineStart) || 0) - 1;
      const widths = items.map((item) => item.getBoundingClientRect().width);
      const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, widths.length - 1);
      if (total <= available) {
        setFit(items.length);
        setMoreOpen(false);
        return;
      }
      let remaining = available - more.getBoundingClientRect().width;
      let visible = 0;
      for (const width of widths) {
        if (width + gap > remaining) break;
        remaining -= width + gap;
        visible++;
      }
      if (items.slice(visible).some((item) => item.contains(document.activeElement))) moveFocusToMore.current = true;
      setFit(visible);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(nav);
    for (const item of items) observer?.observe(item);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [collapsible, links]);

  useIsomorphicLayoutEffect(() => {
    if (!moveFocusToMore.current) return;
    moveFocusToMore.current = false;
    track.current?.querySelector<HTMLButtonElement>('.navbar-more button')?.focus();
  }, [fit]);

  const limit = fit ?? links.length;
  const overflow = collapsible ? links.slice(limit) : [];
  const navigation = links.length ? <nav ref={track} className="navbar-links" aria-label="Primary" data-indicator={!dock && indicator ? '' : undefined}>
    {!dock && indicator && <span className="navbar-indicator" aria-hidden="true"
      style={{ '--ut-ind-x': `${indicator.x}px`, '--ut-ind-w': `${indicator.w}px` } as CSSVariables} />}
    {links.map((link, index) => {
      const hidden = collapsible && index >= limit;
      const anchor = <NavEntry link={link} renderLink={renderLink} className={dock ? 'navbar-dock-link' : 'navbar-link'} hidden={hidden} />;
      return collapsible ? <span className="navbar-fit-item" key={link.href} data-hidden={hidden || undefined}
        aria-hidden={hidden || undefined}>{anchor}</span> : <Fragment key={link.href}>{anchor}</Fragment>;
    })}
    {collapsible && <div className="navbar-more" data-hidden={!overflow.length || undefined}
      aria-hidden={!overflow.length || undefined} data-current={overflow.some(currentLink) || undefined}>
      <Popover label="More navigation links" open={moreOpen && !!overflow.length} onOpenChange={setMoreOpen} align="end"
        trigger={<><Icon name="more-horizontal" size={20} /><span className="ut-sr-only">More navigation links</span></>}>
        {overflow.map((link) => <NavEntry key={link.href} link={link} renderLink={renderLink} className="navbar-overflow-link"
          onSelect={() => {
            setMoreOpen(false);
            track.current?.querySelector<HTMLButtonElement>('.navbar-more button')?.focus();
          }} />)}
      </Popover>
    </div>}
  </nav> : null;

  const search = onSearch && <button type="button" className="navbar-search" aria-label={searchLabel} onClick={onSearch}>
    <Icon name="search" size={16} />
    <span className="navbar-search-text" aria-hidden="true">{searchLabel}</span>
    {searchShortcut && <kbd className="kbd navbar-search-kbd" aria-hidden="true">{searchShortcut}</kbd>}
  </button>;

  return <>
    <header {...props} ref={ref} className={cx('header', !sticky && 'header-static', dock && 'header-dock', scrolled && 'is-scrolled', sticky && hideOnScroll && away && !open && 'is-away', className)}>
      {strip && <div className="strip"><div className="strip-inner"><div>{strip.left}</div><div>{strip.right}</div></div></div>}
      <div ref={bar} className={cx('navbar', dock && 'navbar-dock')} data-collapse-links={collapsible || undefined}><div className="navbar-inner">
        <div className="navbar-left">
          {brand}
          {!dock && navigation}
        </div>
        {dock && navigation}
        <div className="navbar-right">
          {search}
          {right}
          <IconButton ref={burger} label="Open menu" className="burger" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(true)}>
            <Icon name="menu" size={20} />
          </IconButton>
        </div>
      </div></div>
      {children}
    </header>
    {open && <Portal><MobileSheet id={id} brand={brand} links={links} renderLink={renderLink} searchLabel={searchLabel}
      onSearch={onSearch} sheetFoot={sheetFoot} variant={variant} onClose={() => setOpen(false)} /></Portal>}
  </>;
});
