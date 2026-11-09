import { forwardRef, useEffect, useRef, useState, Fragment, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { IconButton } from './Button.js';
import { Icon } from './icons.js';
import { Logo } from './Logo.js';
import { cx, type CSSVariables } from './utils/cx.js';
import { useDialogFocus } from './utils/focus.js';
import { Portal } from './utils/Portal.js';
import { useScrollLock } from './utils/useScrollLock.js';
import { useId } from './utils/useId.js';

export interface NavbarLink { href: string; label: ReactNode; active?: boolean }
type RenderLink = (link: NavbarLink, props: AnchorHTMLAttributes<HTMLAnchorElement>) => ReactNode;

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  brand?: ReactNode;
  links?: NavbarLink[];
  renderLink?: RenderLink;
  right?: ReactNode;
  strip?: { left?: ReactNode; right?: ReactNode };
  hideOnScroll?: boolean;
  onSearch?: () => void;
  sheetFoot?: ReactNode;
}

const defaultLink: RenderLink = (link, { children, ...props }) => <a href={link.href} {...props}>{children}</a>;

function MobileSheet({ id, brand, links, renderLink, onSearch, sheetFoot, onClose }: Pick<NavbarProps, 'brand' | 'onSearch' | 'sheetFoot'> & {
  id: string; links: NavbarLink[]; renderLink: RenderLink; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  useScrollLock(true);
  return <div id={id} ref={ref} role="dialog" aria-modal="true" aria-label="Menu" tabIndex={-1} className="sheet">
    <div className="sheet-top">{brand}<IconButton label="Close menu" onClick={onClose}><Icon name="close" size={22} /></IconButton></div>
    {onSearch && <button type="button" className="sheet-search" onClick={() => { onClose(); onSearch(); }}>
      <Icon name="search" size={18} /><span>Search pages</span>
    </button>}
    <nav aria-label="Primary" className="sheet-nav sheet-lines">
      {links.map((link, index) => <div key={link.href} style={{ '--d': `${80 + index * 70}ms` } as CSSVariables}>{renderLink(link, {
        className: 'display', 'aria-current': link.active ? 'page' : undefined, onClick: onClose,
        children: <span>{link.label}</span>,
      })}</div>)}
    </nav>
    {sheetFoot && <div className="sheet-foot">{sheetFoot}</div>}
  </div>;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { brand = <Logo size={28} />, links = [], renderLink = defaultLink, right, strip, hideOnScroll, onSearch,
    sheetFoot, className, children, ...props }, ref,
) {
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!hideOnScroll) return;
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) > 6 || y <= 160) {
          setAway(y > last && y > 160);
          last = y;
        }
        frame = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [hideOnScroll]);

  useEffect(() => {
    if (!open) return;
    const narrow = window.matchMedia?.('(max-width: 980px)');
    if (!narrow) return;
    const change = (event: MediaQueryListEvent) => { if (!event.matches) setOpen(false); };
    narrow.addEventListener('change', change);
    return () => narrow.removeEventListener('change', change);
  }, [open]);

  return <>
    <header {...props} ref={ref} className={cx('header', hideOnScroll && away && !open && 'is-away', className)}>
      {strip && <div className="strip"><div className="strip-inner"><div>{strip.left}</div><div>{strip.right}</div></div></div>}
      <div className="navbar"><div className="navbar-inner">
        <div className="navbar-left">
          {brand}
          <nav className="navbar-links" aria-label="Primary">
            {links.map((link) => <Fragment key={link.href}>{renderLink(link, {
              className: 'link', 'aria-current': link.active ? 'page' : undefined, children: link.label,
            })}</Fragment>)}
          </nav>
        </div>
        <div className="navbar-right">
          {right}
          <IconButton label="Open menu" className="burger" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(true)}>
            <Icon name="menu" size={20} />
          </IconButton>
        </div>
      </div></div>
      {children}
    </header>
    {open && <Portal><MobileSheet id={id} brand={brand} links={links} renderLink={renderLink}
      onSearch={onSearch} sheetFoot={sheetFoot} onClose={() => setOpen(false)} /></Portal>}
  </>;
});


