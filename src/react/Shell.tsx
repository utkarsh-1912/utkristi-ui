import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Footer, type FooterProps } from './Footer.js';
import { Navbar, type NavbarProps } from './Navbar.js';
import { cx } from './utils/cx.js';

export interface ShellProps extends HTMLAttributes<HTMLDivElement> {
  navbar?: NavbarProps;
  footer?: FooterProps;
  mainClassName?: string;
  grain?: boolean;
  after?: ReactNode;
}

export const Shell = forwardRef<HTMLDivElement, ShellProps>(function Shell(
  { navbar, footer, mainClassName, grain, after, children, className, ...props }, ref,
) {
  return <div {...props} ref={ref} className={cx('shell', className)}>
    {grain && <div className="grain" aria-hidden="true" />}
    {navbar && <Navbar {...navbar} />}
    <main className={cx('page', mainClassName)}>{children}</main>
    {footer && <Footer {...footer} />}
    {after}
  </div>;
});
