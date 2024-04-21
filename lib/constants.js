module.exports = {
  messageIds: Object.freeze({
    doesNotExist: 'doesNotExist'
  }),
  defaultAllowedValues: [
    '@smoke',
    '@regression',
    '@slow',
    '@fast',
    '@low',
    '@medium',
    '@high',
    '@critical'
  ],
  taggableMochaBlocks: ['describe', 'context', 'it'],
  mochaSubmethods: ['only', 'skip'],
  lineMatcher: /^\W*(@\w+)/
};
