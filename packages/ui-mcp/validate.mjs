import { parseFragment } from 'parse5';
import { contrast } from '../../src/react/theme-engine/index.ts';

const buttonVariant = /^btn-(?:solid|ghost|quiet|danger)$/;
const namedRoles = new Set(['dialog', 'alertdialog', 'tablist', 'radiogroup']);
const hex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const referenceAttributes = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-activedescendant'];
function* descendants(root) {
  const pending = [...(root.childNodes ?? [])].reverse();
  while (pending.length) {
    const node = pending.pop();
    yield node;
    for (let index = (node.childNodes?.length ?? 0) - 1; index >= 0; index--) pending.push(node.childNodes[index]);
  }
}
function hasText(node) {
  for (const child of descendants(node)) if (child.nodeName === '#text' && child.value.trim()) return true;
  return false;
}

export function validateMarkup(markup, knownClasses) {
  const nodes = [...descendants(parseFragment(markup, { sourceCodeLocationInfo: true }))]
    .filter((node) => node.tagName).map((node) => ({
      node, attrs: Object.fromEntries(node.attrs.map(({ name, value }) => [name, value])),
    }));
  const issues = [];
  const ids = new Set(nodes.map(({ attrs }) => attrs.id).filter(Boolean));
  const seenIds = new Set();
  const known = new Set(knownClasses);
  for (const { node, attrs } of nodes) {
    const line = node.sourceCodeLocation?.startLine;
    const add = (code, message, severity = 'error') => issues.push({ code, message, severity, line });
    const classes = (attrs.class ?? '').split(/\s+/).filter(Boolean);
    const named = attrs['aria-label']?.trim() || attrs['aria-labelledby']?.trim();
    if (classes.some((name) => buttonVariant.test(name)) && !classes.includes('btn')) {
      add('missing-base-class', 'Button variants require the btn base class.');
    }
    for (const name of classes) {
      if (/^(?:btn|icon-btn|modal|popover|seg|tab|step)-/.test(name) && !known.has(name)) {
        add('unknown-class', `The class ${name} is absent from the Utkristi stylesheet.`, 'warning');
      }
    }
    if (classes.includes('icon-btn') && !named && !hasText(node)) add('missing-icon-label', 'Give the icon button an accessible name.');
    if (namedRoles.has(attrs.role) && !named) add('missing-label', `Provide a label for role="${attrs.role}".`);
    if (attrs.role === 'tab' && !/^(true|false)$/.test(attrs['aria-selected'] ?? '')) add('missing-selected-state', 'Tabs need aria-selected="true" or "false".');
    if (attrs.role === 'combobox' && !/^(true|false)$/.test(attrs['aria-expanded'] ?? '')) add('missing-expanded-state', 'Comboboxes need aria-expanded="true" or "false".');
    if (attrs.id && seenIds.has(attrs.id)) add('duplicate-id', `The id "${attrs.id}" appears more than once.`);
    if (attrs.id) seenIds.add(attrs.id);
    for (const attribute of referenceAttributes) {
      for (const id of attrs[attribute]?.trim().split(/\s+/).filter(Boolean) ?? []) {
        if (!ids.has(id)) add('missing-reference', `${attribute} references "${id}", which is absent from this fragment.`, 'warning');
      }
    }
    const styles = new Map((attrs.style ?? '').split(';').map((declaration) => {
      const [name, value] = declaration.split(':');
      return [name.trim().toLowerCase(), value?.trim()];
    }));
    const color = styles.get('color');
    const background = styles.get('background-color') ?? styles.get('background');
    if (hex.test(color ?? '') && hex.test(background ?? '')) {
      const ratio = contrast(color, background);
      if (ratio < 4.5) add('low-contrast', `Inline colors have a ${ratio.toFixed(2)}:1 contrast ratio. Normal text needs 4.5:1.`);
    }
  }
  return { valid: !issues.some(({ severity }) => severity === 'error'), issues,
    contrastCoverage: 'Explicit inline hex foreground and background pairs. Computed styles need a browser accessibility audit.' };
}
