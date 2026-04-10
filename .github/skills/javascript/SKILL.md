---
name: javascript
description: "Unified JavaScript skill index — covers core fundamentals, ES6+ modern syntax, async programming, the event loop, DOM manipulation, browser APIs, error handling, functional programming, OOP, and the module system. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# JavaScript Skill Index

## Sub-Skills Reference

| Domain                 | File                                                   | When to use                                                                                                                                        |
| ---------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convention             | [convention.md](convention.md)                         | Formatting or refactoring JS/TS code; reviewing for style consistency; setting up Prettier/ESLint; applying naming conventions; organizing imports |
| Async Programming      | [async-programming.md](async-programming.md)           | Writing async code; handling API calls; managing concurrent operations; debugging async bugs                                                       |
| Browser APIs           | [browser-apis.md](browser-apis.md)                     | Making HTTP requests; using localStorage/sessionStorage; implementing observers; working with browser-specific APIs                                |
| Core Fundamentals      | [core-fundamentals.md](core-fundamentals.md)           | Explaining JS type system; debugging coercion bugs; understanding scope chains; working with closures; prototypal inheritance                      |
| DOM Manipulation       | [dom-manipulation.md](dom-manipulation.md)             | Manipulating the DOM; handling user events; building UI without a framework                                                                        |
| Error Handling         | [error-handling.md](error-handling.md)                 | Implementing error handling; creating custom error classes; debugging errors; setting up global error catchers                                     |
| ES6+ Features          | [es6-plus.md](es6-plus.md)                             | Writing modern JS; refactoring legacy code to ES6+; using destructuring or spread patterns                                                         |
| Event Loop             | [event-loop.md](event-loop.md)                         | Debugging async execution order; understanding why code runs in a certain sequence; performance tuning                                             |
| Functional Programming | [functional-programming.md](functional-programming.md) | Writing declarative code; composing functions; working with array transformations; implementing functional patterns                                |
| Module System          | [module-system.md](module-system.md)                   | Structuring code into modules; choosing between ESM and CJS; lazy-loading code; understanding module resolution                                    |
| Object-Oriented        | [object-oriented.md](object-oriented.md)               | Designing class hierarchies; implementing design patterns; choosing composition vs inheritance; encapsulating behavior                             |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need formatting, naming, import ordering, or Prettier/ESLint config
│   └─▶ convention.md
│
├─ I need to write or fix async code (Promises, async/await, fetch calls)
│   └─▶ async-programming.md
│
├─ I need to understand WHY async code runs in a certain order
│   └─▶ event-loop.md
│
├─ I need to use browser APIs (localStorage, Web Workers, Observers, Clipboard)
│   └─▶ browser-apis.md
│
├─ I need to select, modify, or listen to DOM elements
│   └─▶ dom-manipulation.md
│
├─ I need to handle or design error flows (try/catch, custom errors, global handlers)
│   └─▶ error-handling.md
│
├─ I want to use modern JS syntax (destructuring, optional chaining, generators)
│   └─▶ es6-plus.md
│
├─ I need to understand JS basics (types, coercion, closures, scope, `this`)
│   └─▶ core-fundamentals.md
│
├─ I want to write in a functional style (pure functions, composition, currying)
│   └─▶ functional-programming.md
│
├─ I want to design classes, apply OOP patterns, or use composition
│   └─▶ object-oriented.md
│
└─ I need to structure code into modules (ESM vs CJS, dynamic imports, barrels)
    └─▶ module-system.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file (e.g. `async-programming.md`) in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, writing a browser fetch wrapper requires both `async-programming.md` (concurrency, AbortController) and `browser-apis.md` (Fetch API, Storage).

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `async-programming.md`), not by the old `../javascript-async-programming/SKILL.md` path.
