import { useId, type SVGProps } from 'react';

export const ScanFaceIconData = {
  name: "scan-face",
  plate: "M3 3h6v2H5v4H3Zm12 0h6v6h-2V5h-4ZM3 15h2v4h4v2H3Zm16 0h2v6h-6v-2h4ZM8 13l1.7-.8q2.3 3 4.6 0l1.7.8q-4 6-8 0ZM10.15 9.5a1.15 1.15 0 1 1 -2.3 0a1.15 1.15 0 1 1 2.3 0ZM16.15 9.5a1.15 1.15 0 1 1 -2.3 0a1.15 1.15 0 1 1 2.3 0Z",
  line: "M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4M9 10h.01m6 0h.01m-6 4q3 3 6 0",
  filled: "M3 3h6v2H5v4H3Zm12 0h6v6h-2V5h-4ZM3 15h2v4h4v2H3Zm16 0h2v6h-6v-2h4ZM8 13l1.7-.8q2.3 3 4.6 0l1.7.8q-4 6-8 0ZM10.15 9.5a1.15 1.15 0 1 1 -2.3 0a1.15 1.15 0 1 1 2.3 0ZM16.15 9.5a1.15 1.15 0 1 1 -2.3 0a1.15 1.15 0 1 1 2.3 0Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function ScanFaceIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={ScanFaceIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={ScanFaceIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={ScanFaceIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={ScanFaceIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={ScanFaceIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={ScanFaceIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={ScanFaceIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={ScanFaceIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={ScanFaceIconData.filled} />
        {ScanFaceIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={ScanFaceIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={ScanFaceIconData.line} />
    </svg>
  );
}
