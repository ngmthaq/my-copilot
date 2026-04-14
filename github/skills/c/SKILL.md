---
name: c
description: "Unified C language skill index — covers coding conventions (naming, formatting), core fundamentals (types, operators, control flow), pointers & memory management (malloc/free, memory safety), data structures (arrays, structs, unions, enums, linked lists), functions (function pointers, variadic), preprocessor (macros, conditional compilation), file I/O, error handling (return codes, errno), build systems (Make, CMake), concurrency (pthreads, synchronization), and testing (Unity, CMocka). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# C Language Skill Index

## Sub-Skills Reference

| Domain            | File                                         | When to use                                                                                                                                   |
| ----------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Convention        | [convention.md](convention.md)               | Formatting or refactoring C code; reviewing for style consistency; applying naming conventions; organizing includes; configuring clang-format |
| Core Fundamentals | [core-fundamentals.md](core-fundamentals.md) | Understanding C type system; debugging variable scope; working with operators and control flow; integer promotion and overflow                |
| Pointers & Memory | [pointers-memory.md](pointers-memory.md)     | Working with pointers; dynamic memory allocation (malloc/free); memory leaks; dangling pointers; pointer arithmetic; memory safety            |
| Data Structures   | [data-structures.md](data-structures.md)     | Working with arrays, strings, structs, unions, enums; implementing linked lists, stacks, queues, hash tables                                  |
| Functions         | [functions.md](functions.md)                 | Writing functions; function pointers; callbacks; variadic functions; inline functions; static functions                                       |
| Preprocessor      | [preprocessor.md](preprocessor.md)           | Writing macros; conditional compilation; include guards; pragma directives; predefined macros; X-macros                                       |
| File I/O          | [file-io.md](file-io.md)                     | Reading/writing files; binary I/O; buffered vs unbuffered I/O; stdio functions; file positioning                                              |
| Error Handling    | [error-handling.md](error-handling.md)       | Implementing error handling patterns; return codes; errno; perror; custom error types; cleanup with goto; setjmp/longjmp                      |
| Build System      | [build-system.md](build-system.md)           | Writing Makefiles; CMake configuration; compilation flags; linking; static and shared libraries; cross-compilation                            |
| Concurrency       | [concurrency.md](concurrency.md)             | Writing multi-threaded code with pthreads; mutexes; condition variables; atomic operations; thread safety; race conditions                    |
| Testing           | [testing.md](testing.md)                     | Writing unit tests with Unity or CMocka; test organization; mocking; code coverage; test-driven development in C                              |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need formatting, naming, include ordering, or clang-format config
│   └─▶ convention.md
│
├─ I need to understand C basics (types, scope, operators, control flow)
│   └─▶ core-fundamentals.md
│
├─ I need to work with pointers, malloc/free, or fix memory issues
│   └─▶ pointers-memory.md
│
├─ I need to work with arrays, structs, unions, enums, or linked lists
│   └─▶ data-structures.md
│
├─ I need to write functions, callbacks, or function pointers
│   └─▶ functions.md
│
├─ I need macros, conditional compilation, or include guards
│   └─▶ preprocessor.md
│
├─ I need to read/write files or handle binary I/O
│   └─▶ file-io.md
│
├─ I need error handling patterns (return codes, errno, goto cleanup)
│   └─▶ error-handling.md
│
├─ I need to write Makefiles, CMake, or configure compilation
│   └─▶ build-system.md
│
├─ I need multi-threaded code (pthreads, mutexes, atomics)
│   └─▶ concurrency.md
│
└─ I need to write tests with Unity, CMocka, or set up test infrastructure
    └─▶ testing.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file (e.g. `pointers-memory.md`) in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, implementing a dynamic array requires both `pointers-memory.md` (allocation) and `data-structures.md` (array patterns).

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `pointers-memory.md`).
