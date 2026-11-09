import { useId, type SVGProps } from 'react';

export const PeopleIconData = {
  name: "people",
  plate: "M3 18a5 5 0 0 1 12 0v2H3v-2Zm6-12a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z",
  line: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M16 3.3a4 4 0 0 1 0 7.4M21 20v-1a5 5 0 0 0-3.5-4.8",
  filled: "M9 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM2 19a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1Zm14.2-15.6a1 1 0 0 1 1.3-.5 5 5 0 0 1 0 9.2 1 1 0 0 1-.8-1.8 3 3 0 0 0 0-5.6 1 1 0 0 1-.5-1.3Zm1.6 10.9A6 6 0 0 1 22 20a1 1 0 1 1-2 0 4 4 0 0 0-2.8-3.8 1 1 0 0 1 .6-1.9Z",
  detail: "M9 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function PeopleIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={PeopleIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={PeopleIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={PeopleIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={PeopleIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={PeopleIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={PeopleIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={PeopleIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={PeopleIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={PeopleIconData.filled} />
        {PeopleIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={PeopleIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={PeopleIconData.line} />
    </svg>
  );
}
