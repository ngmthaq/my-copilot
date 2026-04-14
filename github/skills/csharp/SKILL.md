---
name: csharp
description: "Unified C# skill index - covers coding conventions (.editorconfig, naming, project layout), core fundamentals (types, nullability, pattern matching), OOP and design, generics, collections and LINQ, async/concurrency (Task, async/await, cancellation), error handling, memory/performance, file I/O and serialization, build system (dotnet CLI, NuGet, MSBuild), testing (xUnit, NUnit, mocking), and modern C# features (records, required members, primary constructors). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# C# Skill Index

## Sub-Skills Reference

| Domain                     | File                                                 | When to use                                                                                            |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Convention                 | [convention.md](convention.md)                       | Formatting/refactoring C# code, naming consistency, .editorconfig setup, organizing solution structure |
| Core Fundamentals          | [core-fundamentals.md](core-fundamentals.md)         | Types, value vs reference behavior, nullability, control flow, pattern matching, structs/classes       |
| OOP                        | [oop.md](oop.md)                                     | Designing classes, interfaces, inheritance, composition, dependency inversion, domain modeling         |
| Generics                   | [generics.md](generics.md)                           | Generic APIs, constraints, variance, reusable abstractions, type-safe utilities                        |
| Collections and LINQ       | [collections-linq.md](collections-linq.md)           | Choosing collections, writing LINQ queries, avoiding multiple enumeration, query performance           |
| Async and Concurrency      | [async-concurrency.md](async-concurrency.md)         | async/await flows, Task coordination, cancellation, locking, channels, parallel workloads              |
| Error Handling             | [error-handling.md](error-handling.md)               | Exception design, guards/validation, resilient retry patterns, result types, logging failures          |
| Memory and Performance     | [memory-performance.md](memory-performance.md)       | Allocation reduction, Span/Memory, pooling, performance profiling, hot path optimization               |
| File I/O and Serialization | [file-io-serialization.md](file-io-serialization.md) | Reading/writing files, JSON handling, streams, UTF-8, serialization contracts                          |
| Build System               | [build-system.md](build-system.md)                   | dotnet CLI commands, project/solution organization, NuGet references, CI builds                        |
| Testing                    | [testing.md](testing.md)                             | Unit/integration tests with xUnit/NUnit/MSTest, mocking, fixtures, coverage strategy                   |
| Modern C#                  | [modern-csharp.md](modern-csharp.md)                 | Records, pattern matching enhancements, init/required, collection expressions, primary constructors    |

---

## Quick Decision Guide

```text
What is your goal?
|
|- I need naming, formatting, or .editorconfig conventions
|  -> convention.md
|
|- I need C# language basics (types, nullability, control flow)
|  -> core-fundamentals.md
|
|- I need classes/interfaces and object design guidance
|  -> oop.md
|
|- I need type-safe reusable APIs with generic constraints/variance
|  -> generics.md
|
|- I need collection choice or LINQ query guidance
|  -> collections-linq.md
|
|- I need async/await, Task orchestration, or thread-safety
|  -> async-concurrency.md
|
|- I need exception strategy and error propagation patterns
|  -> error-handling.md
|
|- I need to optimize allocations or throughput
|  -> memory-performance.md
|
|- I need file handling or JSON serialization patterns
|  -> file-io-serialization.md
|
|- I need dotnet build, restore, test, publish setup
|  -> build-system.md
|
|- I need unit/integration test guidance
|  -> testing.md
|
|- I need modern C# language features
   -> modern-csharp.md
```

---

## How to Use

1. Identify your immediate goal from the table or quick guide.
2. Load the matching sub-skill file before writing code.
3. Apply its patterns and avoid listed anti-patterns.
4. Combine multiple sub-skills for cross-cutting tasks (for example async API + error handling + testing).

> Sub-skill files are co-located in this folder and should be referenced by relative path.
