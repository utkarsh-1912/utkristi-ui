#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createTheme, toCSS, tokensToDTCG2025, tokensToTokensStudio, toTailwindV4 } from '../../src/react/theme-engine/index.ts';
import { validateMarkup } from './validate.mjs';
import packageInfo from './package.json';

const manifest = JSON.parse(readFileSync(new URL('component-manifest.json', import.meta.url), 'utf8'));
const { examples, api, tokens, guidance } = manifest;
const components = Object.entries(examples).filter(([, entry]) => entry.kind === 'component');
const serverInfo = { name: packageInfo.name, version: packageInfo.version };
const versions = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const capabilities = { tools: {}, resources: {} };
const instructions = 'Search the library, then retrieve component props and runnable examples before writing Utkristi UI code.';
const resources = [
  { uri: 'utkristi://components/manifest', name: 'Component manifest', mimeType: 'application/json' },
  { uri: 'utkristi://design/tokens', name: 'Design tokens', mimeType: 'application/json' },
];
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (maxLength, fields = {}) => ({ type: 'string', minLength: 1, maxLength, ...fields });
const choice = (...values) => ({ type: 'string', enum: values });
const lower = (value) => value.toLowerCase();
const normalize = (value) => lower(value).replace(/[^a-z0-9]/g, '');
const summary = (id, { name, description, components }) => ({ id, name, description, components });

function getComponent(name) {
  const key = normalize(name);
  const match = components.find(([id, entry]) => normalize(id) === key || normalize(entry.name) === key)
    ?? components.find(([, entry]) => entry.components.some((name) => normalize(name) === key));
  if (!match) throw new Error(`No component matches "${name}". Try search_components.`);
  return match;
}

function define(description, properties, required, run) {
  return {
    description, inputSchema: { type: 'object', properties, required, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }, run,
  };
}

