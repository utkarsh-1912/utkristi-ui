import { useId, type SVGProps } from 'react';

export const BranchIconData = {
  name: "branch",
  plate: "M6 5h12v14H6V5Z",
  line: "M6.286 4.857V16.286M6.286 16.286C4.708 16.286 3.429 17.565 3.429 19.143C3.429 20.721 4.708 22 6.286 22C7.864 22 9.143 20.721 9.143 19.143M6.286 16.286C6.286 14.708 7.565 13.429 9.143 13.429H14.857C16.435 13.429 17.714 12.149 17.714 10.571V7.714M17.714 7.714C19.292 7.714 20.571 6.435 20.571 4.857C20.571 3.279 19.292 2 17.714 2C16.136 2 14.857 3.279 14.857 4.857C14.857 6.435 16.136 7.714 17.714 7.714Z",
  filled: "M6.427 2.247C6.94 2.247 7.356 2.663 7.356 3.176V11.721C7.949 11.502 8.588 11.438 9.213 11.536H14.787C15.813 11.536 16.644 10.704 16.644 9.678V8.563C14.833 8.095 13.652 6.353 13.887 4.497C14.123 2.641 15.702 1.25 17.573 1.25C19.444 1.25 21.024 2.641 21.259 4.497C21.495 6.353 20.314 8.095 18.502 8.563V9.678C18.502 11.73 16.839 13.393 14.787 13.393H9.213C8.187 13.393 7.356 14.225 7.356 15.251V15.437C9.167 15.905 10.348 17.647 10.113 19.503C9.877 21.359 8.298 22.75 6.427 22.75C4.556 22.75 2.976 21.359 2.741 19.503C2.505 17.647 3.686 15.905 5.498 15.437L5.498 3.176C5.498 2.663 5.914 2.247 6.427 2.247Z",
  detail: undefined,
  has3d: false,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function BranchIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={BranchIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={BranchIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={BranchIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={BranchIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={BranchIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={BranchIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={BranchIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={BranchIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={BranchIconData.filled} />
        {BranchIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={BranchIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={BranchIconData.line} />
    </svg>
  );
}
