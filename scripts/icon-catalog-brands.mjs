// Monochrome identification marks. Company names remain trademarks of their owners.
const marks = [
  ['microsoft', 'Microsoft', 'M3 3h8v8H3ZM13 3h8v8h-8ZM3 13h8v8H3ZM13 13h8v8h-8Z'],
  ['adobe', 'Adobe', 'M3 3h7L3 21ZM14 3h7v18ZM12 10l4 11h-3l-1-3H8Z'],
  ['vercel', 'Vercel', 'M12 4 22 21H2Z'],
  ['netflix', 'Netflix', 'M5 3h4v18H5ZM15 3h4v18h-4ZM5 3h4l10 18h-4Z'],
  ['figma', 'Figma', 'M8 2h4v7H8a3.5 3.5 0 0 1 0-7ZM12 2h4a3.5 3.5 0 0 1 0 7h-4ZM8 9h4v7H8a3.5 3.5 0 0 1 0-7ZM12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0ZM8 16h4v3.5A3.5 3.5 0 1 1 8 16Z'],
  ['linear', 'Linear', 'M4 15 9 20A9 9 0 0 1 4 15ZM3 10l11 11a9 9 0 0 1-3 .1L2.9 13A9 9 0 0 1 3 10ZM5 6l13 13-2 1L4 8ZM8 3.8A9 9 0 0 1 20.2 16Z'],
];
export const brandIcons = marks.map(([name, label, filled]) => ({
  name, group: 'Brands', description: label + ' company mark.',
  keywords: [label.toLowerCase(), 'company', 'brand', 'logo'],
  styles: ['line', 'filled', 'duotone'], has3d: true,
  plate: filled, filled, line: filled,
}));
