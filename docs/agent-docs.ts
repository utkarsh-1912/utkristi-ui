interface Reference {
  version: string;
  examples: Record<string, {
    name: string;
    description: string;
    kind: string;
    components: string[];
    code: string;
    html?: string;
  }>;
  api: Record<string, { name: string; type: string; description: string; required: boolean; defaultValue?: string }[]>;
  tokens: Record<string, Record<string, string>>;
}

export const componentGuidance: Record<string, string[]> = {
  button: ['Use a link for navigation and a button for an action. Standalone button variants require the base btn class.'],
  'icon-button': ['Give the icon button an accessible name with the React label prop or an HTML aria-label.'],
  tabs: ['Label the tab list and use stable tab IDs. When writing HTML, connect tabs and panels using aria-controls and aria-labelledby.'],
  modal: ['Supply a title and return focus to the opener when the dialog closes.'],
  dialog: ['Supply a title and return focus to the opener when the dialog closes.'],
  combobox: ['Provide a visible label and stable option IDs. Keep aria-expanded synchronized with the popup.'],
  'data-table': ['Use stable row keys for selection and editing. With remote paging, pass the full matching row count in remote.totalRows.'],
  tooltip: ['Keep the trigger keyboard-focusable and give it an accessible name separately from its description.'],
};

const code = (value: string, language: string) => {
  const fence = '`'.repeat(Math.max(2, ...Array.from(value.matchAll(/`+/g), ([run]) => run.length)) + 1);
  return `${fence}${language}\n${value}\n${fence}`;
};

export function agentDocs<T extends Reference>(reference: T): Record<string, string> {
  const { version, examples, api, tokens } = reference;
  const files: Record<string, string> = {};
  const links: string[] = [];
  const pages: string[] = [];
  const documentedComponents = Object.entries(examples).filter(([, example]) => example.kind === 'component');
  for (const [id, example] of documentedComponents.sort(([a], [b]) => a.localeCompare(b))) {
    const path = `components/${id}.md`;
    links.push(`- [${example.name}](${path}): ${example.description}`);
    const props = example.components.flatMap((name) => [
      `### ${name}`, '',
      ...(api[name]?.map((prop) => `- \`${prop.name}\` (${prop.required ? 'required' : 'optional'}): ${prop.type}${prop.defaultValue ? ` (default ${prop.defaultValue})` : ''}${prop.description ? `. ${prop.description}` : ''}`) ?? []),
      '',
    ]);
    const related = Object.entries(examples).filter(([, sample]) => sample.kind === 'variant' &&
      sample.components.some((name) => example.components.includes(name)));
    files[path] = [
      `# ${example.name}`, '', example.description, '', '## API', '', ...props,
      '## Accessibility and usage', '',
      ...(componentGuidance[id] ?? ['The example includes the component structure and accessible labels used in the docs.']).map((note) => `- ${note}`),
      '', '## React example', '', code(example.code, 'tsx'), '',
      ...(example.html ? ['## HTML example', '', code(example.html, 'html'), ''] : []),
      ...(related.length ? ['## Related example IDs', '', ...related.map(([id, sample]) => `- \`${id}\`: ${sample.name}`), ''] : []),
    ].join('\n');
    pages.push(files[path]);
  }
  const title = `# Utkristi UI\n\n> React components, standalone CSS, and design tokens for live, data-dense applications.\n\nVersion ${version}\n`;
  const index = `${title}\n## References\n\n- [Complete reference](llms-full.txt)\n- [JSON manifest](component-manifest.json)\n\n## Components\n\n${links.join('\n')}\n`;
  const tokenLines = Object.entries(tokens).map(([name, values]) =>
    `- \`${name}\`: ${Object.entries(values).map(([selector, value]) => `${selector}: ${value}`).join('; ')}`);
  return {
    ...files,
    'llms.txt': index,
    'llms-full.txt': [title, ...pages, '## Variants and blocks', ...Object.entries(examples)
      .filter(([, example]) => example.kind !== 'component')
      .map(([id, example]) => `### ${example.name} (\`${id}\`)\n\n${example.description}\n\n${code(example.code, 'tsx')}\n`),
      '## Design tokens\n', ...tokenLines, ''].join('\n'),
    'component-manifest.json': JSON.stringify({ ...reference, guidance: componentGuidance }) + '\n',
  };
}
