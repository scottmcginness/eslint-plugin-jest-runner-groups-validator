// @ts-check
const { EOL } = require('os');
const { parseWithComments, print } = require('jest-docblock');
const { onlyRunOnTestFiles } = require('../lib/maybe-do-nothing');
const { messageIds, defaultTopLevelComment } = require('../lib/constants');

const ignoreCommentsContaining = ['eslint-', '@ts-'];

/**
 *
 * @param {JRGV.ESTree.Comment[]} comments
 * @param {JRGV.ESTree.Program['body'][0]} bodyStart
 * @returns
 */
const parseFirstIgnoringTechnical = (comments, bodyStart) => comments
  .filter((c) => c.type === 'Block' && (!bodyStart || c.loc.start.line < bodyStart.loc.start.line))
  .map((c) => ({ parsed: parseWithComments(c.value), raw: c }))
  .filter(({ parsed: c }) => ignoreCommentsContaining.every((i) => !c.comments.includes(i)))[0];

/**
 * Reports the current node as requiring fixing because the are no groups in the first comment.
 * @param {object} _
 * @param {{ comments?: string }} [_.parsed]
 * @param {{ range?: [number, number] }} [_.raw]
 * @param {JRGV.ESLint.Rule.RuleContext} context
 * @param {JRGV.ESTree.Program} node
 */
const reportAndFixNoGroups = ({ parsed, raw }, context, node) => {
  const block = print({
    pragmas: { group: 'TODO' },
    comments: parsed?.comments ? parsed.comments.trimStart() : defaultTopLevelComment
  });

  // Add EOL to fix only when there was no original comment.
  // If there was one, it includes its own whitespace.
  context.report({
    node,
    messageId: messageIds.doesNotExist,
    fix: (f) => f.replaceTextRange(raw?.range ?? [0, 0], block + (raw ? '' : EOL))
  });
};

/**
 * Reports the current node as requiring fixing because the groups comment is completely missing.
 * @param {JRGV.ESLint.Rule.RuleContext} context
 * @param {JRGV.ESTree.Program} node
 */
const reportAndFixMissing = (context, node) => {
  reportAndFixNoGroups({ parsed: undefined, raw: undefined }, context, node);
};

/** @type {JRGV.ESLint.Rule.RuleModule} */
const topLevel = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      [messageIds.doesNotExist]: 'Test file must have at least one Jest runner group'
    },
    docs: {
      description: 'Enforce that the test files each have at least one Jest runner group',
      category: 'Possible Errors',
      recommended: true
    },
    schema: []
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const maybeDoNothing = onlyRunOnTestFiles(context);
    if (maybeDoNothing) {
      return maybeDoNothing;
    }

    const first = parseFirstIgnoringTechnical(sourceCode.ast.comments, sourceCode.ast.body[0]);

    return {
      Program(node) {
        if (!first) {
          // There is a comment for ESLint/TypeScript. Ignore this one.
          reportAndFixMissing(context, node);
          return;
        }

        if (!first.parsed.pragmas || !('group' in first.parsed.pragmas)) {
          // We have a topmost comment, but it didn't contain any groups.
          reportAndFixNoGroups(first, context, node);
        }
      }
    };
  }
};

module.exports = topLevel;
