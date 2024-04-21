const fs = require('fs');
const memoize = require('./memoize');

const defaultPropertyName = 'squadGroups';

/**
 * Reads the package.json file. Assumes it is in the current directory where ESLint is running.
 */
const readFromPackageJson = memoize(() => {
  try {
    return JSON.parse(fs.readFileSync('package.json', 'utf8'));
  } catch {
    return {};
  }
});

const deduplicate = (/** @type {string[]} */ array) => Array.from(new Set(array));

module.exports = {
  /**
   * Determines which allowed values are available, and how they were obtained.
   * @param {JRGV.ESLint.Rule.RuleContext} context - The rule context.
   * @returns {string[]}
   */
  readAllowedValues: (context) => {
    const propertyName = context?.options[0]?.propertyName ?? defaultPropertyName;
    const packageJson = readFromPackageJson();
    const squadGroups = packageJson[propertyName];

    if (Array.isArray(squadGroups)) {
      return deduplicate(squadGroups);
    }

    if (typeof squadGroups === 'object') {
      return deduplicate(Object.values(squadGroups).flatMap((g) => (Array.isArray(g) ? g : [])));
    }

    return [];
  }
};
