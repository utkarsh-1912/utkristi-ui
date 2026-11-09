import { useId, type SVGProps } from 'react';

export const CalendarIconData = {
  name: "calendar",
  plate: "M4 6h16v14H4V6Z",
  line: "M4 5h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm12-2v4M8 3v4m-6 3h20",
  filled: "M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h3a3 3 0 0 1 3 3v2H1V7a3 3 0 0 1 3-3h3V3a1 1 0 0 1 1-1ZM1 11h22v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-8Zm6 3a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Zm6 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Z",
  detail: "M7 13h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z",
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function CalendarIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={CalendarIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" d={CalendarIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={CalendarIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={CalendarIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={CalendarIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={CalendarIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={CalendarIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={CalendarIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={CalendarIconData.filled} />
        {CalendarIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={CalendarIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={CalendarIconData.line} />
    </svg>
  );
}
