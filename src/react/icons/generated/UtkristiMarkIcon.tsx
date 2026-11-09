import { useId, type SVGProps } from 'react';

export const UtkristiMarkIconData = {
  name: "utkristi-mark",
  plate: "M2.1 15.4 9.5 8a1.2 1.2 0 0 1 1.7 0l2.3 2.3a1.2 1.2 0 0 1 0 1.7l-7.4 7.4a1.2 1.2 0 0 1-1.7 0L2.1 17a1.2 1.2 0 0 1 0-1.6Z",
  line: "M2.5 15.4 9.6 8.3a1.2 1.2 0 0 1 1.7 0l2.2 2.2a1.2 1.2 0 0 1 0 1.7l-7.1 7.1a1.2 1.2 0 0 1-1.7 0l-2.2-2.2a1.2 1.2 0 0 1 0-1.7Zm8.2 1.8 7.1-7.1a1.2 1.2 0 0 1 1.7 0l2.2 2.2a1.2 1.2 0 0 1 0 1.7l-7.1 7.1a1.2 1.2 0 0 1-1.7 0l-2.2-2.2a1.2 1.2 0 0 1 0-1.7ZM16.2 4.8l2.5-2.5a1 1 0 0 1 1.4 0l2.5 2.5a1 1 0 0 1 0 1.4l-2.5 2.5a1 1 0 0 1-1.4 0l-2.5-2.5a1 1 0 0 1 0-1.4Z",
  filled: "M2.1 15.4 9.5 8a1.2 1.2 0 0 1 1.7 0l2.3 2.3a1.2 1.2 0 0 1 0 1.7l-7.4 7.4a1.2 1.2 0 0 1-1.7 0L2.1 17a1.2 1.2 0 0 1 0-1.6Zm8.3 1.9 7.4-7.4a1.2 1.2 0 0 1 1.7 0l2.3 2.3a1.2 1.2 0 0 1 0 1.7l-7.4 7.4a1.2 1.2 0 0 1-1.7 0l-2.3-2.3a1.2 1.2 0 0 1 0-1.7Zm5.7-12.5 2.6-2.6a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4L20.1 8.8a1 1 0 0 1-1.4 0l-2.6-2.6a1 1 0 0 1 0-1.4Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function UtkristiMarkIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={UtkristiMarkIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={UtkristiMarkIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={UtkristiMarkIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={UtkristiMarkIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={UtkristiMarkIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={UtkristiMarkIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={UtkristiMarkIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={UtkristiMarkIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={UtkristiMarkIconData.filled} />
        {UtkristiMarkIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={UtkristiMarkIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={UtkristiMarkIconData.line} />
    </svg>
  );
}
