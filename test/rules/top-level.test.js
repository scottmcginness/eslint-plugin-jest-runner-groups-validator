const proxyquire = require('proxyquire');
const { RuleTester } = require('eslint');
const dedent = require('./dedent');

const rule = proxyquire('../../rules/top-level', {
  '../lib/memoize': (/** @type {any} */ func) => func,
  '../lib/read': proxyquire('../../lib/read', {
    './memoize': (/** @type {any} */ func) => func
  })
});

const ruleTester = new RuleTester();

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
  }, {
    name: 'Top level with preceding ESLint file comment is allowed',
    code: dedent`
        /* eslint-disable comma-dangle */
        /**
         * @group Fast
         * @group Slow
         */
        describe('', function() {});`
  }, {
    name: 'Top level with preceding Typescript file comment is allowed',
    code: dedent`
        // @ts-check
        /**
         * @group Fast
         * @group Slow
         */
        describe('', function() {});`
  }, {
    name: 'Top level with missing groups but not in .test.ts file is allowed',
    code: dedent`
        describe('', function() {});`,
    filename: 'other.ts'
  }, {
    name: 'Top level with missing groups but not in .test.tsx file is allowed',
    code: dedent`
        describe('', function() {});`,
    filename: 'other.tsx'
  }, {
    name: 'Top level with missing groups but not in .test.js file is allowed',
    code: dedent`
        describe('', function() {});`,
    filename: 'other.js'
  }, {
    name: 'Top level with missing groups but not in .test.jsx file is allowed',
    code: dedent`
        describe('', function() {});`,
    filename: 'other.jsx'
  }, {
    name: 'Top level with missing groups but not in .test.mjs file is allowed',
    code: dedent`
        describe('', function() {});`,
    filename: 'other.mjs'
  }, {
    name: 'Top level with missing groups but not in .test.cjs file is allowed',
    code: dedent`
        describe('', function() {});`,
    filename: 'other.cjs'
  }].map((c) => ({ ...c, filename: c.filename ?? 'input.test.ts' })),
  invalid: [{
    name: 'Top level requires a group when using defaults',
    code: 'describe();',
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */

      describe();`,
    filename: 'input.test.ts',
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 12
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from empty single line comment',
    code: dedent`
      /* */
      describe("");`,
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 2,
      column: 1,
      endLine: 2,
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
       *
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 2,
      column: 1,
      endLine: 2,
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
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 3,
      column: 1,
      endLine: 3,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from lines with other pragmas, but does not clobber them',
    code: dedent`
      /**
       * @file Filename
       * @other thing
       */
      describe("");`,
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @file Filename
       * @other thing
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 5,
      column: 1,
      endLine: 5,
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
        *
        * @group TODO
        */
       describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 4,
      column: 1,
      endLine: 4,
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
        *
        * @group TODO
        */
       /**
        * Description 2
        */
       describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 7,
      column: 1,
      endLine: 7,
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
        *
        * @group TODO
        */
       describe("", function() {
         /**
          * Description 2
          */
       });`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 4,
      column: 1,
      endLine: 8,
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
        * TODO: Describe the tests in this file.
        *
        * @group TODO
        */

       describe("", function() {
         /**
          * Description 2
          */
       });`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 1,
      column: 1,
      endLine: 5,
      endColumn: 4
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from a single ESLint disable file comment',
    code: dedent`
      /* eslint-disable comma-dangle */
      describe("");`,
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */

      /* eslint-disable comma-dangle */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 2,
      column: 1,
      endLine: 2,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from multiple ESLint disable file comments',
    code: dedent`
      /* eslint-disable comma-dangle */
      /* eslint-disable curly */
      describe("");`,
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */

      /* eslint-disable comma-dangle */
      /* eslint-disable curly */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 3,
      column: 1,
      endLine: 3,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from multiple ESLint disable file comments as well as another file-level comment',
    code: dedent`
      /* eslint-disable comma-dangle */
      /* eslint-disable curly */
      /* File comment */
      describe("");`,
    output: dedent`
      /* eslint-disable comma-dangle */
      /* eslint-disable curly */
      /**
       * File comment
       *
       * @group TODO
       */
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 4,
      column: 1,
      endLine: 4,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from a single line comment',
    code: dedent`
      // File comment
      describe("");`,
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */

      // File comment
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 2,
      column: 1,
      endLine: 2,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, starting from a single line comment with a group',
    code: dedent`
      // @group Fast
      describe("");`,
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */

      // @group Fast
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 2,
      column: 1,
      endLine: 2,
      endColumn: 14
    }]
  }, {
    name: 'Top level requires a group in its JSDoc block, when there are imports',
    code: dedent`
      var fs = require('fs');
      describe("");`,
    output: dedent`
      /**
       * TODO: Describe the tests in this file.
       *
       * @group TODO
       */

      var fs = require('fs');
      describe("");`,
    errors: [{
      message: 'Test file must have at least one Jest runner group',
      line: 1,
      column: 1,
      endLine: 2,
      endColumn: 14
    }]
  }].map((c) => ({ ...c, filename: c.filename ?? 'input.test.ts' }))
});
