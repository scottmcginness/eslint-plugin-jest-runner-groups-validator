// @ts-check
const { parseWithComments } = require('jest-docblock');
const { EOL } = require('os');
const { readAllowedValues } = require('../lib/read');
const memoize = require('../lib/memoize');
const { messageIds, defaultTopLevelComment } = require('../lib/constants');
const { onlyRunOnTestFiles } = require('../lib/maybe-do-nothing');

/** @type {((options: { words: string[] }) => (str: string) => string)} */
const autocorrectCreator = memoize(require('autocorrect'));

/**
 * @param {object} _
 * @param {string} _.text
 * @param {{ raw: { value: string, loc?: JRGV.ESTree.Location } }} _.comment
 */
const locationOfTextInComment = ({ text, comment }) => {
  // TODO: what if line shift is 0 or -1?
  const find = new RegExp(text, 'g');
  const commentLines = comment.raw.value.split(EOL);

  const lineShift = commentLines.findIndex((v) => find.test(v));

  const colMatch = commentLines[lineShift].match(find);
  const colShift = commentLines[lineShift].indexOf(colMatch[0]);

  const line = comment.raw.loc.start.line + lineShift;

  return {
    start: { line, column: colShift },
    end: { line, column: colShift + colMatch[0].length }
  };
};

/**
 * @param {object} _
 * @param {string} _.group
 * @param {{ raw: { value: string, loc?: JRGV.ESTree.Location } }} _.comment
 */
const locationOfGroupInComment = ({ group, comment }) => locationOfTextInComment({ text: `@group\\s+${group}`, comment });

/**
 * @param {object} _
 * @param {JRGV.ESLint.Rule.RuleContext} _.context
 * @param {string} _.group
 * @param {{ raw: { value: string, loc?: JRGV.ESTree.Location } }} _.comment
 */
const reportPlaceholderGroup = ({ context, group, comment }) => {
  const loc = locationOfGroupInComment({ group, comment });

  context.report({
    loc,
    messageId: messageIds.placeholderGroupName,
    data: {
      value: group.trim()
    }
  });
};

/**
 * @param {object} _
 * @param {JRGV.ESLint.Rule.RuleContext} _.context
 * @param {string} _.group
 * @param {{ raw: { value: string, loc?: JRGV.ESTree.Location } }} _.comment
 */
const reportEmptyGroup = ({ context, group, comment }) => {
  const loc = locationOfGroupInComment({ group, comment });

  context.report({
    loc,
    messageId: messageIds.emptyGroup,
    data: {
      value: group.trim()
    }
  });
};

/**
 * @param {object} _
 * @param {JRGV.ESLint.Rule.RuleContext} _.context
 * @param {string} _.group
 * @param {} _.comment
 * @param {string} [_.closest]
 */
const reportBadGroupName = ({
  context,
  group,
  comment,
  closest
}) => {
  const loc = locationOfGroupInComment({ group, comment });

  context.report({
    loc,
    messageId: closest ? messageIds.invalidGroupName : messageIds.noDefinedGroups,
    data: {
      value: group.trim(),
      closest
    }
  });
};

/**
 *
 * @param {JRGV.ESTree.Comment[]} comments
 * @param {JRGV.ESTree.Program['body'][0]} bodyStart
 * @returns
 */
const parseAll = (comments, bodyStart) => comments
  .filter((c) => c.type === 'Block' && (!bodyStart || c.loc.start.line < bodyStart.loc.start.line))
  .map((c) => ({ parsed: parseWithComments(c.value), raw: c }));

/** @type {JRGV.ESLint.Rule.RuleModule} */
const mustMatch = {
  meta: {
    type: 'problem',
    messages: {
      [messageIds.noDefinedGroups]: "Group name '{{value}}' is invalid, because there are no defined groups in the package.",
      [messageIds.invalidGroupName]: "Invalid group name '{{value}}'. Did you mean '{{closest}}'?",
      [messageIds.emptyGroup]: 'Group name cannot be empty.',
      [messageIds.placeholderGroupName]: "Invalid group name '{{value}}'. This generated group is only a placeholder.",
      [messageIds.placeholderFileText]: 'Placeholder text for groups should be replaced.'
    },
    docs: {
      description: 'Enforce that the Jest runner groups have valid names',
      category: 'Possible Errors',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        properties: {
          propertyName: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const maybeDoNothing = onlyRunOnTestFiles(context);
    if (maybeDoNothing) {
      return maybeDoNothing;
    }

    const allowedValues = readAllowedValues(context);
    const autocorrect = allowedValues.length > 0
      ? autocorrectCreator({ words: allowedValues })
      : (/** @type {string} */ w) => w;

    const allComments = parseAll(sourceCode.ast.comments, sourceCode.ast.body[0]);

    return {
      Program() {
        allComments.forEach((comment) => {
          if (comment.parsed.comments.includes(defaultTopLevelComment)) {
            const loc = locationOfTextInComment({ text: defaultTopLevelComment, comment });

            context.report({
              loc,
              messageId: messageIds.placeholderFileText
            });
          }

          if (!comment.parsed.pragmas || !('group' in comment.parsed.pragmas)) {
            // This is ok, there are no groups to check in this comment.
            return;
          }

          const commentGroups = Array.isArray(comment.parsed.pragmas.group)
            ? comment.parsed.pragmas.group
            : [comment.parsed.pragmas.group];

          commentGroups.forEach((group) => {
            if (group.trim() === 'TODO') {
              reportPlaceholderGroup({ context, group, comment });
            } else if (group.trim() === '') {
              reportEmptyGroup({ context, group, comment });
            } else if (allowedValues.length === 0) {
              reportBadGroupName({ context, group, comment });
            } else {
              const closest = autocorrect(group);

              if (closest !== group) {
                reportBadGroupName({
                  context, group, comment, closest
                });
              }
            }
          });
        });
      }
    };
  }
};

module.exports = mustMatch;
