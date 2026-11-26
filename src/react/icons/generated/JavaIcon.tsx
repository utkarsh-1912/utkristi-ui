import { useId, type SVGProps } from 'react';

export const JavaIconData = {
  name: "java",
  plate: "M5 10h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5Z",
  line: "M5 10h10v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5Zm10 1h2.5a2 2 0 0 1 0 4H15M4 21h14M8.5 7c-.8-1 .8-2 0-3M12.5 7c-.8-1 .8-2 0-3",
  filled: "M4.5 9.5h11.5v1h1.8a2.8 2.8 0 0 1 0 5.6H16a5 5 0 0 1-4.8 3.9H9.5A5 5 0 0 1 4.5 15V9.5Zm11.5 2.3v2.5h1.6a1.25 1.25 0 0 0 0-2.5H16ZM4 20.5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1ZM8.5 7.5a.9.9 0 0 1-.7-1.4c.4-.6.4-.8 0-1.4a.9.9 0 1 1 1.4-1c.8 1.1.8 2 0 3.2a.9.9 0 0 1-.7.6Zm4 0a.9.9 0 0 1-.7-1.4c.4-.6.4-.8 0-1.4a.9.9 0 1 1 1.4-1c.8 1.1.8 2 0 3.2a.9.9 0 0 1-.7.6Z",
  detail: undefined,
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function JavaIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={JavaIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={JavaIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={JavaIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={JavaIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={JavaIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={JavaIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={JavaIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={JavaIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={JavaIconData.filled} />
        {JavaIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={JavaIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={JavaIconData.line} />
    </svg>
  );
}
