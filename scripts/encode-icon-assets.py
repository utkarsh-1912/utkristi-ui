from pathlib import Path

from PIL import Image, features


def main():
    formats = ('avif', 'webp')
    if not all(features.check(extension) for extension in formats):
        raise SystemExit('Install Pillow with AVIF and WebP support before encoding icon assets.')
    root = Path(__file__).resolve().parents[1] / 'icons' / '3d' / 'render'
    brand_hues = {'night': 'blue', 'paper': 'blue', 'glass': 'lime'}
    count = 0
    for theme, hue in brand_hues.items():
        for source in sorted((root / theme / hue).glob('*.png')):
            with Image.open(source) as image:
                rgba = image.convert('RGBA')
                for extension in formats:
                    target = source.with_suffix('.' + extension)
                    rgba.save(target, quality=82, **({'speed': 8} if extension == 'avif' else {'method': 4}))
                    if extension == 'avif' and target.stat().st_size >= 18_000:
                        raise SystemExit(f'{target.name} exceeds the 18 KB asset budget.')
                    count += 1
    if not count:
        raise SystemExit('No source PNGs found. Run npm run icons first.')
    print(f'Encoded {count} AVIF and WebP icon assets.')


if __name__ == '__main__':
    main()
