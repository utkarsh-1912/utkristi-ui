import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const bin = fileURLToPath(new URL('../dist/server.mjs', import.meta.url));
const request = (id, method, params) => ({ jsonrpc: '2.0', id, method, params });
const initialize = (protocolVersion) => [
  request(1, 'initialize', { protocolVersion, capabilities: {}, clientInfo: { name: 'test', version: '1.0.0' } }),
  { jsonrpc: '2.0', method: 'notifications/initialized' },
];
const call = (id, name, args) => request(id, 'tools/call', { name, arguments: args });
const run = (messages) => Object.fromEntries(execFileSync(process.execPath, [bin], {
  input: messages.map((message) => typeof message === 'string' ? message : JSON.stringify(message)).join('\n') + '\n',
  encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 20_000,
}).trim().split('\n').map(JSON.parse).map((response) => [response.id, response]));

test('stdio initializes, discovers tools and reads the generated reference and resources', () => {
  const output = run([
    request(0, 'tools/list'), ...initialize('2025-11-25'), request(2, 'tools/list'),
    call(3, 'search_components', { query: 'data table' }),
    call(4, 'get_component', { name: 'DataTable' }),
    call(5, 'get_example', { id: 'project-worklist' }),
    call(6, 'list_tokens', { query: '--ut-accent' }),
    call(7, 'create_theme', { brand: '#7C3AED', format: 'css' }),
    call(8, 'validate_markup', { markup: '<button class="btn-solid icon-btn" style="color:#aaa;background:#fff"><svg></svg></button>' }),
    request(9, 'resources/list'),
    request(10, 'resources/read', { uri: 'utkristi://components/manifest' }),
    call(11, 'get_example', { id: 'button', format: 'html' }),
    call(12, 'get_example', { id: 'console-workspace', format: 'html' }),
  ]);
  assert.equal(output[0].error.code, -32002);
  assert.equal(output[1].result.protocolVersion, '2025-11-25');
  assert.equal(output[2].result.tools.length, 6);
  assert.equal(output[3].result.structuredContent.components[0].id, 'data-table');
  assert.ok(output[4].result.structuredContent.props.DataTable.some(({ name }) => name === 'getRowKey'));
  assert.match(output[5].result.structuredContent.source, /export default function Example/);
  assert.ok(output[6].result.structuredContent.tokens['--ut-accent']);
  assert.match(output[7].result.structuredContent.source, /--ut-bg:/);
  assert.ok(output[7].result.structuredContent.report.every(({ pass }) => pass));
  assert.deepEqual(output[8].result.structuredContent.issues.map(({ code }) => code),
    ['missing-base-class', 'missing-icon-label', 'low-contrast']);
  assert.equal(output[9].result.resources.length, 2);
  assert.equal(JSON.parse(output[10].result.contents[0].text).examples.button.name, 'Button');
  assert.match(output[11].result.structuredContent.source, /class="btn btn-solid/);
  assert.match(output[12].result.structuredContent.source, /workspace/);
});

test('malformed RPC, unknown methods, and invalid tool arguments keep stdio usable', () => {
  const output = run([
    '{', ...initialize('2024-11-05'), request(2, 'unknown'), call(3, 'constructor', {}),
    call(4, 'create_theme', { brand: 'violet' }), call(5, 'get_example', { id: '__proto__' }),
    call(6, 'search_components', { query: 'search' }), request(7, 'ping'),
  ]);
  assert.equal(output.null.error.code, -32700);
  assert.equal(output[1].result.protocolVersion, '2024-11-05');
  assert.equal(output[2].error.code, -32601);
  assert.equal(output[3].error.code, -32602);
  assert.equal(output[4].result.isError, true);
  assert.equal(output[5].result.isError, true);
  assert.ok(JSON.parse(output[6].result.content[0].text).components.length);
  assert.equal(output[6].result.structuredContent, undefined);
  assert.deepEqual(output[7].result, {});
});

test('docs and MCP can consume the same manifest', () => {
  const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
  const manifest = read('../dist/component-manifest.json');
  assert.equal(manifest.version, read('../../../package.json').version);
  assert.ok(Object.values(manifest.examples).some(({ kind }) => kind === 'variant'));
  assert.ok(Object.keys(manifest.tokens).length > 100);
});
