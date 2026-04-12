---
name: python
description: "Unified Python skill index — covers coding conventions (PEP 8), core fundamentals, data structures, functions & decorators, object-oriented programming, async programming, error handling, file I/O, module system & packaging, type hints, functional programming, and testing with pytest. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Python Skill Index

## Sub-Skills Reference

| Domain                 | File                                                   | When to use                                                                                                                                          |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convention             | [convention.md](convention.md)                         | Formatting or refactoring Python code; reviewing for PEP 8 consistency; setting up Black/Ruff/isort; applying naming conventions; organizing imports |
| Core Fundamentals      | [core-fundamentals.md](core-fundamentals.md)           | Explaining Python type system; debugging variable scope; understanding mutability; working with operators and control flow                           |
| Data Structures        | [data-structures.md](data-structures.md)               | Working with lists, dicts, sets, tuples; comprehensions; collections module; choosing the right data structure                                       |
| Functions & Decorators | [functions.md](functions.md)                           | Writing functions; using decorators; generators; lambda expressions; closures; \*args/\*\*kwargs                                                     |
| Object-Oriented        | [oop.md](oop.md)                                       | Designing classes; inheritance; dataclasses; abstract base classes; dunder methods; descriptors; metaclasses                                         |
| Async Programming      | [async-programming.md](async-programming.md)           | Writing asyncio code; coroutines; tasks; event loops; async context managers; aiohttp                                                                |
| Error Handling         | [error-handling.md](error-handling.md)                 | Implementing try/except; creating custom exceptions; exception chaining; context managers for cleanup                                                |
| File I/O               | [file-io.md](file-io.md)                               | Reading/writing files; pathlib; CSV/JSON/YAML handling; context managers; temporary files                                                            |
| Module System          | [module-system.md](module-system.md)                   | Structuring packages; import system; virtual environments; dependency management; publishing packages                                                |
| Type Hints             | [type-hints.md](type-hints.md)                         | Adding type annotations; using mypy; Protocol; TypeVar; generics; runtime type checking                                                              |
| Functional Programming | [functional-programming.md](functional-programming.md) | Using map/filter/reduce; itertools; functools; comprehensions; immutable patterns; higher-order functions                                            |
| Testing                | [testing.md](testing.md)                               | Writing tests with pytest; fixtures; mocking; parametrize; coverage; test organization                                                               |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need formatting, naming, import ordering, or linter config
│   └─▶ convention.md
│
├─ I need to understand Python basics (types, scope, mutability, operators)
│   └─▶ core-fundamentals.md
│
├─ I need to work with lists, dicts, sets, tuples, or comprehensions
│   └─▶ data-structures.md
│
├─ I need to write functions, decorators, generators, or lambdas
│   └─▶ functions.md
│
├─ I need to design classes, use inheritance, or dataclasses
│   └─▶ oop.md
│
├─ I need to write async code (asyncio, coroutines, tasks)
│   └─▶ async-programming.md
│
├─ I need to handle errors (try/except, custom exceptions, cleanup)
│   └─▶ error-handling.md
│
├─ I need to read/write files, parse JSON/CSV, or use pathlib
│   └─▶ file-io.md
│
├─ I need to structure packages, manage imports, or use virtual environments
│   └─▶ module-system.md
│
├─ I need type annotations, mypy, Protocol, or TypeVar
│   └─▶ type-hints.md
│
├─ I want to write in a functional style (map, filter, itertools, functools)
│   └─▶ functional-programming.md
│
└─ I need to write tests with pytest, use fixtures, or mock dependencies
    └─▶ testing.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file (e.g. `async-programming.md`) in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, writing a file parser requires both `file-io.md` (reading/pathlib) and `error-handling.md` (exception handling).

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `async-programming.md`).
