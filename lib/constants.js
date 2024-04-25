module.exports = {
  messageIds: Object.freeze({
    doesNotExist: 'doesNotExist',
    noDefinedGroups: 'noDefinedGroups',
    invalidGroupName: 'invalidGroupName',
    emptyGroup: 'emptyGroup',
    placeholderGroupName: 'placeholderGroupName',
    placeholderFileText: 'placeholderFileText'
  }),
  defaultTopLevelComment: 'TODO: Describe the tests in this file.',
  includeFileNames: /[.]test[.](ts|tsx|js|jsx|mjs|cjs)$/i,
  emptyCommentLineMatcher: /^\s*[*]\s*$/
};
