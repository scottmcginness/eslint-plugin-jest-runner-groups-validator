const { RuleTester } = require('eslint');
const proxyquire = require('proxyquire');
const dedent = require('./dedent');

const rule = proxyquire('../../rules/must-match', {
  '../lib/memoize': (/** @type {any} */ func) => func,
  '../lib/read': ({
    readAllowedValues: () => ['Fast', 'Slow']
  })
});

const ruleTester = new RuleTester();

ruleTester.run('must-match', rule, {
  valid: [{
    name: 'Group with name that is in package.json is allowed',
    code: dedent`
       /**
        * @group Fast
        * @group Slow
        */
       describe("");`
  }, {
    name: 'Missing groups comment is allowed because that is checked by top-level',
    code: dedent`
        describe("");`
  }, {
    name: 'Missing groups in the top-level comment is allowed because that is checked by top-level',
    code: dedent`
        /** File comment */
        describe("");`
  }, {
    name: 'Group with bad name but not in .test.ts file is allowed',
    code: dedent`
        /**
         * @group Bad
         */
        describe('', function() {});`,
    filename: 'other.ts'
  }, {
    name: 'Group with bad name but in .test.tsx file is allowed',
    code: dedent`
        /**
         * @group Bad
         */
        describe('', function() {});`,
    filename: 'other.tsx'
  }, {
    name: 'Group with bad name but in .test.js file is allowed',
    code: dedent`
        /**
         * @group Bad
         */
        describe('', function() {});`,
    filename: 'other.js'
  }, {
    name: 'Group with bad name but in .test.jsx file is allowed',
    code: dedent`
        /**
         * @group Bad
         */
        describe('', function() {});`,
    filename: 'other.jsx'
  }, {
    name: 'Group with bad name but in .test.mjs file is allowed',
    code: dedent`
        /**
         * @group Bad
         */
        describe('', function() {});`,
    filename: 'other.mjs'
  }, {
    name: 'Group with bad name but in .test.cjs file is allowed',
    code: dedent`
        /**
         * @group Bad
         */
        describe('', function() {});`,
    filename: 'other.cjs'
  }].map((c) => ({ ...c, filename: c.filename ?? 'input.test.ts' })),
  invalid: [{
    name: 'Fails if the group does not match any name in the package',
    code: dedent`
        /**
         * @group Fas
         */
        describe("");`,
    filename: 'input.test.ts',
    errors: [{
      message: "Invalid group name 'Fas'. Did you mean 'Fast'?",
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 14
    }]
  }, {
    name: 'Fails if the group does not match any name in the package and the comment is indented',
    code: dedent`
           /**
            * @group Fas
            */
        describe("");`,
    errors: [{
      message: "Invalid group name 'Fas'. Did you mean 'Fast'?",
      line: 2,
      column: 7,
      endLine: 2,
      endColumn: 17
    }]
  }, {
    name: 'Fails if the group does not match any name in the package and the group is offset from the usual formatting',
    code: dedent`
        /**
         * Offset
         *
         *     @group   Fas
         */
        describe("");`,
    errors: [{
      message: "Invalid group name 'Fas'. Did you mean 'Fast'?",
      line: 4,
      column: 8,
      endLine: 4,
      endColumn: 20
    }]
  }, {
    name: 'Fails if the group does not match any name in the package and there are multiple groups given',
    code: dedent`
        /**
         * @group Fas
         * @group Slo
         */
        describe("");`,
    errors: [{
      message: "Invalid group name 'Fas'. Did you mean 'Fast'?",
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 14
    }, {
      message: "Invalid group name 'Slo'. Did you mean 'Slow'?",
      line: 3,
      column: 4,
      endLine: 3,
      endColumn: 14
    }]
  }, {
    name: 'Fails if just one group does not match any name in the package and there are multiple groups given',
    code: dedent`
        /**
         * ↓ Interleave other pragmas, in case they interfere.
         * @filename Filename
         * @group Fas
         * @other thing
         * @group Slow
         */
        describe("");`,
    errors: [{
      message: "Invalid group name 'Fas'. Did you mean 'Fast'?",
      line: 4,
      column: 4,
      endLine: 4,
      endColumn: 14
    }]
  }, {
    name: 'Fails if there is an empty group',
    code: dedent`
       /**
        * @group
        */
       describe("");`,
    errors: [{
      message: 'Group name cannot be empty.',
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 10
    }]
  }, {
    name: 'Fails if there is a whitespace-only group',
    code: dedent`
       /**
        * @group    
        */
       describe("");`,
    errors: [{
      message: 'Group name cannot be empty.',
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 14
    }]
  }, {
    name: 'Fails with a specific message on the TODO group',
    code: dedent`
        /**
         * @group TODO
         */
        describe("");`,
    errors: [{
      message: "Invalid group name 'TODO'. This generated group is only a placeholder.",
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 15
    }]
  }, {
    name: 'Fails with a specific message on the default TODO file comment',
    code: dedent`
        /**
         * TODO: Describe the tests in this file.
         * @group Fast
         */
        describe("");`,
    errors: [{
      message: 'Placeholder text for groups should be replaced.',
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 42
    }]
  }].map((c) => ({ ...c, filename: c.filename ?? 'input.test.ts' }))
});
