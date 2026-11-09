import { useId, type SVGProps } from 'react';

export const CallLeaveIconData = {
  name: "call-leave",
  plate: "M3 11c4.5-3.5 13.5-3.5 18 0l-2 4h-4l-1-2H10l-1 2H5l-2-4Z",
  line: "M3 13.5c4.5-4.5 13.5-4.5 18 0l-1.8 2.8a1.5 1.5 0 0 1-1.8.5l-2.9-1.2a1.5 1.5 0 0 1-.9-1.4V12a10 10 0 0 0-3.2 0v2.2a1.5 1.5 0 0 1-.9 1.4l-2.9 1.2a1.5 1.5 0 0 1-1.8-.5L3 13.5Z",
  filled: "M12 9c4 0 7.7 1.3 10.2 3.8a1 1 0 0 1 .1 1.3l-1.8 2.8a2.5 2.5 0 0 1-3 .8L14.6 16a2.5 2.5 0 0 1-1.5-2.3v-1.5a9 9 0 0 0-2.2 0v1.5a2.5 2.5 0 0 1-1.5 2.3l-2.9 1.2a2.5 2.5 0 0 1-3-.8l-1.8-2.8a1 1 0 0 1 .1-1.3C4.3 10.3 8 9 12 9Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function CallLeaveIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={CallLeaveIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={CallLeaveIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={CallLeaveIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={CallLeaveIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={CallLeaveIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={CallLeaveIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={CallLeaveIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={CallLeaveIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={CallLeaveIconData.filled} />
        {CallLeaveIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={CallLeaveIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={CallLeaveIconData.line} />
    </svg>
  );
}
