import { cp, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

/** Keep the docs deployment and the npm package on the same icon assets. */
export function docsIconAssets(source: string): Plugin {
  return {
    name: 'utkristi-docs-icon-assets',
    async writeBundle({ dir }) {
      if (!dir) return;
      const output = resolve(dir, 'icons');
      const files = await readdir(source, { recursive: true }).catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') throw new Error('The icon assets are missing. Run npm run icons before building the docs.');
        throw error;
      });
      if (!files.includes('sprite.svg') || !files.some((file) => file.endsWith('@2x.png'))) {
        throw new Error('The generated icon assets are incomplete. Run npm run icons before building the docs.');
      }
      const present = new Set(await readdir(output, { recursive: true }).catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      }));
      if (files.some((file) => !present.has(file))) await cp(source, output, { recursive: true, force: false });
    },
  };
}
