import { useId, type SVGProps } from 'react';

export const SlidersIconData = {
  name: "sliders",
  plate: "M4 5h16v14H4V5Z",
  line: "M4 7h9m4 0h3M13 5v4M4 12h3m4 0h9M7 10v4M4 17h11m4 0h1m-5-2v4",
  filled: "M13 4a1 1 0 0 1 1 1v1h6a1 1 0 1 1 0 2h-6v1a1 1 0 1 1-2 0V8H4a1 1 0 1 1 0-2h8V5a1 1 0 0 1 1-1ZM7 9a1 1 0 0 1 1 1v1h12a1 1 0 1 1 0 2H8v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h2v-1a1 1 0 0 1 1-1Zm8 5a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-4v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h10v-1a1 1 0 0 1 1-1Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function SlidersIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={SlidersIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={SlidersIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={SlidersIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={SlidersIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={SlidersIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={SlidersIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={SlidersIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={SlidersIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={SlidersIconData.filled} />
        {SlidersIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={SlidersIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={SlidersIconData.line} />
    </svg>
  );
}
