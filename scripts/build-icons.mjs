import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { iconsPart1 } from './icon-catalog-part1.mjs';
import { iconsPart2 } from './icon-catalog-part2.mjs';
import { iconsPart3 } from './icon-catalog-part3.mjs';
import { buildClayGeometry, shadeClayRender } from './render-clay-3d.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const allIcons = [...iconsPart1, ...iconsPart2, ...iconsPart3];
if (new Set(allIcons.map(({ name }) => name)).size !== allIcons.length) throw new Error('Duplicate icon names in the catalog.');
const dimensionalViewBox = '-2 -2 31 31';
const allHues = ['blue', 'lime', 'violet', 'teal', 'amber', 'coral', 'rose', 'graphite'];
const allThemes = ['night', 'paper', 'glass'];

function toPascalCase(kebab) {
  return kebab.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('') + 'Icon';
}

function toCamelCase(kebab) {
  return kebab.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
}

function buildMasterSvg(icon) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">',
    `  <g data-layer="plate"><path fill="var(--ut-icon-tint)" fill-rule="evenodd" d="${icon.plate}" /></g>`,
    `  <g data-layer="line" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icon.line}" /></g>`,
    `  <g data-layer="filled" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}" />${
      icon.detail ? `<path data-detail="true" d="${icon.detail}" />` : ''
    }</g>`,
    '</svg>\n',
  ].join('\n');
}

function validateMasterSvg(name, svg) {
  if (!svg.includes('viewBox="0 0 24 24"')) {
    throw new Error(`Icon ${name}: missing viewBox="0 0 24 24"`);
  }
  if (/<style\b/i.test(svg)) {
    throw new Error(`Icon ${name}: <style> element is forbidden in source SVGs`);
  }
  if (/#[0-9a-fA-F]{3,8}\b/.test(svg)) {
    throw new Error(`Icon ${name}: raw hex colour is forbidden in source SVGs`);
  }
  for (const [, strokeVal] of svg.matchAll(/\bstroke="([^"]+)"/g)) {
    if (strokeVal !== 'currentColor' && !strokeVal.startsWith('var(--ut-icon-')) {
      throw new Error(`Icon ${name}: invalid stroke "${strokeVal}"`);
    }
  }
}

function buildStandaloneSvg(icon, style) {
  if (style === 'line') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icon.line}"/></svg>\n`;
  }
  if (style === 'filled') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}"/></svg>\n`;
  }
  if (style === 'duotone') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path class="icon-plate" fill="var(--ut-icon-tint)" fill-rule="evenodd" d="${icon.plate}"/><path class="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="${icon.line}"/></svg>\n`;
  }
  // 2.5d layered SVG
  const gradId = `ut-2d5-${icon.name}-face`;
  const shadowId = `ut-2d5-${icon.name}-shadow`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${dimensionalViewBox}" fill="none">`,
    '  <defs>',
    `    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">`,
    '      <stop offset="0%" stop-color="var(--ut-icon-hi)" />',
    '      <stop offset="55%" stop-color="var(--ut-icon-base)" />',
    '      <stop offset="100%" stop-color="var(--ut-icon-shade)" />',
    '    </linearGradient>',
    `    <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="150%">`,
    '      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="var(--ut-icon-shadow, rgba(0,0,0,.35))" />',
    '    </filter>',
    '  </defs>',
    `  <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" fill-rule="evenodd" transform="translate(0 2)" filter="url(#${shadowId})" d="${icon.filled}" />`,
    `  <g class="icon-2d5-ext" fill="var(--ut-icon-shade)">`,
    `    <path transform="translate(2.25 2.25)" fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}" />`,
    `    <path transform="translate(1.5 1.5)" fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}" />`,
    `    <path transform="translate(0.75 0.75)" fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}" />`,
    `    <path class="icon-2d5-ext-extra" transform="translate(3 3)" fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}" />`,
    '  </g>',
    `  <path fill="url(#${gradId})" stroke="var(--ut-icon-hi)" stroke-opacity=".7" stroke-width=".75" fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}" />`,
    icon.detail
      ? `  <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" stroke-width=".5" stroke-linecap="round" stroke-linejoin="round" d="${icon.detail}" />`
      : '',
    '</svg>\n',
  ].filter(Boolean).join('\n');
}

