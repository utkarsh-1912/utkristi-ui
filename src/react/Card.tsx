import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from './utils/cx.js';
import { geometryStyle, type ComponentGeometry } from './utils/geometry.js';

export interface CardProps extends HTMLAttributes<HTMLDivElement>, ComponentGeometry {
  well?: boolean;
  pane?: boolean;
  interactive?: boolean;
}
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ well, pane, interactive, className, radius, inlineSize, style, ...props }, ref) {
  return <div {...props} ref={ref} className={cx(pane ? 'pane' : 'card', well && 'card-well', interactive && 'card-interactive', className)}
    style={geometryStyle({ radius, inlineSize }, style)} />;
});
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHeader({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('card-head', className)} />;
});
export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardBody({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx('card-body', className)} />;
});
