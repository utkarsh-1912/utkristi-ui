import { useId, type SVGProps } from 'react';

export const ChartScatterIconData = {
  name: "chart-scatter",
  plate: "M3 3h2.5v15.5H21V21H3ZM9.6 15a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0ZM13.6 10a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0ZM17.6 13a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0ZM20.6 6a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0Z",
  line: "M4 4v16h16M8 15h.01m4-5h.01m4 3h.01m3-7h.01",
  filled: "M3 3h2.5v15.5H21V21H3ZM9.6 15a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0ZM13.6 10a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0ZM17.6 13a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0ZM20.6 6a1.6 1.6 0 1 1 -3.2 0a1.6 1.6 0 1 1 3.2 0Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function ChartScatterIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={ChartScatterIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={ChartScatterIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={ChartScatterIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={ChartScatterIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={ChartScatterIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={ChartScatterIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={ChartScatterIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={ChartScatterIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={ChartScatterIconData.filled} />
        {ChartScatterIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={ChartScatterIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={ChartScatterIconData.line} />
    </svg>
  );
}
