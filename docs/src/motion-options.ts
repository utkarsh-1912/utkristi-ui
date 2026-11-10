export const motionOptions = [
  ['rise', 'Rise'], ['fade', 'Fade'], ['scale', 'Scale'], ['slide', 'Slide'], ['none', 'No motion'],
] as const;
export type PreviewMotion = typeof motionOptions[number][0];

export function exampleMotion(slug: string): PreviewMotion {
  if (/dialog|modal|popover|menu|tooltip|column-chooser/.test(slug)) return 'scale';
  if (/navbar|drawer|sheet|carousel|sidebar|timeline/.test(slug)) return 'slide';
  if (/spinner|loader|skeleton|progress|video/.test(slug)) return 'fade';
  return 'rise';
}
