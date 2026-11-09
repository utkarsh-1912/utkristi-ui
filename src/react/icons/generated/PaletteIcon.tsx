import { useId, type SVGProps } from 'react';

export const PaletteIconData = {
  name: "palette",
  plate: "M12 4a8 8 0 1 0 0 16 2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h2a2 2 0 0 0 2-2 8 8 0 0 0-8-9Z",
  line: "M12 3a9 9 0 1 0 0 18 2.5 2.5 0 0 0 2.5-2.5c0-.6-.2-1.1-.2-1.5 0-1.1.9-2 2-2H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9ZM7.5 10.5h.01M10.5 7.5h.01M14.5 7.5h.01M16.5 10.5h.01",
  filled: "M12 2a10 10 0 1 0 0 20 3.5 3.5 0 0 0 3.5-3.5c0-.4-.1-.8-.2-1.1-.1-.3.1-.4.5-.4H18a4 4 0 0 0 4-4A10 10 0 0 0 12 2Zm-4.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm3-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm2.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z",
  detail: "M7.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm3-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z",
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function PaletteIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={PaletteIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={PaletteIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={PaletteIconData.line} />
      </svg>
    );
  }
  if (variant === '2.5d') {
    const faceId = `ut-face-${uid}`;
    const shadowId = `ut-shadow-${uid}`;
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <defs>
          <linearGradient id={faceId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--ut-icon-hi)" />
            <stop offset="55%" stopColor="var(--ut-icon-base)" />
            <stop offset="100%" stopColor="var(--ut-icon-shade)" />
          </linearGradient>
          <filter id={shadowId} x="-25%" y="-20%" width="150%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodColor="var(--ut-icon-shadow, rgba(0,0,0,.35))" />
          </filter>
        </defs>
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={PaletteIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={PaletteIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={PaletteIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={PaletteIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={PaletteIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={PaletteIconData.filled} />
        {PaletteIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={PaletteIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={PaletteIconData.line} />
    </svg>
  );
}
