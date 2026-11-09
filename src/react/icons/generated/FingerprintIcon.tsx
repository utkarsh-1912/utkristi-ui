import { useId, type SVGProps } from 'react';

export const FingerprintIconData = {
  name: "fingerprint",
  plate: "M3 12a9 9 0 1 1 18 0q0 3-1.3 5.4l-1.8-1Q19 14 19 12a7 7 0 0 0-14 0Zm2 4q1-2 1-4a6 6 0 0 1 12 0q0 5-2.4 8.6l-1.7-1.1Q16 16 16 12a4 4 0 1 0-8 0q0 2.5-1.3 5Zm3 2q1-2.2 1-6a3 3 0 1 1 6 0q0 5-2.4 8.8l-1.7-1.1Q13 16 13 12a1 1 0 1 0-2 0q0 4.2-1.2 7Z",
  line: "M4 12a8 8 0 0 1 16 0m-14 4q1-2 1-4a5 5 0 0 1 10 0q0 4-2 8m-6-2q1-2 1-6a2 2 0 0 1 4 0q0 5-2 8m6-4q1-2 1-4",
  filled: "M3 12a9 9 0 1 1 18 0q0 3-1.3 5.4l-1.8-1Q19 14 19 12a7 7 0 0 0-14 0Zm2 4q1-2 1-4a6 6 0 0 1 12 0q0 5-2.4 8.6l-1.7-1.1Q16 16 16 12a4 4 0 1 0-8 0q0 2.5-1.3 5Zm3 2q1-2.2 1-6a3 3 0 1 1 6 0q0 5-2.4 8.8l-1.7-1.1Q13 16 13 12a1 1 0 1 0-2 0q0 4.2-1.2 7Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function FingerprintIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={FingerprintIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={FingerprintIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={FingerprintIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={FingerprintIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={FingerprintIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={FingerprintIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={FingerprintIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={FingerprintIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={FingerprintIconData.filled} />
        {FingerprintIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={FingerprintIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={FingerprintIconData.line} />
    </svg>
  );
}
