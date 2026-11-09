import { useId, type SVGProps } from 'react';

export const RocketIconData = {
  name: "rocket",
  plate: "M14 4c3 0 6 3 6 6-2 4-5 7-9 9l-5-5c2-4 5-7 8-10Z",
  line: "M4.5 16.5c-1.5 1.3-2 4.5-2 4.5s3.2-.5 4.5-2c.7-.8.7-2 0-2.8-.8-.7-2-.7-2.5.3ZM12 15l-3-3c1.5-4.5 4.8-7.8 11-9-1.2 6.2-4.5 9.5-8 12Zm-3-3L4 11l3-3 2 4Zm3 3 1 5 3-3-4-2Zm2.5-6.5h.01",
  filled: "M20.2 2.1a1 1 0 0 1 .7.7c1.4 6.2-1.8 9.8-7.2 12.8l.9 4.2a1 1 0 0 1-.3.9l-3 3a1 1 0 0 1-1.7-.5l-.9-4.5-2.1-2.1-4.5-.9a1 1 0 0 1-.5-1.7l3-3a1 1 0 0 1 .9-.3l4.2.9C13.7 6.2 17.3 3 20.2 2.1ZM14.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM4 16.2a2.2 2.2 0 0 1 3.8 2.2c-1 1.2-3.5 1.8-4.8 2 .2-1.3.8-3.8 1-4.2Z",
  detail: "M14.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z",
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function RocketIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={RocketIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={RocketIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
        {RocketIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={RocketIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={RocketIconData.line} />
    </svg>
  );
}
