const entity = /&(?:lt|gt|amp|quot|apos);/;
const uiKeys = new Set(['label', 'title', 'subtitle', 'placeholder', 'caption', 'description', 'text']);
// React renders JS strings literally. JSXText and HTML attribute entities are
// decoded by the parser and are deliberately outside this rule. This is not
// a general HTML sanitizer or whole-program dataflow analysis. A deliberate
// entity example can use a local eslint-disable comment with an explanation.
export default {
  meta: {
    type: 'problem', schema: [],
    messages: { literal: 'This UI string contains an HTML entity that React displays literally. Use the intended character (for example < or >); keep valid JSX entities and intentional code examples unchanged.' },
  },
  create(context) {
    function check(node, value) {
      if (typeof value !== 'string' || !entity.test(value)) return;
      const p = node.parent;
      const uiProperty = p?.type === 'Property' && p.value === node && uiKeys.has(p.key.name ?? p.key.value);
      const jsxExpression = p?.type === 'JSXExpressionContainer' && p.parent?.type !== 'JSXAttribute';
      const jsxAttribute = p?.type === 'JSXExpressionContainer' && p.parent?.type === 'JSXAttribute'
        && uiKeys.has(p.parent.name?.name);
      if (uiProperty || jsxExpression || jsxAttribute) context.report({ node, messageId: 'literal' });
    }
    return {
      Literal(node) { check(node, node.value); },
      TemplateLiteral(node) { if (!node.expressions.length) check(node, node.quasis[0]?.value?.cooked); },
    };
  },
};