function buildGeneratedReactFile(icon) {
  const compName = toPascalCase(icon.name);
  const detailLiteral = icon.detail ? JSON.stringify(icon.detail) : 'undefined';
  return `import { useId, type SVGProps } from 'react';

export const ${compName}Data = {
  name: ${JSON.stringify(icon.name)},
  plate: ${JSON.stringify(icon.plate)},
  line: ${JSON.stringify(icon.line)},
  filled: ${JSON.stringify(icon.filled)},
  detail: ${detailLiteral},
  has3d: ${Boolean(icon.has3d)},
} as const;

export interface GeneratedIconProps extends SVGProps<SVGSVGElement> {
  variant?: 'line' | 'filled' | 'duotone' | '2.5d';
  size?: number;
}

export function ${compName}({ variant = 'line', size = 16, strokeWidth, ...props }: GeneratedIconProps) {
  const uid = useId().replace(/:/g, '');
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : size <= 20 ? 1.875 : 2);
  if (variant === 'filled') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d={${compName}Data.filled} />
      </svg>
    );
  }
  if (variant === 'duotone') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        <path className="icon-plate" fill="var(--ut-icon-tint)" fillRule="evenodd" d={${compName}Data.plate} />
        <path className="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" d={${compName}Data.line} />
      </svg>
    );
  }
  if (variant === '2.5d') {
    const faceId = \`ut-face-\${uid}\`;
    const shadowId = \`ut-shadow-\${uid}\`;
    return (
      <svg viewBox="${dimensionalViewBox}" width={size} height={size} fill="none" {...props}>
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
        <path fill="var(--ut-icon-shadow, rgba(0,0,0,.35))" transform="translate(0 2)" filter={\`url(#\${shadowId})\`} fillRule="evenodd" clipRule="evenodd" d={${compName}Data.filled} />
        <g className="icon-2d5-ext" fill="var(--ut-icon-shade)">
          <path transform="translate(2.25 2.25)" fillRule="evenodd" clipRule="evenodd" d={${compName}Data.filled} />
          <path transform="translate(1.5 1.5)" fillRule="evenodd" clipRule="evenodd" d={${compName}Data.filled} />
          <path transform="translate(0.75 0.75)" fillRule="evenodd" clipRule="evenodd" d={${compName}Data.filled} />
          <path className="icon-2d5-ext-extra" transform="translate(3 3)" fillRule="evenodd" clipRule="evenodd" d={${compName}Data.filled} />
        </g>
        <path fill={\`url(#\${faceId})\`} stroke="var(--ut-icon-hi)" strokeOpacity={0.7} strokeWidth={0.85} fillRule="evenodd" clipRule="evenodd" d={${compName}Data.filled} />
        {${compName}Data.detail && <path fill="var(--ut-icon-on)" stroke="var(--ut-icon-on)" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" d={${compName}Data.detail} />}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={${compName}Data.line} />
    </svg>
  );
}
`;
}

// 1. Create directories
const sourceDir = join(root, 'icons', 'source');
const generatedReactDir = join(root, 'src', 'react', 'icons', 'generated');
const distIconsDir = join(root, 'dist', 'icons');
const docsIconsDir = join(root, 'docs', 'public', 'icons');

await mkdir(sourceDir, { recursive: true });
await mkdir(generatedReactDir, { recursive: true });
for (const style of ['line', 'filled', 'duotone', '2.5d']) {
  await mkdir(join(distIconsDir, 'svg', style), { recursive: true });
  await mkdir(join(docsIconsDir, 'svg', style), { recursive: true });
}

// 2. Write & validate source SVGs and manifest.json
const manifestEntries = [];
const spriteSymbols = [];

