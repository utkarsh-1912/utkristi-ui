export const webFiles = ['html', 'css', 'js'] as const;
export type WebFile = typeof webFiles[number];
export type WebSource = Record<WebFile, string>;

const blockTags = new Set(['article', 'aside', 'button', 'details', 'dialog', 'div', 'fieldset', 'footer', 'form',
  'h1', 'h2', 'h3', 'header', 'input', 'label', 'li', 'main', 'nav', 'ol', 'option', 'p', 'section',
  'select', 'summary', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul']);

function formatMarkup(markup: string) {
  const template = document.createElement('template');
  template.innerHTML = markup;
  function format(element: Element, indent: string): string {
    const children = [...element.children];
    const hasText = [...element.childNodes].some((node) => node.nodeType !== 1 && (node.nodeType !== 3 || node.textContent?.trim()));
    if (hasText || !children.length || !blockTags.has(element.localName) || children.some((child) => !blockTags.has(child.localName))) {
      return indent + element.outerHTML;
    }
    const empty = element.cloneNode(false) as Element;
    const closing = '</' + element.localName + '>';
    return [indent + empty.outerHTML.slice(0, -closing.length),
      ...children.map((child) => format(child, indent + '  ')), indent + closing].join('\n');
  }
  const children = [...template.content.children];
  return children.length === 1 && markup.trimStart().startsWith('<' + children[0].localName) &&
    [...template.content.childNodes].every((node) => node.nodeType === 1 || (node.nodeType === 3 && !node.textContent?.trim()))
    ? format(children[0], '') : markup;
}

function dedent(source: string) {
  const lines = source.replace(/^\s*\n|\n\s*$/g, '').split('\n');
  const indentation = lines.reduce((minimum, line) => line.trim()
    ? Math.min(minimum, line.match(/^[ \t]*/)?.[0].length ?? 0) : minimum, Infinity);
  return lines.map((line) => line.slice(indentation)).join('\n').trimEnd();
}

export function splitWebSource(source: string, formatStarter = false): WebSource {
  const blocks: Record<'style' | 'script', string[]> = { style: [], script: [] };
  const html = source.replace(/<!--[\s\S]*?-->|<template\b[^>]*>[\s\S]*?<\/template\s*>|<textarea\b[^>]*>[\s\S]*?<\/textarea\s*>|<(style|script)\s*>([\s\S]*?)<\/\1\s*>/gi,
    (match, tag?: string, content?: string) => {
      if (!tag) return match;
      blocks[tag.toLowerCase() as 'style' | 'script'].push(formatStarter ? dedent(content ?? '') : (content ?? '').trim());
      return '';
    }).trim();
  return { html: formatStarter ? formatMarkup(html) : html, css: blocks.style.join('\n\n'), js: blocks.script.join('\n;\n\n') };
}

export function joinWebSource({ html, css, js }: WebSource) {
  return [
    css.trim() && '<style>\n' + css.replace(/<\/style/gi, '<\\/style') + '\n</style>',
    html,
    js.trim() && '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>',
  ].filter(Boolean).join('\n\n');
}
