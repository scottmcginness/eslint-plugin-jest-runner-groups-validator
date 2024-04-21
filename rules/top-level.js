// @ts-check
const { EOL } = require('os');
const { messageIds } = require('../lib/constants');

/** @type {TV.ESLint.Rule.RuleModule} */
const topLevel = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      [messageIds.doesNotExist]: 'Test file must have at least one Jest runner group'
    },
    docs: {
      description: 'Enforce that the Mocha describe blocks at the top level have tags',
      category: 'Possible Errors',
      recommended: true
    },
    schema: []
  },
  create(context) {
    const groupMatcher = /@group (?<group>.+)/;

    return {
      Program(node) {
        const sourceCode = context.getSourceCode();

        // TODO: might not *be* the first. Grab others?
        const topmostComment = sourceCode.ast.comments[0];

        const eol = EOL;

        if (!topmostComment) {
          context.report({
            node,
            messageId: messageIds.doesNotExist,
            fix: (f) => f.insertTextBefore(node, ['/**', ' * @group TODO', ' */', ''].join(eol))
          });

          return;
        }

        const isBeforeBody = topmostComment.loc.start.line < sourceCode.ast.body[0].loc.start.line;

        if (!isBeforeBody) {
          context.report({
            node,
            messageId: messageIds.doesNotExist,
            fix: (f) => f.insertTextBefore(node, ['/**', ' * @group TODO', ' */', ''].join(eol))
          });

          return;
        }

        if (topmostComment?.type === 'Block') {
          // Good. Find the groups inside this block.
          // TODO: Make sure that this is the very first comment in the file?
          const lines = topmostComment.value.split(/[\r\n]+/g);
          const groupNames = lines.map((l) => l.match(groupMatcher)?.groups?.group).filter(Boolean);

          if (groupNames.length === 0) {
            lines.splice(lines.length - 1, 0, ' * @group TODO');

            context.report({
              node,
              messageId: messageIds.doesNotExist,
              fix: (f) => f.replaceTextRange(topmostComment.range, `/*${lines.join(eol)}*/`)
            });
          }
        }
      }
    };
  }
};

module.exports = topLevel;
