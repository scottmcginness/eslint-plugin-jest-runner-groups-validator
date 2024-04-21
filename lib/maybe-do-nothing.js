const { includeFileNames } = require('./constants');

const doNothing = {
  Program() {
    // Do nothing.
  }
};

/**
 * Returns a "do nothing" program linter if the context file is reportable.
 * @param {JRGV.ESLint.Rule.RuleContext} context
 */
const onlyRunOnTestFiles = (context) => {
  const filename = context.getFilename();
  return includeFileNames.test(filename) ? undefined : doNothing;
};

module.exports = { onlyRunOnTestFiles };
