import { useId, type SVGProps } from 'react';

export const LinkIconData = {
  name: "link",
  plate: "M6 8h12v8H6V8Z",
  line: "M10 13a5 5 0 0 0 7.1 0l2.8-2.8a5 5 0 0 0-7.1-7.1L11 4.9M14 11a5 5 0 0 0-7.1 0l-2.8 2.8a5 5 0 0 0 7.1 7.1l1.8-1.8",
  filled: "M13.384 3.143C15.549 0.978 19.06 0.978 21.226 3.143C23.391 5.309 23.391 8.82 21.226 10.985L18.643 13.568C18.275 13.844 17.761 13.807 17.437 13.483C17.112 13.158 17.076 12.644 17.351 12.277L19.934 9.694C21.386 8.241 21.386 5.887 19.934 4.435C18.482 2.983 16.128 2.983 14.676 4.435L13.015 6.095C12.798 6.384 12.433 6.52 12.08 6.443C11.728 6.366 11.452 6.091 11.375 5.738C11.298 5.386 11.434 5.02 11.723 4.804L13.384 3.143L13.384 3.143ZM5.357 10.432C5.725 10.156 6.239 10.193 6.563 10.517C6.888 10.842 6.924 11.356 6.649 11.723L4.066 14.306C2.614 15.759 2.614 18.113 4.066 19.565C5.518 21.017 7.872 21.017 9.324 19.565L10.985 17.905C11.202 17.616 11.567 17.48 11.92 17.557C12.272 17.634 12.548 17.909 12.625 18.262C12.702 18.614 12.566 18.98 12.277 19.196L10.616 20.857C8.451 23.022 4.94 23.022 2.774 20.857C0.609 18.691 0.609 15.18 2.774 13.015L5.357 10.432L5.357 10.432ZM9.509 14.491 14.122 9.878C14.489 9.603 15.003 9.639 15.328 9.964C15.653 10.288 15.689 10.802 15.414 11.17L10.801 15.783C10.433 16.058 9.919 16.022 9.595 15.697C9.27 15.372 9.234 14.858 9.509 14.491Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function LinkIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={LinkIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={LinkIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={LinkIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={LinkIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={LinkIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={LinkIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={LinkIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={LinkIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={LinkIconData.filled} />
        {LinkIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={LinkIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={LinkIconData.line} />
    </svg>
  );
}