const tools = {
  search_components: define('Find documented React and CSS components by name or task.',
    { query: string(160), limit: { type: 'integer', minimum: 1, maximum: 50 } }, ['query'], ({ query, limit = 10 }) => {
      const key = normalize(query);
      const words = lower(query).match(/[a-z0-9]+/g) ?? [];
      if (!words.length) return { components: [] };
      const matches = components.map(([id, entry]) => {
        const title = lower(`${id} ${entry.name} ${entry.components.join(' ')}`);
        const description = lower(entry.description);
        const score = (normalize(id) === key || normalize(entry.name) === key ? 20 : 0) +
          words.reduce((total, word) => total + (title.includes(word) ? 5 : description.includes(word) ? 1 : 0), 0);
        return { score, entry: summary(id, entry) };
      }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
      return { components: matches.slice(0, limit).map(({ entry }) => entry) };
    }),
  get_component: define('Read a component API, accessibility guidance, and example IDs.',
    { name: string(120) }, ['name'], ({ name }) => {
      const [id, entry] = getComponent(name);
      const related = Object.entries(examples).filter(([key, example]) => key === id ||
        (example.kind !== 'component' && example.components.some((name) => entry.components.includes(name))));
      return { ...summary(id, entry), props: Object.fromEntries(entry.components.map((name) => [name, api[name] ?? []])),
        accessibility: guidance[id] ?? [], examples: related.map(([key, example]) => summary(key, example)),
        example: { id, tsx: entry.code, html: entry.html } };
    }),
  get_example: define('Get a documented component, variant, or block example by ID.',
    { id: string(160), format: choice('tsx', 'html') }, ['id'], ({ id, format = 'tsx' }) => {
      const entry = Object.hasOwn(examples, id) ? examples[id] : undefined;
      if (!entry) throw new Error(`Example "${id}" was not found. Use a documented example ID from get_component.`);
      const source = format === 'html' ? entry.html : entry.code;
      if (!source) throw new Error('HTML is unavailable for this example. Request TSX.');
      return { ...summary(id, entry), format, source };
    }),
  list_tokens: define('List CSS design tokens and their built-in theme values. Filter by token and CSS scope.',
    { query: string(120), scope: string(120) }, [], ({ query = '', scope = '' }) => ({
      tokens: Object.fromEntries(Object.entries(tokens).filter(([name]) => name.includes(lower(query)))
        .map(([name, values]) => [name, Object.fromEntries(Object.entries(values).filter(([selector]) => selector.includes(scope)))])
        .filter(([, values]) => Object.keys(values).length)),
    })),
  create_theme: define('Generate a theme and its WCAG contrast report. Export CSS, Tailwind, DTCG JSON, or Tokens Studio JSON.',
    { brand: string(7, { pattern: '^#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})$' }), name: string(64, { pattern: '^[a-zA-Z][a-zA-Z0-9-]*$' }),
      scheme: choice('light', 'dark'), contrast: choice('AA', 'AAA'), density: choice('compact', 'comfortable'),
      format: choice('css', 'tailwind', 'dtcg', 'figma') },
    ['brand'], ({ format = 'css', ...options }) => {
      const theme = createTheme(options);
      const source = {
        css: () => toCSS(theme), tailwind: () => toTailwindV4(theme),
        dtcg: () => tokensToDTCG2025({ [theme.name]: theme.tokens }),
        figma: () => tokensToTokensStudio(theme.name, theme.tokens),
      }[format]();
      return { name: theme.name, scheme: theme.scheme, format, source, report: theme.report };
    }),
  validate_markup: define('Check an HTML fragment for Utkristi class combinations, accessible labels and states, and inline color contrast.',
    { markup: string(100_000) }, ['markup'], ({ markup }) => validateMarkup(markup, manifest.classes)),
};

function validateArguments(args, schema) {
  if (!object(args)) throw new Error('Tool arguments must be an object.');
  for (const name of schema.required) if (!Object.hasOwn(args, name)) throw new Error(`Missing required argument "${name}".`);
  for (const [name, value] of Object.entries(args)) {
    const field = Object.hasOwn(schema.properties, name) ? schema.properties[name] : undefined;
    if (!field) throw new Error(`Unknown argument "${name}".`);
    const valid = field.type === 'integer'
      ? Number.isInteger(value) && value >= field.minimum && value <= field.maximum
      : typeof value === 'string' && (field.enum ? field.enum.includes(value) :
        value.length >= field.minLength && value.length <= field.maxLength && (!field.pattern || new RegExp(field.pattern).test(value)));
    if (!valid) throw new Error(`Invalid value for "${name}". Check the tool's input schema.`);
  }
}

const result = (id, value) => ({ jsonrpc: '2.0', id, result: value });
const error = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
const toolContent = (text) => [{ type: 'text', text }];
let lifecycle = 'new';
let protocolVersion;

function handle(message) {
  if (!object(message) || message.jsonrpc !== '2.0' || typeof message.method !== 'string' ||
    (Object.hasOwn(message, 'id') && typeof message.id !== 'string' && !Number.isInteger(message.id))) {
    return error(null, -32600, 'Invalid JSON-RPC request.');
  }
  const { id, method, params = {} } = message;
  if (id === undefined) {
    if (method === 'notifications/initialized' && lifecycle === 'initializing') lifecycle = 'ready';
    return;
  }
  if (!object(params)) return error(id, -32602, 'Expected an object for params.');
  if (method === 'ping') return result(id, {});
  if (method === 'initialize') {
    if (lifecycle !== 'new' || typeof params.protocolVersion !== 'string' || !object(params.capabilities) ||
      !object(params.clientInfo) || typeof params.clientInfo.name !== 'string' || typeof params.clientInfo.version !== 'string') {
      return error(id, -32602, 'Expected a single initialize request with protocolVersion, capabilities, and clientInfo.');
    }
    lifecycle = 'initializing';
    protocolVersion = versions.includes(params.protocolVersion) ? params.protocolVersion : versions[0];
    return result(id, { protocolVersion, capabilities, serverInfo, instructions });
  }
  if (lifecycle !== 'ready') return error(id, -32002, 'Initialize this MCP session before sending requests.');
  switch (method) {
    case 'tools/list': {
      return result(id, { tools: Object.entries(tools).sort(([a], [b]) => a.localeCompare(b))
        .map(([name, { description, inputSchema, annotations }]) => ({ name, description, inputSchema, annotations })) });
    }
    case 'tools/call': {
      const tool = typeof params.name === 'string' && Object.hasOwn(tools, params.name) ? tools[params.name] : undefined;
      if (!tool) return error(id, -32602, 'Unknown tool. Use tools/list for available names.');
      try {
        const args = params.arguments === undefined ? {} : params.arguments;
        validateArguments(args, tool.inputSchema);
        const value = tool.run(args);
        const structured = protocolVersion >= '2025-06-18' ? { structuredContent: value } : {};
        return result(id, { content: toolContent(JSON.stringify(value)), ...structured });
      } catch (failure) {
        return result(id, { content: toolContent(failure.message), isError: true });
      }
    }
    case 'resources/list': return result(id, { resources });
    case 'resources/templates/list': return result(id, { resourceTemplates: [] });
    case 'resources/read': {
      const resource = resources.find(({ uri }) => uri === params.uri);
      if (!resource) return error(id, -32002, 'Resource not found.');
      const value = resource === resources[0] ? manifest : tokens;
      return result(id, { contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: JSON.stringify(value) }] });
    }
    default: return error(id, -32601, 'Method not found.');
  }
}

for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  let message;
  let response;
  try { message = JSON.parse(line); } catch { response = error(null, -32700, 'Invalid JSON.'); }
  if (!response) response = handle(message);
  if (response && !process.stdout.write(JSON.stringify(response) + '\n')) {
    await new Promise((resolve) => process.stdout.once('drain', resolve));
  }
}
