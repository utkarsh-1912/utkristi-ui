import { useId, type SVGProps } from 'react';

export const HomeIconData = {
  name: "home",
  plate: "M5 10.5 12 4l7 6.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8.5Z",
  line: "m3 11 9-8 9 8M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9M10 21v-6h4v6",
  filled: "M11.3 2.3a1 1 0 0 1 1.4 0l8 7.2a1 1 0 0 1 .3.7V19a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8.8a1 1 0 0 1 .3-.7l8-7.2ZM10 15v5h4v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1Z",
  detail: "M10 14h4v6h-4v-6Z",
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function HomeIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={HomeIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={HomeIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={HomeIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={HomeIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={HomeIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={HomeIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={HomeIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={HomeIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={HomeIconData.filled} />
        {HomeIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={HomeIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={HomeIconData.line} />
    </svg>
  );
}
