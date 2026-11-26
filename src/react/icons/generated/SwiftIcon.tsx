import { useId, type SVGProps } from 'react';

export const SwiftIconData = {
  name: "swift",
  plate: "M20.5 18.8c-1.1-1.5-2.8-1.4-4.1-.7-3.9 2.2-9.6 1.7-13.9-2.8 3.2 1.6 6.8 1.7 9.4.2-3.4-2.4-6.4-5.4-8.4-8.8 3.4 2.3 6.9 4.2 10 5.3-1.6-2.4-2.9-4.9-3.6-7.5 4.2 3.2 7.2 7.2 8.4 11.4 1 1.1 1.7 2.1 2.2 3.1Z",
  line: "M3.5 16c4 3.5 9.5 3.8 13.2 1.6 1.2-.7 2.5-.7 3.5.4-.5-1-1.1-2-2-3-1.2-4-4-7.8-8-10.8.7 2.4 1.9 4.7 3.4 7-3-1.1-6.3-3-9.5-5.2 1.9 3.3 4.8 6.2 8.1 8.5-2.5 1.4-5.8 1.3-8.7-.2Z",
  filled: "M20.5 18.8c-1.1-1.5-2.8-1.4-4.1-.7-3.9 2.2-9.6 1.7-13.9-2.8 3.2 1.6 6.8 1.7 9.4.2-3.4-2.4-6.4-5.4-8.4-8.8 3.4 2.3 6.9 4.2 10 5.3-1.6-2.4-2.9-4.9-3.6-7.5 4.2 3.2 7.2 7.2 8.4 11.4 1 1.1 1.7 2.1 2.2 3.1Z",
  detail: undefined,
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function SwiftIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={SwiftIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={SwiftIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={SwiftIconData.line} />
      </svg>
    );
  }
  if (variant === '2.5d') {
    const faceId = `ut-face-${uid}`;
    const shadowId = `ut-shadow-${uid}`;
    return (
      <svg viewBox="-2 -2 31 31" width={size} height={size} fill="none" {...props}>
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={SwiftIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={SwiftIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={SwiftIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={SwiftIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={SwiftIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={SwiftIconData.filled} />
        {SwiftIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={SwiftIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={SwiftIconData.line} />
    </svg>
  );
}
