import { useId, type SVGProps } from 'react';

export const RocketIconData = {
  name: "rocket",
  plate: "M14 4c3 0 6 3 6 6-2 4-5 7-9 9l-5-5c2-4 5-7 8-10Z",
  line: "M4.5 16.5c-1.5 1.3-2 4.5-2 4.5s3.2-.5 4.5-2c.7-.8.7-2 0-2.8-.8-.7-2-.7-2.5.3ZM12 15l-3-3c1.5-4.5 4.8-7.8 11-9-1.2 6.2-4.5 9.5-8 12Zm-3-3L4 11l3-3 2 4Zm3 3 1 5 3-3-4-2Zm2.5-6.5h.01",
  filled: "M20.855 1.15C21.192 1.242 21.456 1.506 21.548 1.843C22.935 7.985 19.765 11.552 14.415 14.524L15.307 18.684C15.364 19.012 15.253 19.347 15.01 19.576L12.038 22.548C11.782 22.813 11.4 22.914 11.046 22.81C10.692 22.706 10.426 22.414 10.354 22.052L9.462 17.595L7.382 15.514L2.924 14.623C2.563 14.551 2.271 14.284 2.167 13.93C2.063 13.577 2.164 13.195 2.429 12.939L5.401 9.967C5.629 9.724 5.964 9.612 6.292 9.669L10.453 10.561C14.415 5.212 17.982 2.042 20.855 1.15ZM15.208 6.995C14.387 6.995 13.722 7.66 13.722 8.481C13.722 9.301 14.387 9.967 15.208 9.967C16.029 9.967 16.694 9.301 16.694 8.481C16.694 7.66 16.029 6.995 15.208 6.995ZM4.806 15.118C5.445 14.162 6.716 13.867 7.71 14.443C8.705 15.019 9.081 16.268 8.571 17.297C7.58 18.486 5.104 19.08 3.816 19.279C4.014 17.991 4.608 15.514 4.806 15.118Z",
  detail: "M14.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z",
  has3d: true,
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function RocketIcon({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={RocketIconData.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={RocketIconData.line} />
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={`url(#${shadowId})`} fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
        </g>
        <path fill={`url(#${faceId})`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={RocketIconData.filled} />
        {RocketIconData.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={RocketIconData.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={RocketIconData.line} />
    </svg>
  );
}
