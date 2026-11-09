import type { ReactNode, SVGProps } from 'react';

const paths = {
  arrowLeft: <path d="m12 19-7-7 7-7M5 12h14" />,
  arrowRight: <path d="m12 5 7 7-7 7M5 12h14" />,
  arrowUp: <path d="M12 19V5m-7 7 7-7 7 7" />,
  arrowDown: <path d="M12 5v14m-7-7 7 7 7-7" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" />,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42" /></>,
  moon: <path d="M20.9 13.34A9 9 0 0 1 10.66 3.1 9 9 0 1 0 20.9 13.34Z" />,
  check: <path d="m20 6-11 11-5-5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
} satisfies Record<string, ReactNode>;

export function Icon({ name, size = 16, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
