import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Icon, IconPalettePicker, iconGlyphs, Select, type IconVariant } from '@utkristi/ui';

const styles = [['line', 'Line'], ['filled', 'Filled'], ['duotone', 'Duotone'], ['2.5d', '2.5D'], ['3d', '3D']] as const;
const samples = [['rocket', 'Rocket'], ['palette', 'Palette'], ['ai-spark', 'AI spark'],
  ['shield', 'Shield'], ['bell', 'Bell'], ['folder', 'Folder']] as const;
const iconCount = new Set(Object.values(iconGlyphs).map(({ name }) => name)).size;

export default function ShowcaseIconTray() {
  const [style, setStyle] = useState<IconVariant>('3d');
  return <Card className="showcase-icon-card">
    <CardHeader><div><span className="label">Icon library</span><h2>Icon tray</h2></div>
      <Button href="#/icons" variant="quiet" size="sm" iconRight={<Icon name="arrow-up-right" />}>Browse {iconCount} icons</Button>
    </CardHeader>
    <CardBody className="showcase-icon-body">
      <div className="showcase-icon-tools">
        <IconPalettePicker showPreview={false} />
        <Select aria-label="Tray icon style" value={style} onChange={(event) => {
          const next = styles.find(([value]) => value === event.target.value);
          if (next) setStyle(next[0]);
        }}>{styles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
      </div>
      <ul className="showcase-icon-tray">
        {samples.map(([name, label]) => <li key={name}><span className="showcase-icon-preview">
          <Icon name={name} variant={style} inColour size={style === '3d' || style === '2.5d' ? 56 : 32} />
        </span><span>{label}</span></li>)}
      </ul>
    </CardBody>
  </Card>;
}
