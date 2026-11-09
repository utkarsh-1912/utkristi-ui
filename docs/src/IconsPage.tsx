import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, Icon, IconPalettePicker, Modal, SearchInput, Select, Tabs,
  icon3dRenders, iconHues, iconManifest, useIconPalette, useTheme,
  type IconGlyphName, type IconManifestEntry, type IconVariant,
} from '@utkristi/ui';
import { CopyAction, CopyCode } from './CopyCode';

const styles: ReadonlyArray<{ id: IconVariant; label: string }> = [
  { id: 'line', label: 'Line' }, { id: 'filled', label: 'Filled' }, { id: 'duotone', label: 'Duotone' },
  { id: '2.5d', label: '2.5D' }, { id: '3d', label: '3D' },
];
const previewThemes = [
  { id: 'dark', key: 'night', label: 'Night' },
  { id: 'light', key: 'paper', label: 'Paper' },
  { id: 'glass', key: 'glass', label: 'Glass' },
] as const;
const groups = [...new Set(iconManifest.map(({ group }) => group))].sort();
const pageSize = 72;

function supports(entry: IconManifestEntry, style: IconVariant) {
  return style === '2.5d' || style === '3d' ? entry.has3d : entry.styles.includes(style);
}

function score(entry: IconManifestEntry, query: string, terms: string[]) {
  const name = entry.name.replaceAll('-', ' ');
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (terms.every((term) => name.includes(term))) return 2;
  const keywords = entry.keywords.join(' ').toLowerCase();
  if (terms.every((term) => name.includes(term) || keywords.includes(term))) return 3;
  const description = entry.description.toLowerCase();
  return terms.every((term) => name.includes(term) || keywords.includes(term) || description.includes(term)) ? 4 : Infinity;
}

function standaloneSvg(node: SVGSVGElement) {
  const copy = node.cloneNode(true) as SVGSVGElement;
  const computed = getComputedStyle(node);
  copy.querySelector('.icon-2d5-ext-extra')?.remove();
  copy.removeAttribute('class');
  copy.removeAttribute('style');
  copy.style.color = computed.color;
  for (const role of ['base', 'shade', 'hi', 'tint', 'stroke', 'on', 'shadow']) {
    const property = `--ut-icon-${role}`;
    const value = computed.getPropertyValue(property).trim();
    if (value) copy.style.setProperty(property, value);
  }
  return new XMLSerializer().serializeToString(copy);
}

function IconDetails({ entry, initialStyle, onClose }: { entry: IconManifestEntry; initialStyle: IconVariant; onClose: () => void }) {
  const { hue, custom } = useIconPalette();
  const { resolvedTheme } = useTheme();
  const [style, setStyle] = useState(initialStyle);
  const [size, setSize] = useState(initialStyle === '3d' || initialStyle === '2.5d' ? 64 : 24);
  const [customize, setCustomize] = useState(false);
  const currentPreview = useRef<HTMLDivElement>(null);
  const iconName = entry.name as IconGlyphName;
  const color = hue === 'none' ? 'mono' : hue;
  const customColor = color === 'custom' ? custom : undefined;
  const activeTheme = previewThemes.find(({ id }) => id === resolvedTheme) ?? previewThemes[0];
  const raster = style === '3d' && iconHues.some((item) => item === color) ? icon3dRenders[iconName]?.[activeTheme.key]?.[color]?.png2x : undefined;
  const vectorStyle = style === '3d' ? '2.5d' : style;
  const spriteStyle = vectorStyle === '2.5d' ? 'duotone' : vectorStyle;
  const react = `import { Icon } from '@utkristi/ui';\n\n<Icon name="${entry.name}" variant="${style}" size={${size}} hue="${color}"${customColor ? ` customColor=${JSON.stringify(customColor)}` : ''}${color !== 'mono' ? ' inColour' : ''} />`;

  function readSvg() {
    const svg = currentPreview.current?.querySelector('svg');
    return svg ? standaloneSvg(svg) : undefined;
  }

  function downloadSvg() {
    const svg = readSvg();
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.name}-${vectorStyle}.svg`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <Modal open wide title={entry.name} label={entry.group} description={entry.description} onClose={onClose} className="icons-detail">
    <div className="icons-detail-controls">
      <label>Style<Select value={style} onChange={(event) => {
        const next = event.target.value as IconVariant;
        setStyle(next);
        if ((next === '2.5d' || next === '3d') && size < 32) setSize(64);
      }}>{styles.filter((item) => supports(entry, item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</Select></label>
      <label>Size<Select value={size} onChange={(event) => setSize(Number(event.target.value))}>
        {[16, 20, 24, 32, 48, 64, 96, 128].map((value) => <option key={value} value={value}>{value} px</option>)}
      </Select></label>
    </div>
    <div className="icons-detail-themes">
      {previewThemes.map((theme) => <div key={theme.id} data-theme={theme.id} className="theme-preview icons-detail-preview"
        ref={theme.id === resolvedTheme ? currentPreview : undefined}>
        <span className="label">{theme.label}</span>
        <span className="icons-detail-glyph"><Icon name={iconName} renderTheme={theme.id} variant={style} hue={color}
          inColour={color !== 'mono'} customColor={customColor} size={size} /></span>
      </div>)}
    </div>
    <div className="icons-detail-actions">
      <CopyAction value={react} label="Copy React" onFailure={() => setCustomize(true)} />
      {raster ? <Button variant="ghost" href={raster} download={`${entry.name}-${activeTheme.key}.png`} iconLeft={<Icon name="download" />}>Download PNG</Button> : <>
        <CopyAction value={readSvg} label="Copy SVG" />
        <Button variant="ghost" onClick={downloadSvg} iconLeft={<Icon name="download" />}>Download SVG</Button>
      </>}
    </div>
    <details className="icons-detail-extra" open={customize} onToggle={(event) => setCustomize(event.currentTarget.open)}><summary>Colour palette and code examples</summary>
      {customize && <>
      <IconPalettePicker showPreview={false} />
      <Tabs label="Icon usage snippets" items={[
        { id: 'react', label: 'React', content: <CopyCode text={react} /> },
        { id: 'sprite', label: 'SVG sprite', content: <CopyCode text={`<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">\n  <use href="./icons/sprite.svg#ut-icon-${spriteStyle}-${entry.name}" />\n</svg>`} /> },
        { id: 'tailwind', label: 'Tailwind', content: <CopyCode text={`<Icon name="${entry.name}" className="size-6 text-current" />`} /> },
      ]} />
      </>}
    </details>
  </Modal>;
}

