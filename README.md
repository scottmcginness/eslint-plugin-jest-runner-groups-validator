# ESLint Jest runner groups validator

Provides an ESLint plugin that validates Jest runner groups applied to tests. These groups are the ones are defined using [jest-runner-groups](https://www.npmjs.com/package/jest-runner-groups).

This is useful when you would like to restrict groups to a particular subset:
  * in case a group is mis-typed and would not then run in your suite;
  * so that existing groups can be re-used, instead of making new ones accidentally.

## Installation

Assuming you have ESLint installed already:

```sh
npm install --save-dev eslint-plugin-jest-runner-groups-validator
```

In your `.eslintrc.json` (or similar):

```json
{
  "plugins": [
    "jest-runner-groups-validator"
  ],
  "rules": {
    "jest-runner-groups-validator/must-match": "error",
    "jest-runner-groups-validator/top-level": "error"
  }
}
```

Then in your `package.json` file, define a property:
```json
{
  squadTags: ["Fast", "Slow", "Smoke"]
  name: ...,
  dependencies: ...
  etc...
}
```

## Configurations

The `top-level` rule, when enabled, will require that a groups docblock is defined in every file that contains tests, as determined by `.test.[ext]` files.

The `must-match` rule will then validate that those groups are restricted to the set of known values in the `package.json` file, as above. There is a single option in this rule, which allows you to specify the name of the property in the package:

```json
// .eslintrc.json
{
    "jest-runner-groups-validator/must-match": ["error", { "propertyName": "groupings" }]
}
```
which corresponds with:
```json
// package.json
{
  groupings: ["Fast", "Slow", "Smoke"]
  name: ...,
  dependencies: ...
  etc...
}
```

The default property is `squadTags`. You can define this property as either an array:
```json
// package.json
{
  squadTags: ["Fast", "Slow", "Smoke"]
  name: ...,
  dependencies: ...
  etc...
}

// Code allows any of:
/**
 * @group Fast
 * @group Slow
 * @group Smoke
 */
```

or an object of arrays:
```json
// package.json
{
  squadTags: {
    "sanity": ["Fast", "Smoke", "Sanity"],
    "full": ["Fast", "Slow", "Regression"]
  },
  name: ...,
  dependencies: ...
  etc...
}

// Code allows any of:
/**
 * @group Fast
 * @group Slow
 * @group Smoke
 * @group Sanity
 * @group Regression
 */
```

## Fixes

* At the `top-level`, a new comment will be added, with a placeholder group, to the top of the file, if one does not already exist.
  * If one already existed, the plugin will attempt to add placeholder groups to the first block comment in the file.
  * The placeholders will also be reported as errors. Specifically, `TODO` is not a valid group name and the top text (if it was empty) needs to be replaced.
* In `must-match`, there are no fixes. But there are "autocorrect" suggestions for possible group names. e.g.
  ```javascript
  /**
   * @group Slo
     ^^^^^^^^^^ Invalid group name 'Slo'. Did you mean 'Slow'?
   */
  ```