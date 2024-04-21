import * as ESLintModule from 'eslint';
import * as ESTreeModule from 'estree';

declare namespace ESTree {
  type Program = ESTreeModule.Program;
  type Comment = ESTreeModule.Comment;
  type Location = ESTreeModule.SourceLocation;
}

declare namespace ESLint {
  namespace Rule {
    type RuleModule  = ESLintModule.Rule.RuleModule;
    type RuleContext = ESLintModule.Rule.RuleContext;
  }
}

export as namespace JRGV;