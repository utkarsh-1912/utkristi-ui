import { useId, type SVGProps } from 'react';

export const EyeOffIconData = {
  name: "eye-off",
  plate: "M4 12c2.5-4 5.2-6 8-6s5.5 2 8 6c-2.5 4-5.2 6-8 6s-5.5-2-8-6Z",
  line: "m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.8 9.8 0 0 1 12 5c3.8 0 7 2 9.5 7a11.7 11.7 0 0 1-3.2 4.2M6.2 6.3A11.5 11.5 0 0 0 2.5 12c2.5 5 5.7 7 9.5 7 1.8 0 3.5-.5 5-1.4",
  filled: "M3.7 2.3a1 1 0 0 0-1.4 1.4l3 3A12.4 12.4 0 0 0 1.4 11.5a1.1 1.1 0 0 0 0 1C4 17.6 7.6 20 12 20c2.2 0 4.2-.6 6-1.7l2.3 2.3a1 1 0 0 0 1.4-1.4l-18-18ZM12 15.5a3.5 3.5 0 0 1-3.5-3.5c0-.6.2-1.2.5-1.7l4.7 4.7c-.5.3-1.1.5-1.7.5ZM9.2 4.4A10.6 10.6 0 0 1 12 4c4.4 0 8 2.4 10.6 7.5a1.1 1.1 0 0 1 0 1 13 13 0 0 1-3.3 4.2l-3.9-3.9a3.5 3.5 0 0 0-4.2-4.2L9.2 4.4Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function EyeOffIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={EyeOffIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={EyeOffIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={EyeOffIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={EyeOffIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={EyeOffIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={EyeOffIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={EyeOffIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={EyeOffIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={EyeOffIconData.filled} />
        {EyeOffIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={EyeOffIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={EyeOffIconData.line} />
    </svg>
  );
}
