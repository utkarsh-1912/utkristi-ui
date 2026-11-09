import { useId, type SVGProps } from 'react';

export const ApiIconData = {
  name: "api",
  plate: "M6 6h12v12H6V6Z",
  line: "m9 15 6-6M8 6l-2 2a4 4 0 0 0 5.6 5.6l2-2m2.4-1.2 2-2A4 4 0 0 0 12.4 2.8l-2 2M4 20l3-3m10-10 3-3",
  filled: "M19.3 3.3a1 1 0 0 1 1.4 1.4l-2.1 2.1a5 5 0 0 1-.8 6.1l-2 2a1 1 0 0 1-1.4 0l-5.2-5.2a1 1 0 0 1 0-1.4l2-2a5 5 0 0 1 6.1-.8l2-2.2ZM6.7 9.9a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4l-1.3 1.3a5 5 0 0 1-6.1.8l-2 2a1 1 0 0 1-1.4-1.4l2-2a5 5 0 0 1 .8-6.1l.6-.6Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function ApiIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={ApiIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={ApiIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={ApiIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={ApiIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={ApiIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={ApiIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={ApiIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={ApiIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={ApiIconData.filled} />
        {ApiIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={ApiIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={ApiIconData.line} />
    </svg>
  );
}
