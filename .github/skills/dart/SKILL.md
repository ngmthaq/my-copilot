---
name: dart
description: "Unified Dart skill index — covers coding convention & Effective Dart, basic syntax, null safety, collections, functions, object-oriented programming, async/await, streams, error handling, packages & dependencies, and CLI development. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Dart Skill

## Overview

This file is the top-level entry point for all Dart-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains detailed patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                  | File                                                 | When to use                                                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convention              | [convention.md](convention.md)                       | Formatting or refactoring Dart code to match project style; reviewing for style consistency; applying naming conventions; organizing imports; checking Effective Dart compliance             |
| Basic Syntax            | [basic-syntax.md](basic-syntax.md)                   | Declaring variables with `var`, `final`, `const`; understanding types; using operators; writing control flow (if, for, while, switch); understanding comments and string interpolation       |
| Null Safety             | [null-safety.md](null-safety.md)                     | Writing null-safe code; using `?`, `!`, `??`, `?.`; working with nullable vs non-nullable types; using `late`; understanding sound null safety and migration from legacy code                |
| Collections             | [collections.md](collections.md)                     | Working with `List`, `Set`, `Map`, and `Iterable`; using spread operators and collection-if/for; transforming collections with `map`, `where`, `fold`; understanding growable vs fixed       |
| Functions               | [functions.md](functions.md)                         | Defining named, anonymous, and arrow functions; using positional, named, and optional parameters; writing closures; passing functions as arguments; using typedef and higher-order functions |
| OOP                     | [oop.md](oop.md)                                     | Defining classes with constructors; using inheritance and `super`; implementing interfaces; using mixins; writing abstract classes; applying generics; using factory constructors            |
| Async / Await           | [async-await.md](async-await.md)                     | Working with `Future`; writing `async`/`await` functions; chaining with `.then()`/`.catchError()`; running concurrent futures with `Future.wait`; understanding the Dart event loop          |
| Streams                 | [streams.md](streams.md)                             | Creating and consuming `Stream`; using `StreamController`; applying stream transformations; understanding single-subscription vs broadcast streams; using `async*` and `yield`               |
| Error Handling          | [error-handling.md](error-handling.md)               | Using `try`/`catch`/`finally`; catching specific types with `on`; defining custom `Exception` and `Error` classes; propagating errors; handling async errors in futures and streams          |
| Packages & Dependencies | [packages-dependencies.md](packages-dependencies.md) | Working with `pubspec.yaml`; adding, upgrading, and pinning dependencies; using `pub get`/`pub upgrade`; understanding `pub.dev`; creating exportable packages; using `dev_dependencies`     |
| CLI Development         | [cli-development.md](cli-development.md)             | Building Dart CLI tools; parsing arguments with `args`; reading stdin/stdout/stderr; working with files and directories; handling signals; packaging executables with `dart compile exe`     |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Format Dart code, check naming conventions, organize imports, or follow Effective Dart?
│   └── → convention.md
│
├── Declare a variable, write a loop, or understand basic Dart syntax?
│   └── → basic-syntax.md
│
├── Work with nullable or non-nullable types, ?, !, ??, late, or required?
│   └── → null-safety.md
│
├── Create or transform a List, Set, Map, or Iterable?
│   └── → collections.md
│
├── Define a function with named params, optional params, closures, or typedef?
│   └── → functions.md
│
├── Design a class, use inheritance, mixins, abstract classes, or generics?
│   └── → oop.md
│
├── Work with Future, async/await, concurrent operations, or the Dart event loop?
│   └── → async-await.md
│
├── Create, transform, or consume a Stream; use StreamController or yield*?
│   └── → streams.md
│
├── Handle exceptions, define custom errors, or handle async errors safely?
│   └── → error-handling.md
│
├── Add a package, configure pubspec.yaml, publish a package, or pin versions?
│   └── → packages-dependencies.md
│
└── Build a CLI tool, parse args, read files, compile an exe, or handle stdin?
    └── → cli-development.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file` (e.g., `null-safety.md`).
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, building a CLI file processor typically involves `cli-development.md` + `async-await.md` + `error-handling.md`.
