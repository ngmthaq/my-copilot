---
name: cpp
description: "Unified C++ language skill index — covers coding conventions (naming, formatting, clang-format), core fundamentals (types, auto, references, constexpr), OOP (classes, inheritance, polymorphism, virtual, SOLID), templates (function/class templates, variadic, SFINAE, concepts), memory management (smart pointers, RAII, new/delete), move semantics (rvalue references, perfect forwarding, rule of five), STL containers & iterators, STL algorithms & ranges, error handling (exceptions, noexcept, std::expected), concurrency (std::thread, mutex, async, futures, atomics), build systems (CMake, Conan, vcpkg), testing (Google Test, Catch2, GMock), and modern C++ features (C++17/20/23). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# C++ Language Skill Index

## Sub-Skills Reference

| Domain                 | File                                               | When to use                                                                                                                           |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Convention             | [convention.md](convention.md)                     | Formatting or refactoring C++ code; reviewing for style consistency; applying naming conventions; configuring clang-format            |
| Core Fundamentals      | [core-fundamentals.md](core-fundamentals.md)       | Understanding C++ type system; auto type deduction; references vs pointers; constexpr; structured bindings; range-based for           |
| OOP                    | [oop.md](oop.md)                                   | Designing classes; inheritance hierarchies; polymorphism; virtual functions; abstract classes; SOLID principles; operator overloading |
| Templates              | [templates.md](templates.md)                       | Writing generic code; function/class templates; variadic templates; SFINAE; concepts (C++20); template specialization                 |
| Memory Management      | [memory-management.md](memory-management.md)       | Smart pointers (unique_ptr, shared_ptr, weak_ptr); RAII; new/delete; custom allocators; avoiding memory leaks                         |
| Move Semantics         | [move-semantics.md](move-semantics.md)             | Rvalue references; std::move; perfect forwarding; rule of five; move constructors; return value optimization                          |
| Containers & Iterators | [containers-iterators.md](containers-iterators.md) | STL containers (vector, map, set, unordered_map); iterators; choosing the right container; custom containers                          |
| STL Algorithms         | [stl-algorithms.md](stl-algorithms.md)             | STL algorithms (sort, find, transform); lambdas in algorithms; ranges (C++20); views; custom comparators                              |
| Error Handling         | [error-handling.md](error-handling.md)             | Exceptions; noexcept; exception safety guarantees; RAII cleanup; std::expected (C++23); std::optional for nullable values             |
| Concurrency            | [concurrency.md](concurrency.md)                   | std::thread; std::mutex; std::async; futures and promises; atomics; condition variables; std::jthread (C++20); thread safety          |
| Build System           | [build-system.md](build-system.md)                 | CMake configuration; compiler flags; Conan/vcpkg package management; static and shared libraries; cross-compilation                   |
| Testing                | [testing.md](testing.md)                           | Writing unit tests with Google Test or Catch2; mocking with GMock; test organization; code coverage; TDD in C++                       |
| Modern C++             | [modern-cpp.md](modern-cpp.md)                     | C++17/20/23 features; std::optional; std::variant; std::any; concepts; modules; coroutines; std::format; std::expected                |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need formatting, naming, include ordering, or clang-format config
│   └─▶ convention.md
│
├─ I need to understand C++ basics (types, auto, references, constexpr)
│   └─▶ core-fundamentals.md
│
├─ I need to design classes, inheritance, or use polymorphism
│   └─▶ oop.md
│
├─ I need to write generic/reusable code with templates or concepts
│   └─▶ templates.md
│
├─ I need smart pointers, RAII, or to fix memory issues
│   └─▶ memory-management.md
│
├─ I need to understand move semantics, std::move, or forwarding
│   └─▶ move-semantics.md
│
├─ I need to choose or use STL containers (vector, map, set, etc.)
│   └─▶ containers-iterators.md
│
├─ I need STL algorithms, lambdas, or ranges
│   └─▶ stl-algorithms.md
│
├─ I need exception handling, error propagation, or noexcept
│   └─▶ error-handling.md
│
├─ I need multi-threaded code (std::thread, mutex, async, atomics)
│   └─▶ concurrency.md
│
├─ I need to write CMakeLists.txt, manage dependencies, or configure builds
│   └─▶ build-system.md
│
├─ I need to write tests with Google Test, Catch2, or set up mocking
│   └─▶ testing.md
│
└─ I need modern C++ features (C++17/20/23, optional, variant, concepts)
    └─▶ modern-cpp.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file (e.g. `memory-management.md`) in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, implementing a thread-safe container requires both `concurrency.md` (threading) and `containers-iterators.md` (container patterns).

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `memory-management.md`).
