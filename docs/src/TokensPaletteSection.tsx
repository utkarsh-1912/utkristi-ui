import { Code, iconHues, iconPaletteTable } from '@utkristi/ui';

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
