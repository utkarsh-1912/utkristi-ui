import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Button, type ButtonProps } from './Button.js';
import { Icon } from './icons.js';
import { Menu, type MenuItem } from './Menu.js';
import { cx } from './utils/cx.js';

export interface SplitItem {
  id?: string;
  title: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}
export interface SplitButtonProps extends HTMLAttributes<HTMLDivElement> {
  items: SplitItem[];
  label?: ReactNode;
  toggleLabel?: string;
  icon?: ReactNode;
  mainProps?: ButtonProps;
  align?: 'start' | 'end';
  onAction?: () => void;
}

export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButton(
  { items, label = 'New', toggleLabel = 'More actions', icon = <Icon name="plus" />, mainProps, align = 'start',
    onAction, className, children, ...props }, ref,
) {
  const options: MenuItem[] = items.map(({ title, sub, ...item }) => ({
    ...item, textValue: typeof title === 'string' ? title : undefined,
    label: <span className="menu-item-text"><b>{title}</b>{sub != null && <span>{sub}</span>}</span>,
  }));
  return <div {...props} ref={ref} className={cx('split-button', className)}>
    <Button onClick={onAction} {...mainProps} iconLeft={icon} className={cx('split-button-main', mainProps?.className)}>{children ?? label}</Button>
    <Menu items={options} align={align} menuClassName="split-button-pop" trigger={(trigger) =>
      <Button {...trigger} className="split-button-toggle" aria-label={toggleLabel}><Icon name="chevronDown" size={15} /></Button>
    } />
  </div>;
});