export default function IconsPage() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [style, setStyle] = useState<IconVariant>('line');
  const [limit, setLimit] = useState(pageSize);
  const [selected, setSelected] = useState<IconManifestEntry>();
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (event.key !== '/' || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey ||
        (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable]')) ||
        document.querySelector('[aria-modal="true"]')) return;
      event.preventDefault();
      search.current?.focus();
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const supported = useMemo(() => iconManifest.filter((entry) => supports(entry, style)), [style]);
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const entry of supported) result.set(entry.group, (result.get(entry.group) ?? 0) + 1);
    return result;
  }, [supported]);
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
    const terms = normalized ? normalized.split(' ') : [];
    return supported.filter((entry) => !group || entry.group === group)
      .map((entry) => ({ entry, rank: normalized ? score(entry, normalized, terms) : 0 }))
      .filter(({ rank }) => Number.isFinite(rank))
      .sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name))
      .map(({ entry }) => entry);
  }, [group, query, supported]);

  function clearFilters() {
    setQuery('');
    setGroup('');
    setStyle('line');
    setLimit(pageSize);
    search.current?.focus();
  }

  return <article className="doc-article icons-doc">
    <header className="icons-heading">
      <span className="label">Utkristi design system</span>
      <h1 className="display display-xl">Icons</h1>
      <p className="lede">Browse {iconManifest.length} original glyphs. Select an icon to preview it in three themes, copy it, or download it.</p>
    </header>
    <div className="icons-toolbar">
      <SearchInput ref={search} aria-label="Search icons" placeholder="Search icons by name or keyword…" shortcut="/"
        value={query} onChange={(event) => { setQuery(event.target.value); setLimit(pageSize); }} />
      <Select aria-label="Icon category" value={group} onChange={(event) => { setGroup(event.target.value); setLimit(pageSize); }}>
        <option value="">All categories</option>
        {groups.filter((name) => counts.has(name)).map((name) => <option key={name} value={name}>{name} ({counts.get(name)})</option>)}
      </Select>
      <Select aria-label="Icon style" value={style} onChange={(event) => {
        const next = event.target.value as IconVariant;
        setStyle(next);
        if (group && !iconManifest.some((entry) => entry.group === group && supports(entry, next))) setGroup('');
        setLimit(pageSize);
      }}>{styles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</Select>
    </div>
    <div className="icons-results-head">
      <p role="status">{filtered.length} {filtered.length === 1 ? 'icon' : 'icons'}{limit < filtered.length && ` · Showing ${limit}`}</p>
      {(query || group || style !== 'line') && <Button size="sm" variant="plain" onClick={clearFilters}>Clear filters</Button>}
    </div>
    {!filtered.length && <p className="icons-empty">No matching icons. Try a shorter search or choose another category.</p>}
    <div className="icons-catalog-grid">
      {filtered.slice(0, limit).map((entry) => <button key={entry.name} type="button" className="icons-cell"
        aria-haspopup="dialog" onClick={() => setSelected(entry)}>
        <Icon name={entry.name as IconGlyphName} variant={style} size={style === '3d' || style === '2.5d' ? 36 : 24}
          hue={style === '3d' || style === '2.5d' ? undefined : 'mono'} />
        <span className="icons-cell-name">{entry.name}</span>
      </button>)}
    </div>
    {filtered.length > limit && <div className="icons-load-more"><Button variant="ghost" onClick={() => setLimit(limit + pageSize)}>Show more icons</Button></div>}
    {selected && <IconDetails entry={selected} initialStyle={style} onClose={() => setSelected(undefined)} />}
  </article>;
}
