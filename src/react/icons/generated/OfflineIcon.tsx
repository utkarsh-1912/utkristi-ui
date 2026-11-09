import { useId, type SVGProps } from 'react';

export const OfflineIconData = {
  name: "offline",
  plate: "M5 10a7 7 0 0 1 14 0v6H5v-6Z",
  line: "m3 3 18 18M16.7 11a8 8 0 0 0-9.4 0M20 8a12.5 12.5 0 0 0-11.3-2.5M8.5 14.5a4 4 0 0 1 7 0M12 18h.01",
  filled: "M3.923 1.345C3.536 1.054 2.994 1.093 2.651 1.435C2.309 1.777 2.27 2.32 2.561 2.707L5.48 5.626C4.795 5.99 4.144 6.413 3.534 6.891C3.229 7.12 3.086 7.505 3.167 7.877C3.248 8.249 3.539 8.539 3.911 8.621C4.283 8.702 4.668 8.558 4.896 8.254C5.516 7.9 6.167 7.607 6.843 7.378L8.886 9.421C8.116 9.696 7.393 10.09 6.745 10.589C6.315 10.911 6.228 11.521 6.551 11.951C6.873 12.381 7.483 12.468 7.913 12.146C8.668 11.628 9.535 11.294 10.443 11.173L12.584 13.314C11.468 12.791 10.144 13.024 9.275 13.898C8.971 14.126 8.827 14.511 8.908 14.883C8.989 15.255 9.28 15.546 9.652 15.627C10.024 15.708 10.409 15.564 10.638 15.26C11.205 14.704 12.114 14.704 12.681 15.26L20.077 22.655C20.464 22.946 21.006 22.907 21.349 22.565C21.691 22.223 21.73 21.68 21.439 21.293L3.923 3.777L3.923 1.345ZM12 15.649C11.194 15.649 10.54 16.303 10.54 17.109C10.54 17.915 11.194 18.568 12 18.568C12.806 18.568 13.46 17.915 13.46 17.109C13.46 16.303 12.806 15.649 12 15.649Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function OfflineIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={OfflineIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={OfflineIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={OfflineIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={OfflineIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={OfflineIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={OfflineIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={OfflineIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={OfflineIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={OfflineIconData.filled} />
        {OfflineIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={OfflineIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={OfflineIconData.line} />
    </svg>
  );
}