for (const icon of allIcons) {
  const sourcePath = join(sourceDir, `${icon.name}.svg`);
  const svgText = buildMasterSvg(icon);
  await writeFile(sourcePath, svgText, 'utf8');
  const readBack = await readFile(sourcePath, 'utf8');
  validateMasterSvg(icon.name, readBack);

  const styles = icon.styles ?? ['line', 'filled', 'duotone'];
  manifestEntries.push({
    name: icon.name,
    group: icon.group,
    keywords: icon.keywords,
    description: icon.description,
    styles,
    has3d: Boolean(icon.has3d),
    hues3d: icon.has3d ? allHues : [],
  });

  // Standalone SVGs per style
  for (const style of ['line', 'filled', 'duotone']) {
    const content = buildStandaloneSvg(icon, style);
    await writeFile(join(distIconsDir, 'svg', style, `${icon.name}.svg`), content, 'utf8');
    await writeFile(join(docsIconsDir, 'svg', style, `${icon.name}.svg`), content, 'utf8');
  }
  if (icon.has3d) {
    const content2d5 = buildStandaloneSvg(icon, '2.5d');
    await writeFile(join(distIconsDir, 'svg', '2.5d', `${icon.name}.svg`), content2d5, 'utf8');
    await writeFile(join(docsIconsDir, 'svg', '2.5d', `${icon.name}.svg`), content2d5, 'utf8');
  }

  // Sprite symbols
  spriteSymbols.push(
    `  <symbol id="ut-icon-${icon.name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icon.line}"/></symbol>`,
    `  <symbol id="ut-icon-line-${icon.name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icon.line}"/></symbol>`,
    `  <symbol id="ut-icon-filled-${icon.name}" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="${icon.filled}"/></symbol>`,
    `  <symbol id="ut-icon-duotone-${icon.name}" viewBox="0 0 24 24" fill="none"><path fill="var(--ut-icon-tint)" fill-rule="evenodd" d="${icon.plate}"/><path stroke="var(--ut-icon-stroke, currentColor)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="${icon.line}"/></symbol>`,
  );

  // Per-icon React module
  await writeFile(join(generatedReactDir, `${toPascalCase(icon.name)}.tsx`), buildGeneratedReactFile(icon), 'utf8');
}

const manifestJson = JSON.stringify(manifestEntries, null, 2) + '\n';
await writeFile(join(root, 'icons', 'manifest.json'), manifestJson, 'utf8');

