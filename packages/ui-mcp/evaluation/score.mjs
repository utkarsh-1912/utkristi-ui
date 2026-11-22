import { readFile } from 'node:fs/promises';

const [baselineFile, mcpFile] = process.argv.slice(2);
if (!baselineFile || !mcpFile) {
  throw new Error('Usage: node score.mjs baseline.json with-mcp.json');
}
const read = async (file) => JSON.parse(await readFile(file, 'utf8'));
const tasks = await read(new URL('tasks.json', import.meta.url));
async function score(file) {
  const results = await read(file);
  if (!Array.isArray(results) || results.length !== tasks.length) throw new Error(`${file} must contain one result per task.`);
  const byId = new Map(results.map((result) => [result.id, result]));
  for (const { id } of tasks) {
    const result = byId.get(id);
    if (typeof result?.pass !== 'boolean' || !result.evidence?.trim()) throw new Error(`${file} needs a pass value and reviewer evidence for ${id}.`);
  }
  return results.filter(({ pass }) => pass).length;
}
const [baseline, withMcp] = await Promise.all([score(baselineFile), score(mcpFile)]);
console.log(JSON.stringify({ tasks: tasks.length, baseline, withMcp,
  improvementPercentagePoints: (withMcp - baseline) * 100 / tasks.length }, null, 2));
