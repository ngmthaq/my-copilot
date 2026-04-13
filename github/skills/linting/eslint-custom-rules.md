---
name: eslint-custom-rules
description: "Writing custom ESLint rules and rule selectors for JavaScript and TypeScript projects. Use when: creating a project-specific lint rule; enforcing a coding convention not covered by existing plugins; writing AST-based rules with node visitors; adding fixers to auto-correct violations; testing custom rules with RuleTester; publishing rules as a local or npm plugin. DO NOT USE FOR: configuring existing ESLint rules (use eslint-rule-configuration skill); integrating third-party ESLint plugins (use eslint-plugin-integration skill); general ESLint setup (use eslint-rule-configuration skill)."
---

# ESLint Custom Rules Skill

## Overview

This skill covers writing custom ESLint rules from scratch — understanding the AST, using node visitors, reporting violations, applying auto-fixers, and testing rules with `RuleTester`. It targets the ESLint flat config (`eslint.config.js`) format and ESLint v8/v9.

---

## 1. How ESLint Rules Work

ESLint parses source code into an **Abstract Syntax Tree (AST)**. A rule registers visitor functions for specific AST node types. When ESLint traverses the tree and encounters a matching node, it calls your visitor and you decide whether to report a problem.

```
Source code
    │
    ▼
Parser (espree / @typescript-eslint/parser)
    │
    ▼
AST (Abstract Syntax Tree)
    │
    ▼
Rule visitors (your code) → report() → lint errors
```

### Explore the AST interactively

