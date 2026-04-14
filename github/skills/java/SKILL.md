---
name: java
description: "Unified Java skill index — covers coding conventions, core fundamentals (types, operators, control flow), object-oriented programming, generics, collections framework, streams & lambdas, concurrency (threads, ExecutorService, CompletableFuture), error handling, file I/O & serialization, build systems (Maven, Gradle), testing (JUnit, Mockito), and modern Java features (records, sealed classes, pattern matching, virtual threads). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Java Skill Index

## Sub-Skills Reference

| Domain            | File                                         | When to use                                                                                                                                                        |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Convention        | [convention.md](convention.md)               | Formatting or refactoring Java code; reviewing for style consistency; applying naming conventions; organizing imports; setting up Checkstyle or Google Java Format |
| Core Fundamentals | [core-fundamentals.md](core-fundamentals.md) | Explaining Java type system; primitives vs wrappers; operators; control flow; scope; string operations. DO NOT USE FOR: OOP design or generics                     |
| OOP               | [oop.md](oop.md)                             | Designing classes and interfaces; inheritance; composition; abstract classes; design patterns; SOLID principles. DO NOT USE FOR: generics or collections           |
| Generics          | [generics.md](generics.md)                   | Writing type-safe reusable code; bounded types; wildcards; type erasure; generic methods and classes. DO NOT USE FOR: collections usage or streams                 |
| Collections       | [collections.md](collections.md)             | Using List, Set, Map, Queue; choosing the right collection; iteration patterns; Collections utility class. DO NOT USE FOR: Stream API or generics internals        |
| Streams & Lambdas | [streams-lambdas.md](streams-lambdas.md)     | Functional-style operations on collections; lambda expressions; method references; functional interfaces; Optional. DO NOT USE FOR: concurrency or basic loops     |
| Concurrency       | [concurrency.md](concurrency.md)             | Multi-threading; ExecutorService; CompletableFuture; synchronization; concurrent collections; virtual threads. DO NOT USE FOR: streams or basic control flow       |
| Error Handling    | [error-handling.md](error-handling.md)       | Exception handling; checked vs unchecked exceptions; custom exceptions; try-with-resources; exception chaining. DO NOT USE FOR: basic control flow                 |
| File I/O          | [file-io.md](file-io.md)                     | Reading/writing files; NIO.2 Path and Files; serialization; JSON handling; buffered I/O; resource management. DO NOT USE FOR: error handling basics                |
| Build System      | [build-system.md](build-system.md)           | Maven or Gradle setup; dependency management; project structure; build lifecycle; plugins; multi-module projects. DO NOT USE FOR: IDE configuration                |
| Testing           | [testing.md](testing.md)                     | Writing tests with JUnit 5; Mockito mocking; assertions; parameterized tests; test organization; coverage. DO NOT USE FOR: build system configuration              |
| Modern Java       | [modern-java.md](modern-java.md)             | Records; sealed classes; pattern matching; text blocks; switch expressions; virtual threads; var keyword. DO NOT USE FOR: basic OOP or pre-Java-14 features        |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need formatting, naming, import ordering, or linter config
│   └─▶ convention.md
│
├─ I need to understand Java basics (types, primitives, scope, strings)
│   └─▶ core-fundamentals.md
│
├─ I need to design classes, interfaces, or apply design patterns
│   └─▶ oop.md
│
├─ I need type-safe reusable APIs with bounded types or wildcards
│   └─▶ generics.md
│
├─ I need to work with List, Set, Map, Queue, or choose a collection
│   └─▶ collections.md
│
├─ I need functional-style operations (streams, lambdas, Optional)
│   └─▶ streams-lambdas.md
│
├─ I need multi-threading, ExecutorService, or CompletableFuture
│   └─▶ concurrency.md
│
├─ I need exception handling, custom exceptions, or try-with-resources
│   └─▶ error-handling.md
│
├─ I need to read/write files, use NIO.2, or handle serialization
│   └─▶ file-io.md
│
├─ I need Maven or Gradle setup, dependency management, or build config
│   └─▶ build-system.md
│
├─ I need to write tests with JUnit 5, use Mockito, or parameterized tests
│   └─▶ testing.md
│
└─ I need modern Java features (records, sealed classes, pattern matching)
    └─▶ modern-java.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file (e.g. `concurrency.md`) in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, building a concurrent file processor requires both `concurrency.md` (threading) and `file-io.md` (NIO).

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `collections.md`).
