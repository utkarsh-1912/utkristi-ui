import { useId, type SVGProps } from 'react';

export const BikeIconData = {
  name: "bike",
  plate: "M12 16a5 5 0 1 1 -10 0a5 5 0 1 1 10 0ZM10 16a3 3 0 1 1 -6 0a3 3 0 1 1 6 0ZM22 16a5 5 0 1 1 -10 0a5 5 0 1 1 10 0ZM20 16a3 3 0 1 1 -6 0a3 3 0 1 1 6 0ZM7 15l4-7h3l1-4h5v2h-3l-1 3 2 6-2 .7-1.9-5.7H12l-3.3 6Zm1-10h5v2H8Z",
  line: "M3 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm10 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm-6 0 4-7h4l2 7m-6-7-2-3h3m3 3 1-4h3",
  filled: "M12 16a5 5 0 1 1 -10 0a5 5 0 1 1 10 0ZM10 16a3 3 0 1 1 -6 0a3 3 0 1 1 6 0ZM22 16a5 5 0 1 1 -10 0a5 5 0 1 1 10 0ZM20 16a3 3 0 1 1 -6 0a3 3 0 1 1 6 0ZM7 15l4-7h3l1-4h5v2h-3l-1 3 2 6-2 .7-1.9-5.7H12l-3.3 6Zm1-10h5v2H8Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function BikeIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={BikeIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={BikeIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={BikeIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={BikeIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={BikeIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={BikeIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={BikeIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={BikeIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={BikeIconData.filled} />
        {BikeIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={BikeIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={BikeIconData.line} />
    </svg>
  );
}