Use **[astexplorer.net](https://astexplorer.net)** to paste code and inspect the resulting AST nodes. Select:

- Parser: `espree` (JavaScript) or `@typescript-eslint/parser` (TypeScript)
- Transform: `ESLint v8`

---

## 2. Rule Structure

```js
// rules/my-rule.js
export default {
  meta: {
    type: "suggestion", // 'problem' | 'suggestion' | 'layout'
    docs: {
      description: "Enforce something useful",
      recommended: false,
    },
    fixable: "code", // 'code' | 'whitespace' | omit if not fixable
    hasSuggestions: false, // true if rule provides suggestions (not auto-fix)
    schema: [
      // JSON Schema for rule options
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      avoidThis: "Avoid using {{name}} here.",
      useThisInstead: "Use {{alternative}} instead.",
    },
  },

  create(context) {
    // context.options[0] = first option passed to the rule
    const options = context.options[0] || {};
    const allow = options.allow || [];

    return {
      // Visitor: called when ESLint encounters a node of this type
      Identifier(node) {
        if (allow.includes(node.name)) return;

        context.report({
          node,
          messageId: "avoidThis",
          data: { name: node.name },
          fix(fixer) {
            return fixer.replaceText(node, `_${node.name}`);
          },
        });
      },
    };
  },
};
```

---

## 3. `meta` Object Reference

### `meta.type`

| Value          | Meaning                                               |
| -------------- | ----------------------------------------------------- |
| `'problem'`    | Likely to cause a bug; should be an error             |
| `'suggestion'` | Could be improved; warn or error depending on project |
| `'layout'`     | Whitespace / formatting only                          |

### `meta.fixable`

| Value          | Meaning                       |
| -------------- | ----------------------------- |
| `'code'`       | Rule modifies code tokens     |
| `'whitespace'` | Rule only modifies whitespace |
| omitted        | Rule has no auto-fix          |

### `meta.schema`

Validates rule options. Use JSON Schema syntax. ESLint will throw if options don't match:

```js
schema: []; // no options allowed
schema: [{ enum: ["always", "never"] }]; // one string option
schema: [{ type: "boolean" }];
```

---

## 4. The `context` Object

```js
create(context) {
  context.options          // array of rule options from config
  context.filename         // path of the file being linted
  context.getSourceCode()  // SourceCode object (deprecated in v9: use context.sourceCode)
  context.sourceCode       // ESLint v9+ preferred API

  context.report({
    node,                  // AST node to highlight
    loc,                   // optional: { line, column } or { start, end }
    messageId,             // key from meta.messages
    data,                  // template variables for message
    fix(fixer) { ... },    // auto-fix function
    suggest: [ ... ],      // array of suggestions (hasSuggestions: true required)
  });
}
```

---

## 5. The `fixer` API

Used inside `fix(fixer)` callbacks to produce code changes:

```js
fix(fixer) {
  // Replace the entire node's text
  return fixer.replaceText(node, 'newCode');

  // Replace a range [start, end] of characters
  return fixer.replaceTextRange([node.range[0], node.range[1]], 'newCode');

  // Insert text before/after a node
  return fixer.insertTextBefore(node, '/* before */ ');
  return fixer.insertTextAfter(node, ' /* after */');

  // Remove a node
  return fixer.remove(node);

  // Remove a range
  return fixer.removeRange([start, end]);

  // Return multiple fixes as an array or generator:
  return [
    fixer.remove(node.decorators[0]),
    fixer.replaceText(node.id, 'newName'),
  ];
}
```

---

## 6. The `SourceCode` API

```js
create(context) {
  const sourceCode = context.sourceCode;

  return {
    Program(node) {
      // Get the raw source text of a node:
      const text = sourceCode.getText(node);

      // Get tokens:
      const tokens = sourceCode.getTokens(node);
      const firstToken = sourceCode.getFirstToken(node);
      const lastToken = sourceCode.getLastToken(node);

      // Get comments:
      const comments = sourceCode.getCommentsBefore(node);
      const allComments = sourceCode.getAllComments();

      // Check for a directive comment disabling the rule:
      // (handled automatically by ESLint)
    },
  };
}
```

---

## 7. Common AST Node Visitors

```js
return {
  // Function declarations and expressions
  FunctionDeclaration(node) {},
  FunctionExpression(node) {},
  ArrowFunctionExpression(node) {},

  // Variable declarations
  VariableDeclaration(node) {}, // let/const/var
  VariableDeclarator(node) {},

  // Identifiers and literals
  Identifier(node) {},
  Literal(node) {},
  TemplateLiteral(node) {},

  // Calls and members
  CallExpression(node) {},
  MemberExpression(node) {},
  NewExpression(node) {},

  // Imports / exports
  ImportDeclaration(node) {},
  ExportNamedDeclaration(node) {},
  ExportDefaultDeclaration(node) {},

  // Classes
  ClassDeclaration(node) {},
  MethodDefinition(node) {},

  // Control flow
  IfStatement(node) {},
  ReturnStatement(node) {},

  // Run code when LEAVING a node (colon suffix):
  "FunctionDeclaration:exit"(node) {},
  "Program:exit"(node) {},
};
```

---

## 8. TypeScript-Aware Rules

Install the TypeScript parser and types:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/utils
```

```js
// rules/no-unsafe-any.js
import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://example.com/rules/${name}`);

export default createRule({
  name: "no-unsafe-any",
  meta: {
    type: "problem",
    docs: { description: "Disallow unsafe use of any" },
    messages: { unsafeAny: "Unsafe use of any type." },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSTypeAnnotation(node) {
        // Access TypeScript type checker via parserServices
        const parserServices = ESLintUtils.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(tsNode);

        if (type.flags & /* TypeFlags.Any */ 1) {
          context.report({ node, messageId: "unsafeAny" });
        }
      },
    };
  },
});
```

---

## 9. Rule Selectors (AST Selectors)

ESLint supports **esquery** selectors as visitor keys — similar to CSS selectors for the AST:

```js
return {
  // Match CallExpression whose callee is an Identifier named "eval"
  'CallExpression[callee.name="eval"]'(node) {
    context.report({ node, messageId: "noEval" });
  },

  // Match console.log calls
  'CallExpression[callee.object.name="console"][callee.property.name="log"]'(node) {
    context.report({ node, messageId: "noConsoleLog" });
  },

  // Match any function with more than 3 parameters
  ":function[params.length>3]"(node) {
    context.report({ node, messageId: "tooManyParams" });
  },

  // Match the first VariableDeclarator inside a VariableDeclaration
  "VariableDeclaration > VariableDeclarator:first-child"(node) {},

  // Match nested IfStatements (if inside if)
  "IfStatement IfStatement"(node) {},

  // :not pseudo-class
  ":not(FunctionDeclaration) > BlockStatement"(node) {},
};
```

---

## 10. Testing with `RuleTester`

```js
// rules/__tests__/my-rule.test.js
import { RuleTester } from "eslint";
import myRule from "../my-rule.js";

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

