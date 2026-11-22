const classesFor = (node) => {
  const attribute = node.attributes.find((item) => item.type === 'JSXAttribute' && ['className', 'class'].includes(item.name.name));
  const value = attribute?.value?.type === 'JSXExpressionContainer' ? attribute.value.expression : attribute?.value;
  return typeof value?.value === 'string' ? value.value.split(/\s+/).filter(Boolean) : [];
};
const has = (node, names) => node.attributes.some((attribute) => attribute.type === 'JSXSpreadAttribute' ||
  (attribute.type === 'JSXAttribute' && names.includes(attribute.name.name) &&
    (attribute.value?.type === 'JSXExpressionContainer' ? attribute.value.expression.type !== 'JSXEmptyExpression' &&
      (attribute.value.expression.type !== 'Literal' || Boolean(attribute.value.expression.value)) : Boolean(attribute.value?.value))));
const rule = (description, create) => ({ meta: { type: 'problem', docs: { description }, schema: [] }, create });
const physical = /^(?:left|right|top|bottom|(?:margin|padding|inset)(?:Top|Right|Bottom|Left)|border(?:Top|Right|Bottom|Left)(?:(?:Right|Left)?Radius|Color|Style|Width)?)$/;

const rules = {
  'valid-class-combo': rule('Require base classes for standalone variants.', (context) => ({
    JSXOpeningElement(node) {
      const classes = classesFor(node);
      if (!classes.includes('btn') && classes.some((name) => /^btn-(solid|ghost|quiet|danger)$/.test(name))) {
        context.report({ node, message: 'Button variants require the btn base class.' });
      }
    },
  })),
  'icon-button-label': rule('Give icon-only controls an accessible name.', (context) => ({
    JSXOpeningElement(node) {
      const component = node.name.name === 'IconButton' || node.name.property?.name === 'IconButton';
      if (!component && !classesFor(node).includes('icon-btn')) return;
      const hasName = has(node, component ? ['label'] : ['aria-label', 'aria-labelledby']);
      const hasText = !component && node.parent.children.some((child) =>
        (child.type === 'JSXText' && child.value.trim()) ||
        (child.type === 'JSXExpressionContainer' && child.expression.type === 'Literal' && typeof child.expression.value === 'string' && child.expression.value.trim()));
      if (!hasName && !hasText) context.report({ node, message: 'Give the icon button an accessible name.' });
    },
  })),
  'no-physical-props': rule('Use logical properties for direction-independent JSX styles.', (context) => ({
    JSXAttribute(node) {
      if (node.name.name !== 'style' || node.value?.type !== 'JSXExpressionContainer' || node.value.expression.type !== 'ObjectExpression') return;
      for (const property of node.value.expression.properties) {
        if (property.type !== 'Property' || property.computed) continue;
        const name = property.key.name ?? property.key.value;
        if (typeof name === 'string' && physical.test(name)) {
          context.report({ node: property.key, message: `Replace "${name}" with a logical CSS property.` });
        }
      }
    },
  })),
};

const plugin = { meta: { name: 'eslint-plugin-utkristi', version: '0.1.0' }, rules, configs: {} };
plugin.configs.recommended = {
  plugins: { ut: plugin },
  rules: { 'ut/valid-class-combo': 'error', 'ut/icon-button-label': 'error', 'ut/no-physical-props': 'warn' },
};
export default plugin;
