import { useId, type SVGProps } from 'react';

export const SettingsIconData = {
  name: "settings",
  plate: "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z",
  line: "M9.187 5.209L10.347 4.838L10.514 2.617L13.486 2.617L13.653 4.838L14.813 5.209L15.895 5.767L17.584 4.314L19.686 6.416L18.233 8.105L18.791 9.187L19.162 10.347L21.383 10.514L21.383 13.486L19.162 13.653L18.791 14.813L18.233 15.895L19.686 17.584L17.584 19.686L15.895 18.233L14.813 18.791L13.653 19.162L13.486 21.383L10.514 21.383L10.347 19.162L9.187 18.791L8.105 18.233L6.416 19.686L4.314 17.584L5.767 15.895L5.209 14.813L4.838 13.653L2.617 13.486L2.617 10.514L4.838 10.347L5.209 9.187L5.767 8.105L4.314 6.416L6.416 4.314L8.105 5.767ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  filled: "M9.187 5.209L10.347 4.838L10.514 2.617L13.486 2.617L13.653 4.838L14.813 5.209L15.895 5.767L17.584 4.314L19.686 6.416L18.233 8.105L18.791 9.187L19.162 10.347L21.383 10.514L21.383 13.486L19.162 13.653L18.791 14.813L18.233 15.895L19.686 17.584L17.584 19.686L15.895 18.233L14.813 18.791L13.653 19.162L13.486 21.383L10.514 21.383L10.347 19.162L9.187 18.791L8.105 18.233L6.416 19.686L4.314 17.584L5.767 15.895L5.209 14.813L4.838 13.653L2.617 13.486L2.617 10.514L4.838 10.347L5.209 9.187L5.767 8.105L4.314 6.416L6.416 4.314L8.105 5.767ZM15.7 12a3.7 3.7 0 1 1-7.4 0 3.7 3.7 0 0 1 7.4 0Z",
  detail: "M13.4 12a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z",
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function SettingsIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={SettingsIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={SettingsIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={SettingsIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={SettingsIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={SettingsIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={SettingsIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={SettingsIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={SettingsIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={SettingsIconData.filled} />
        {SettingsIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={SettingsIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={SettingsIconData.line} />
    </svg>
  );
}