tester.run("my-rule", myRule, {
  valid: [
    // Code that should NOT produce errors
    { code: `const x = 1;` },
    { code: `const x = 1;`, options: [{ allow: ["x"] }] },
  ],

  invalid: [
    // Code that SHOULD produce errors
    {
      code: `const foo = 1;`,
      errors: [{ messageId: "avoidThis", data: { name: "foo" } }],
    },
    // Test auto-fix output:
    {
      code: `const foo = 1;`,
      output: `const _foo = 1;`,
      errors: [{ messageId: "avoidThis" }],
    },
  ],
});
```

### TypeScript-aware RuleTester

```js
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as parser from "@typescript-eslint/parser";

const tester = new RuleTester({
  languageOptions: { parser },
});
```

---

## 11. Using a Custom Rule in a Project (No Plugin)

### Flat config (`eslint.config.js`)

```js
import myRule from "./rules/my-rule.js";

export default [
  {
    plugins: {
      local: {
        rules: {
          "my-rule": myRule,
        },
      },
    },
    rules: {
      "local/my-rule": "error",
      "local/my-rule": ["warn", { allow: ["foo"] }],
    },
  },
];
```

---

## 12. Publishing as an ESLint Plugin

```
eslint-plugin-my-org/
├── src/
│   └── rules/
│       ├── my-rule.js
│       └── another-rule.js
├── src/index.js         ← plugin entry point
├── package.json
└── README.md
```

```js
// src/index.js
import myRule from './rules/my-rule.js';
import anotherRule from './rules/another-rule.js';

export default {
  meta: {
    name: 'eslint-plugin-my-org',
    version: '1.0.0',
  },
  rules: {
    'my-rule': myRule,
    'another-rule': anotherRule,
  },
  configs: {
    recommended: {
      plugins: { 'my-org': /* self */ },
      rules: {
        'my-org/my-rule': 'error',
        'my-org/another-rule': 'warn',
      },
    },
  },
};
```

```json
// package.json
{
  "name": "eslint-plugin-my-org",
  "main": "./src/index.js",
  "peerDependencies": {
    "eslint": ">=8.0.0"
  }
}
```

---

## 13. Common Custom Rule Examples

### Disallow `console.log` (allow `console.error`)

```js
create(context) {
  return {
    'CallExpression[callee.object.name="console"][callee.property.name="log"]'(node) {
      context.report({ node, messageId: 'noConsoleLog' });
    },
  };
},
```

### Enforce consistent import order

```js
create(context) {
  let lastImportLine = 0;
  return {
    ImportDeclaration(node) {
      if (node.loc.start.line < lastImportLine) {
        context.report({ node, messageId: 'wrongOrder' });
      }
      lastImportLine = node.loc.start.line;
    },
  };
},
```

### Require a file header comment

```js
create(context) {
  return {
    Program(node) {
      const sourceCode = context.sourceCode;
      const comments = sourceCode.getAllComments();
      const hasHeader = comments.some(
        (c) => c.type === 'Block' && c.value.includes('@copyright')
      );
      if (!hasHeader) {
        context.report({ node, messageId: 'missingHeader' });
      }
    },
  };
},
```

### Enforce max function parameters with a fixer hint

```js
create(context) {
  const max = context.options[0]?.max ?? 3;
  return {
    ':function'(node) {
      if (node.params.length > max) {
        context.report({
          node,
          messageId: 'tooManyParams',
          data: { count: node.params.length, max },
        });
      }
    },
  };
},
```

---

## 14. Quick Reference

| Task               | API / Approach                                                 |
| ------------------ | -------------------------------------------------------------- |
| Explore AST nodes  | [astexplorer.net](https://astexplorer.net)                     |
| Match node type    | `Identifier(node) {}`                                          |
| Match on exit      | `'FunctionDeclaration:exit'(node) {}`                          |
| CSS-style selector | `'CallExpression[callee.name="foo"]'`                          |
| Report error       | `context.report({ node, messageId })`                          |
| Auto-fix           | `fix(fixer) { return fixer.replaceText(...) }`                 |
| Get source text    | `context.sourceCode.getText(node)`                             |
| Get tokens         | `context.sourceCode.getTokens(node)`                           |
| Rule options       | `context.options[0]`                                           |
| Test rules         | `RuleTester` from `eslint` or `@typescript-eslint/rule-tester` |
| Use rule locally   | `plugins: { local: { rules: { 'my-rule': rule } } }`           |
| Publish as plugin  | `eslint-plugin-<name>` with `rules` export                     |