const spriteSvg = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${spriteSymbols.join('\n')}\n</svg>\n`;
await writeFile(join(distIconsDir, 'sprite.svg'), spriteSvg, 'utf8');
await writeFile(join(docsIconsDir, 'sprite.svg'), spriteSvg, 'utf8');

// 3. Generate 3D soft-clay renders for all has3d icons x 3 themes x 8 hues (@1x = 96px, @2x = 160px)
const force3d = process.argv.includes('--force-3d');
const rerender = new Set(process.argv.find((arg) => arg.startsWith('--rerender='))?.slice('--rerender='.length).split(',') ?? []);
const rasterFormats = { avif: [], webp: [] };
const dimensionalNames = allIcons.filter((item) => item.has3d).map(({ name }) => name);

for (const icon of allIcons.filter((item) => item.has3d)) {
  let geom1x = null;
  let geom2x = null;

  for (const theme of allThemes) {
    for (const hue of allHues) {
      const relDir = join('3d', 'render', theme, hue);
      const srcRenderDir = join(root, 'icons', relDir);
      const distRenderDir = join(distIconsDir, relDir);
      const docsRenderDir = join(docsIconsDir, relDir);
      await mkdir(srcRenderDir, { recursive: true });
      await mkdir(distRenderDir, { recursive: true });
      await mkdir(docsRenderDir, { recursive: true });

      const file1x = join(srcRenderDir, `${icon.name}@1x.png`);
      const file2x = join(srcRenderDir, `${icon.name}@2x.png`);

      if (force3d || rerender.has(icon.name) || !existsSync(file1x) || !existsSync(file2x)) {
        if (!geom1x) geom1x = buildClayGeometry(icon, 96);
        if (!geom2x) geom2x = buildClayGeometry(icon, 160);
        const png1x = shadeClayRender(geom1x, theme, hue);
        const png2x = shadeClayRender(geom2x, theme, hue);
        await writeFile(file1x, png1x);
        await writeFile(file2x, png2x);
      }

      await copyFile(file1x, join(distRenderDir, `${icon.name}@1x.png`));
      await copyFile(file2x, join(distRenderDir, `${icon.name}@2x.png`));
      await copyFile(file1x, join(docsRenderDir, `${icon.name}@1x.png`));
      await copyFile(file2x, join(docsRenderDir, `${icon.name}@2x.png`));

      for (const format of Object.keys(rasterFormats)) {
        const variants = [1, 2].map((scale) => `${icon.name}@${scale}x.${format}`);
        if (!variants.every((file) => existsSync(join(srcRenderDir, file)))) continue;
        rasterFormats[format].push(`${theme}/${hue}/${icon.name}`);
        await Promise.all(variants.flatMap((file) => [distRenderDir, docsRenderDir].map((folder) =>
          copyFile(join(srcRenderDir, file), join(folder, file)))));
      }
    }
  }
}

// 4. Emit generated index.ts, manifest.ts, and renders.ts
const indexExports = allIcons.map((icon) => {
  const compName = toPascalCase(icon.name);
  return `export { ${compName}, ${compName}Data } from './${compName}.js';`;
}).join('\n');

const glyphEntries = allIcons.map((icon) => {
  const entry = JSON.stringify({
    name: icon.name,
    group: icon.group,
    description: icon.description,
    keywords: icon.keywords,
    styles: icon.styles ?? ['line', 'filled', 'duotone'],
    has3d: Boolean(icon.has3d),
    plate: icon.plate,
    line: icon.line,
    filled: icon.filled,
    detail: icon.detail,
  });
  return `  ${JSON.stringify(icon.name)}: ${entry},`;
}).join('\n');
const glyphAliases = allIcons.flatMap(({ name }) => {
  const alias = toCamelCase(name);
  return alias === name ? [] : [`  ${JSON.stringify(alias)}: glyphs[${JSON.stringify(name)}],`];
}).join('\n');

await writeFile(
  join(generatedReactDir, 'index.ts'),
  `${indexExports}\n\nconst glyphs = {\n${glyphEntries}\n} as const;\n\nexport const iconGlyphs = {\n  ...glyphs,\n${glyphAliases}\n} as const;\n\nexport type IconGlyphName = keyof typeof iconGlyphs;\n`,
  'utf8',
);

await writeFile(
  join(generatedReactDir, 'manifest.ts'),
  `export interface IconManifestEntry {\n  readonly name: string;\n  readonly group: string;\n  readonly keywords: readonly string[];\n  readonly description: string;\n  readonly styles: readonly ('line' | 'filled' | 'duotone')[];\n  readonly has3d: boolean;\n  readonly hues3d: readonly string[];\n}\n\nexport const iconManifest: readonly IconManifestEntry[] = ${JSON.stringify(manifestEntries, null, 2)} as const;\n`,
  'utf8',
);

await writeFile(
  join(generatedReactDir, 'renders.ts'),
  `const names = ${JSON.stringify(dimensionalNames)};\n` +
  `const themes = ${JSON.stringify(allThemes)};\nconst hues = ${JSON.stringify(allHues)};\n` +
  `const avif = new Set(${JSON.stringify(rasterFormats.avif)});\nconst webp = new Set(${JSON.stringify(rasterFormats.webp)});\n` +
  'export const icon3dRenders = Object.fromEntries(names.map((name) => [name, Object.fromEntries(themes.map((theme) => [theme,\n' +
  '  Object.fromEntries(hues.map((hue) => {\n    const key = `${theme}/${hue}/${name}`;\n    const base = `./icons/3d/render/${key}`;\n' +
  '    return [hue, { png1x: `${base}@1x.png`, png2x: `${base}@2x.png`,\n' +
  '      avif: avif.has(key) ? `${base}@1x.avif 1x, ${base}@2x.avif 2x` : undefined,\n' +
  '      webp: webp.has(key) ? `${base}@1x.webp 1x, ${base}@2x.webp 2x` : undefined }];\n' +
  '  }))]))]));\n',
  'utf8',
);

process.stdout.write(`Built ${allIcons.length} icons (${allIcons.filter((i) => i.has3d).length} with 2.5D & 3D renders across 3 themes × 8 hues).\n`);
