import * as ESLintModule from 'eslint';
import * as ESTreeModule from 'estree';

// TODO: remove unused.
declare namespace ESTree {
  type Property = ESTreeModule.Property;
  type CallExpression = ESTreeModule.CallExpression;
  type Expression = ESTreeModule.Expression;
  type Pattern = ESTreeModule.Pattern;
  type SpreadElement = ESTreeModule.SpreadElement;
  type Literal = ESTreeModule.Literal;
  type SimpleLiteral = ESTreeModule.SimpleLiteral;
  type Program = ESTreeModule.Program;
  type Comment = ESTreeModule.Comment;
}

declare namespace ESLint {
  namespace Rule {
    type RuleModule  = ESLintModule.Rule.RuleModule;
    type RuleContext = ESLintModule.Rule.RuleContext;
    type NodeParentExtension = ESLintModule.Rule.NodeParentExtension;
  }
}

declare module 'eslint' {
  namespace RuleTester {
      interface TestCaseError {
        messages?: Record<string, string>
      }
  }
}

export as namespace JRGV;