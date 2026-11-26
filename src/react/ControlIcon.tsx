interface ControlIconProps {
  glyph: { line: string };
  size?: number;
  className?: string;
}

/** The line glyph used by a control, without the public icon catalog. */
export function ControlIcon({ glyph, size = 16, className }: ControlIconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth={size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2}
    strokeLinecap="round" strokeLinejoin="round" className={className ? 'icon icon-line ' + className : 'icon icon-line'} aria-hidden="true">
    <path d={glyph.line} />
  </svg>;
}
