import { useId, type SVGProps } from 'react';

export const TextStrikethroughIconData = {
  name: "text-strikethrough",
  plate: "M17.8 7.7H15q-.7-1.8-3.3-1.8-2.3 0-2.3 1.3 0 .9 1.5 1.4H7q-1-1.1-1-2.3C6 3.8 8.4 3 12 3q4.7 0 5.8 4.7ZM6 16h3q1 2 3.7 2 2.4 0 2.4-1.2 0-1-1.6-1.5H18q.8.9.8 2.2c0 2.6-2.6 3.5-6.1 3.5q-5.3 0-6.7-5ZM3 10.6h18v2.8H3Z",
  line: "M17 6q-1-2-5-2-5 0-5 3 0 2 3 3m4 4q4 1 4 3 0 3-6 3-4 0-6-2M3 12h18",
  filled: "M17.8 7.7H15q-.7-1.8-3.3-1.8-2.3 0-2.3 1.3 0 .9 1.5 1.4H7q-1-1.1-1-2.3C6 3.8 8.4 3 12 3q4.7 0 5.8 4.7ZM6 16h3q1 2 3.7 2 2.4 0 2.4-1.2 0-1-1.6-1.5H18q.8.9.8 2.2c0 2.6-2.6 3.5-6.1 3.5q-5.3 0-6.7-5ZM3 10.6h18v2.8H3Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function TextStrikethroughIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={TextStrikethroughIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={TextStrikethroughIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={TextStrikethroughIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={TextStrikethroughIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={TextStrikethroughIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={TextStrikethroughIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={TextStrikethroughIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={TextStrikethroughIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={TextStrikethroughIconData.filled} />
        {TextStrikethroughIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={TextStrikethroughIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={TextStrikethroughIconData.line} />
    </svg>
  );
}
