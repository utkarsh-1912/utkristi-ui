import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
import { createPlugin } from './plugin-core.js';

const read = (name) => postcssJs.objectify(
  postcss.parse(readFileSync(new URL(`../styles/${name}.css`, import.meta.url), 'utf8')),
);

export default createPlugin({ tokens: read('tokens'), base: read('base'), components: read('components') });
