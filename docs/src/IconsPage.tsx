import { useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardBody, CardHeader, Chip, Code, Dot, Field,
  Icon, IconPalettePicker, IconTile, SearchInput, Segmented, Slider, Tabs,
  iconGlyphs, iconHues, iconManifest, iconPaletteTable, useIconPalette,
  type IconGlyphName, type IconManifestEntry, type IconPresetHue, type IconVariant,
} from '@utkristi/ui';
import { CopyCode } from './CopyCode';

const groups = [
  'All',
  'Navigation',
  'Actions',
  'Status',
  'Theme and settings',
  'Collaboration',
  'Code',
  'Content',
  'Commerce and account',
  'Device and system',
  'Brand and social',
] as const;

const styleItems: ReadonlyArray<{ id: IconVariant; label: string }> = [
  { id: 'line', label: 'Line' },
  { id: 'filled', label: 'Filled' },
  { id: 'duotone', label: 'Duotone' },
  { id: '2.5d', label: '2.5D' },
  { id: '3d', label: '3D' },
];

const previewThemes = [
  { id: 'dark', key: 'night', label: 'Night' },
  { id: 'light', key: 'paper', label: 'Paper' },
  { id: 'glass', key: 'glass', label: 'Glass' },
] as const;

function buildRawSvgSnippet(entry: IconManifestEntry, variant: IconVariant) {
  const glyph = iconGlyphs[entry.name as IconGlyphName];
  if (variant === 'filled') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">\n  <path fill-rule="evenodd" clip-rule="evenodd" d="${glyph.filled}" />\n</svg>`;
  }
  if (variant === 'duotone') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" class="icon icon-duotone">\n  <path class="icon-plate" fill="var(--ut-icon-tint)" d="${glyph.plate}" />\n  <path class="icon-stroke" stroke="var(--ut-icon-stroke, currentColor)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="${glyph.line}" />\n</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n  <path d="${glyph.line}" />\n</svg>`;
}

export function IconsPage() {
  const { hue, custom } = useIconPalette();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('All');
  const [variant, setVariant] = useState<IconVariant>('duotone');
  const [size, setSize] = useState<number>(28);
  const [selectedName, setSelectedName] = useState<IconGlyphName>('rocket');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return iconManifest.filter((item) => {
      if (group !== 'All' && item.group !== group) return false;
      if (variant === '3d' || variant === '2.5d') {
        if (!item.has3d) return false;
      } else if (!(item.styles as readonly string[]).includes(variant)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [group, query, variant]);

  const selectedEntry = useMemo(
    () => filtered.find((item) => item.name === selectedName) ?? filtered[0]
      ?? iconManifest.find((item) => item.name === selectedName) ?? iconManifest[0],
    [filtered, selectedName],
  );

  const effectiveHue = hue === 'none' ? 'mono' : hue;
  const downloadHue: IconPresetHue = (iconHues as readonly string[]).includes(effectiveHue)
    ? (effectiveHue as IconPresetHue)
    : 'blue';

  const reactCode = `<Icon name="${selectedEntry.name}" variant="${variant}" hue="${effectiveHue}" size={${size}} />\n<IconTile name="${selectedEntry.name}" hue="${effectiveHue}" size="md" />`;
  const spriteStyle = variant === '3d' || variant === '2.5d' ? 'duotone' : variant;
  const spriteCode = `<svg class="icon icon-${spriteStyle} icon-hue-${effectiveHue}" width="${size}" height="${size}" viewBox="0 0 24 24">\n  <use href="./icons/sprite.svg#ut-icon-${spriteStyle}-${selectedEntry.name}" />\n</svg>`;
  const rawSvgCode = buildRawSvgSnippet(selectedEntry, variant);
  const tailwindCode = `<span class="icon-tile icon-hue-${effectiveHue} bg-hue-${downloadHue}-tint text-hue-${downloadHue}">\n  <Icon name="${selectedEntry.name}" variant="duotone" size={22} />\n</span>`;

  return (
    <article className="doc-article icons-doc">
      <header className="doc-title">
        <span className="label"><Dot static tone="off" /> Guide</span>
        <h1 className="display display-xl">Icons</h1>
        <p className="lede">
          <b>{iconManifest.length} custom glyphs</b> across {groups.length - 1} groups. Browse line, filled, and duotone artwork,
          then preview the dimensional collection in Night, Paper, and Glass.
        </p>
      </header>

      <Card className="icons-toolbar-card">
        <CardHeader>
          <strong>Palette &amp; style controls</strong>
          <Badge tone="accent">{filtered.length} icons</Badge>
        </CardHeader>
        <CardBody className="sample-stack">
          <div className="icons-controls-grid">
            <Field label="Search icons">
              <SearchInput
                aria-label="Search icons by name or keyword"
                placeholder="Search by name or keyword (e.g. rocket, colabs, git)…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Field>
            <div>
              <span className="label">Style</span>
              <Segmented
                aria-label="Icon style"
                items={styleItems.map((s) => ({ id: s.id, label: s.label }))}
                value={variant}
                onChange={(next) => {
                  const v = next as IconVariant;
                  setVariant(v);
                  if ((v === '3d' || v === '2.5d') && size < 32) setSize(48);
                }}
              />
            </div>
            <div>
              <span className="label">Size ({size}px)</span>
              <Slider
                label="Icon size"
                min={16}
                max={128}
                step={1}
                value={size}
                onChange={setSize}
                marks={[16, 20, 24, 48, 96, 128]}
                format={(v) => `${v}px`}
              />
            </div>
          </div>

          <div>
            <span className="label">Colour palette</span>
            <IconPalettePicker showPreview={false} />
          </div>

          <div className="icons-group-chips" role="group" aria-label="Filter by icon group">
            {groups.map((g) => (
              <Chip
                key={g}
                accent={group === g}
                pressed={group === g}
                onClick={() => setGroup(g)}
              >
                {g}
              </Chip>
            ))}
          </div>
        </CardBody>
      </Card>

      <h2>Selected icon across Night, Paper, and Glass</h2>
      <div className="theme-gallery">
        {previewThemes.map((t) => (
          <div key={t.id} data-theme={t.id} className="theme-preview">
            <span className="label"><Dot static tone="off" /> {t.label}</span>
            <div className="preview-content icons-theme-stage">
              <div className="icons-stage-main">
                <Icon
                  name={selectedEntry.name as IconGlyphName}
                  renderTheme={t.id}
                  variant={variant === '3d' && !selectedEntry.has3d ? '2.5d' : variant}
                  hue={effectiveHue}
                  customColor={effectiveHue === 'custom' ? custom : undefined}
                  inColour={effectiveHue !== 'mono'}
                  size={size}
                />
                <div>
                  <strong>{selectedEntry.name}</strong>
                  <p className="muted icons-stage-desc">{selectedEntry.description}</p>
                </div>
              </div>
              <div className="sample-row">
                <IconTile name={selectedEntry.name as IconGlyphName} hue={effectiveHue} customColor={custom} size="sm" variant="line" />
                <IconTile name={selectedEntry.name as IconGlyphName} hue={effectiveHue} customColor={custom} size="sm" variant="filled" />
                <IconTile name={selectedEntry.name as IconGlyphName} hue={effectiveHue} customColor={custom} size="sm" variant="duotone" />
                <IconTile name={selectedEntry.name as IconGlyphName} hue={effectiveHue} customColor={custom} size="sm" variant="2.5d" />
                <IconTile name={selectedEntry.name as IconGlyphName} hue={effectiveHue} customColor={custom} size="sm" solid />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="icons-inspector">
        <CardHeader>
          <div>
            <span className="label">{selectedEntry.group}</span>
            <h3><Code inline>{selectedEntry.name}</Code></h3>
          </div>
          <div className="sample-row">
            {selectedEntry.has3d && <Badge tone="ok">3D + 2.5D ready</Badge>}
            <Badge>{selectedEntry.styles.join(' · ')}</Badge>
          </div>
        </CardHeader>
        <CardBody className="sample-stack">
          <p className="muted">
            Keywords: {selectedEntry.keywords.map((kw) => <Code key={kw} inline>{kw}</Code>).reduce<React.ReactNode[]>((acc, el, i) => (i === 0 ? [el] : [...acc, ' ', el]), [])}
          </p>
          <Tabs
            label="Icon usage snippets"
            items={[
              { id: 'react', label: 'React', content: <CopyCode text={reactCode} /> },
              { id: 'sprite', label: 'SVG Sprite', content: <CopyCode text={spriteCode} /> },
              { id: 'svg', label: 'Raw SVG', content: <CopyCode text={rawSvgCode} /> },
              { id: 'tailwind', label: 'Tailwind', content: <CopyCode text={tailwindCode} /> },
            ]}
          />
          <div className="sample-row">
            <Button
              size="sm"
              variant="ghost"
              href={`./icons/svg/line/${selectedEntry.name}.svg`}
              download={`${selectedEntry.name}-line.svg`}
            >
              Download Line SVG
            </Button>
            {selectedEntry.styles.includes('duotone') && <Button
              size="sm"
              variant="ghost"
              href={`./icons/svg/duotone/${selectedEntry.name}.svg`}
              download={`${selectedEntry.name}-duotone.svg`}
            >
              Download Duotone SVG
            </Button>}
            {selectedEntry.has3d && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  href={`./icons/3d/render/night/${downloadHue}/${selectedEntry.name}@2x.png`}
                  download={`${selectedEntry.name}-night-${downloadHue}@2x.png`}
                >
                  3D Night PNG
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  href={`./icons/3d/render/paper/${downloadHue}/${selectedEntry.name}@2x.png`}
                  download={`${selectedEntry.name}-paper-${downloadHue}@2x.png`}
                >
                  3D Paper PNG
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  href={`./icons/3d/render/glass/${downloadHue}/${selectedEntry.name}@2x.png`}
                  download={`${selectedEntry.name}-glass-${downloadHue}@2x.png`}
                >
                  3D Glass PNG
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      <h2>Icon catalog ({filtered.length})</h2>
      {!filtered.length && <p role="status" className="muted">No icons match this style, group, and search.</p>}
      <div className="icons-catalog-grid">
        {filtered.map((item) => {
          const isSelected = item.name === selectedEntry.name;
          const cellVariant: IconVariant = variant === '3d' && !item.has3d ? '2.5d' : variant;
          const displaySize = Math.min(56, Math.max(16, size));
          return (
            <button
              key={item.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedName(item.name as IconGlyphName)}
              className={`icons-cell${isSelected ? ' is-active' : ''}`}
            >
              <span className="icons-cell-stage">
                <Icon
                  name={item.name as IconGlyphName}
                  variant={cellVariant}
                  hue={effectiveHue}
                  customColor={effectiveHue === 'custom' ? custom : undefined}
                  inColour={effectiveHue !== 'mono'}
                  size={displaySize}
                />
              </span>
              <span className="icons-cell-name">{item.name}</span>
              {item.has3d && <span className="icons-cell-tag">3D</span>}
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function TokensPaletteSection({
  ratio,
}: {
  ratio: (fg: string, bg: string, canvas: string) => number;
}) {
  const themeOrder = [
    { key: 'night', label: 'Night', bg: '#0B0B0A', ink: '#E8E6DF' },
    { key: 'paper', label: 'Paper', bg: '#F5F7FB', ink: '#0E1A33' },
    { key: 'glass', label: 'Glass', bg: '#F7F4FB', ink: '#202021' },
  ] as const;

  return (
    <section aria-label="Icon colour palette tokens">
      <h2>Icon Palette (8 hues × 3 themes × 6 roles)</h2>
      <p>
        Every preset hue provides <Code inline>base</Code>, <Code inline>shade</Code>, <Code inline>hi</Code>,{' '}
        <Code inline>tint</Code>, <Code inline>stroke</Code>, and <Code inline>on</Code> roles. In Night and Paper,{' '}
        <Code inline>stroke</Code> reaches ≥3:1 against the canvas and <Code inline>on</Code> reaches ≥4.5:1 against{' '}
        <Code inline>base</Code>. In Glass, <Code inline>stroke</Code> uses <Code inline>--ut-ink</Code> while bright candy hues fill the plate and 3D body.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Hue</th>
              <th scope="col">Theme</th>
              <th scope="col">Base</th>
              <th scope="col">Shade</th>
              <th scope="col">Highlight</th>
              <th scope="col">Stroke</th>
              <th scope="col" className="num">Stroke / bg</th>
              <th scope="col" className="num">On / base</th>
            </tr>
          </thead>
          <tbody>
            {iconHues.flatMap((hueName) =>
              themeOrder.map((t) => {
                const roles = iconPaletteTable[t.key][hueName];
                const resolvedStroke = roles.stroke.startsWith('var(') ? t.ink : roles.stroke;
                const strokeRatio = ratio(resolvedStroke, t.bg, t.bg);
                const onRatio = ratio(roles.on, roles.base, t.bg);
                const strokePass = strokeRatio >= 3;
                const onPass = onRatio >= 4.5;
                return (
                  <tr key={`${hueName}-${t.key}`}>
                    <td><Code inline>{hueName}</Code></td>
                    <td>{t.label}</td>
                    <td>
                      <span className="palette-chip">
                        <span className="palette-dot" style={{ background: roles.base }} aria-hidden="true" />
                        <code>{roles.base}</code>
                      </span>
                    </td>
                    <td>
                      <span className="palette-chip">
                        <span className="palette-dot" style={{ background: roles.shade }} aria-hidden="true" />
                        <code>{roles.shade}</code>
                      </span>
                    </td>
                    <td>
                      <span className="palette-chip">
                        <span className="palette-dot" style={{ background: roles.hi }} aria-hidden="true" />
                        <code>{roles.hi}</code>
                      </span>
                    </td>
                    <td><code>{roles.stroke}</code></td>
                    <td className="num" style={!strokePass ? { color: 'var(--ut-bad-ink)' } : undefined}>
                      {strokeRatio.toFixed(2)}:1
                    </td>
                    <td className="num" style={!onPass ? { color: 'var(--ut-bad-ink)' } : undefined}>
                      {onRatio.toFixed(2)}:1
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
