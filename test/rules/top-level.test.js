const proxyquire = require('proxyquire');
const { RuleTester } = require('eslint');
const dedentCore = require('dedent');
const { EOL } = require('os');

const rule = proxyquire('../../rules/top-level', {
  '../lib/memoize': (/** @type {any} */ func) => func,
  '../lib/read': proxyquire('../../lib/read', {
    './memoize': (/** @type {any} */ func) => func
  })
});

const eol = EOL;

const ruleTester = new RuleTester();

/**
 * @param {TemplateStringsArray} str
 * @param {any[]} [args]
 */
const dedent = (str, args) => (args ? dedentCore(str, args) : dedentCore(str)).split(/[\r\n]/g).join(eol);

ruleTester.run('top-level', rule, {
  valid: [{
    name: 'Top level with a default group is allowed',
    code: dedent`
        /**
         * @group Fast
         */
        describe('', function() {});`
  }, {
    name: 'Top level with multiple default groups is allowed',
    code: dedent`
        /**
         * @group Fast
         * @group Slow
         */
        describe('', function() {});`
  }],
  invalid: [{
    name: 'Top level requires a group when using defaults',
    code: 'describe();',
    output: dedent`
      /**
       * @group TODO
       */
      describe();`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 12
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from empty single line comment',
    only: true,
    code: dedent`
      /* */
      describe("");`,
    output: dedent`
      /**
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from a non-empty single line comment',
    code: dedent`
      /* File comment */
      describe("");`,
    output: dedent`
      /**
       * File comment
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from empty lines',
    code: dedent`
      /**
       */
      describe("");`,
    output: dedent`
      /**
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, when there is a line already in the comment',
    code: dedent`
       /**
        * Description 1
        */
       describe("");`,
    output: dedent`
       /**
        * Description 1
        * @group TODO
        */
       describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its first JSDoc block, when there are multiple block comments',
    code: dedent`
       /**
        * Description 1
        */
       /**
        * Description 2
        */
       describe("");`,
    output: dedent`
       /**
        * Description 1
        * @group TODO
        */
       /**
        * Description 2
        */
       describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its first JSDoc block, when there are multiple block comments, even nested ones',
    code: dedent`
       /**
        * Description 1
        */
       describe("", function() {
         /**
          * Description 2
          */
       });`,
    output: dedent`
       /**
        * Description 1
        * @group TODO
        */
       describe("", function() {
         /**
          * Description 2
          */
       });`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 4
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, when there is a nested non-top-level JSDoc',
    code: dedent`
       describe("", function() {
         /**
          * Description 2
          */
       });`,
    output: dedent`
       /**
        * @group TODO
        */
       describe("", function() {
         /**
          * Description 2
          */
       });`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      column: 1,
      endColumn: 4
    }]
  }]
});
