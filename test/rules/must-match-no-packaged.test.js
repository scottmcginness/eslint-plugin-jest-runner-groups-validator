const { RuleTester } = require('eslint');
const proxyquire = require('proxyquire');
const dedent = require('./dedent');

const rule = proxyquire('../../rules/must-match', {
  '../lib/memoize': (/** @type {any} */ func) => func,
  '../lib/read': ({
    readAllowedValues: () => []
  })
});

const ruleTester = new RuleTester();

ruleTester.run('must-match', rule, {
  valid: [{
    name: 'Missing groups comment is allowed, because that is checked by top-level',
    code: dedent`
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
    name: 'Fails if there are no groups defined in the package',
    code: dedent`
       /**
        * @group Any
        */
       describe("");`,
    filename: 'input.test.ts',
    errors: [{
      message: "Group name 'Any' is invalid, because there are no defined groups in the package.",
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 14
    }]
  }, {
    name: 'Fails if there are no groups defined in the package and the comment is indented',
    code: dedent`
          /**
           * @group Any
           */
       describe("");`,
    errors: [{
      message: "Group name 'Any' is invalid, because there are no defined groups in the package.",
      line: 2,
      column: 7,
      endLine: 2,
      endColumn: 17
    }]
  }, {
    name: 'Fails if there are no groups defined in the package and the group is offset from the usual formatting',
    code: dedent`
       /**
        * Offset
        *
        *     @group   Any
        */
       describe("");`,
    errors: [{
      message: "Group name 'Any' is invalid, because there are no defined groups in the package.",
      line: 4,
      column: 8,
      endLine: 4,
      endColumn: 20
    }]
  }, {
    name: 'Fails if there are no groups defined in the package and there are multiple groups given',
    code: dedent`
       /**
        * @group Any
        * @group Another
        */
       describe("");`,
    errors: [{
      message: "Group name 'Any' is invalid, because there are no defined groups in the package.",
      line: 2,
      column: 4,
      endLine: 2,
      endColumn: 14
    }, {
      message: "Group name 'Another' is invalid, because there are no defined groups in the package.",
      line: 3,
      column: 4,
      endLine: 3,
      endColumn: 18
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
      endColumn: 14
    }]
  }].map((c) => ({ ...c, filename: c.filename ?? 'input.test.ts' }))
});
