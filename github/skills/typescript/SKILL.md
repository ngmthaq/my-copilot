---
name: typescript
description: "Unified TypeScript skill index — covers basic types, advanced types, generics, utility types, interfaces vs type aliases, type inference, type safety, error handling, object-oriented patterns, decorators, modules & namespaces, tsconfig configuration, and coding conventions. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# TypeScript Skill Index

## Sub-Skills Reference

| Domain               | File                                             | When to use                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Basic Types          | [basic-types.md](basic-types.md)                 | Annotating variables and functions; choosing between type options; understanding TS type basics. DO NOT USE FOR advanced types like mapped/conditional or generics.                                                                |
| Advanced Types       | [advanced-types.md](advanced-types.md)           | Building complex type-level logic; creating type-safe utilities; narrowing types at runtime. DO NOT USE FOR basic type annotations, generics basics, or utility types.                                                             |
| Generics             | [generics.md](generics.md)                       | Writing reusable typed code; constraining generic parameters; building typed abstractions. DO NOT USE FOR basic types or advanced type-level logic.                                                                                |
| Utility Types        | [utility-types.md](utility-types.md)             | Transforming existing types; building DTOs from models; creating type-safe helpers. DO NOT USE FOR basic type syntax or conditional/mapped type internals.                                                                         |
| Interfaces vs Types  | [interfaces-vs-types.md](interfaces-vs-types.md) | Choosing between interface and type; understanding declaration merging; designing public APIs. DO NOT USE FOR basic types or advanced type manipulation.                                                                           |
| Type Inference       | [type-inference.md](type-inference.md)           | Understanding what TS infers automatically; debugging unexpected inferred types; optimizing type annotations. DO NOT USE FOR explicit type annotations or type narrowing guards.                                                   |
| Type Safety          | [type-safety.md](type-safety.md)                 | Hardening code against type errors; eliminating any; adding runtime validation; making impossible states unrepresentable. DO NOT USE FOR basic types or tsconfig strict options.                                                   |
| Error Handling       | [error-handling.md](error-handling.md)           | Designing error handling strategies; creating typed error hierarchies; implementing Result types; validating input with Zod. DO NOT USE FOR Express error middleware or JS error basics.                                           |
| Object-Oriented      | [object-oriented.md](object-oriented.md)         | Designing typed class hierarchies; implementing design patterns in TS; using abstract classes or interfaces for contracts; leveraging generics in OOP. DO NOT USE FOR basic TS types, generics deep-dive, or JS OOP without types. |
| Decorators           | [decorators.md](decorators.md)                   | Using NestJS or similar frameworks; implementing cross-cutting concerns; understanding decorator patterns. DO NOT USE FOR general OOP or class basics.                                                                             |
| Modules & Namespaces | [modules-namespaces.md](modules-namespaces.md)   | Typing modules; writing declaration files; augmenting third-party types; migrating from namespaces to modules. DO NOT USE FOR JS module basics or tsconfig module settings.                                                        |
| Config / tsconfig    | [config-tsconfig.md](config-tsconfig.md)         | Setting up a TS project; configuring compiler options; fixing module resolution; setting up path aliases. DO NOT USE FOR ESLint/Prettier config or build tool config.                                                              |
| Convention           | [convention.md](convention.md)                   | Setting up project standards; reviewing code style; onboarding developers to TS conventions. DO NOT USE FOR tsconfig setup or ESLint rules.                                                                                        |

---

## Quick Decision Guide

```
What is your goal?
│
├── I need to annotate a variable, function, or understand primitive/union types
│   └── → basic-types.md
│
├── I need to write reusable code that works across multiple types
│   └── → generics.md
│
├── I'm using Partial, Pick, Omit, Record, ReturnType, etc.
│   └── → utility-types.md
│
├── I need conditional types, mapped types, infer, or branded types
│   └── → advanced-types.md
│
├── I need to decide between `interface` and `type`
│   └── → interfaces-vs-types.md
│
├── I want to understand or debug what TypeScript is inferring
│   └── → type-inference.md
│
├── I want to make code safer — remove `any`, validate input, exhaustive checks
│   └── → type-safety.md
│
├── I need to design error hierarchies, Result types, or typed error handling
│   └── → error-handling.md
│
├── I'm designing classes, abstract classes, mixins, or applying SOLID/patterns
│   └── → object-oriented.md
│
├── I'm adding class/method/property decorators or using NestJS decorators
│   └── → decorators.md
│
├── I need .d.ts files, module augmentation, or ambient declarations
│   └── → modules-namespaces.md
│
├── I need to configure tsconfig.json — strict mode, module resolution, aliases
│   └── → config-tsconfig.md
│
└── I want to establish naming, file organization, or import conventions
    └── → convention.md
```

---

## How to Use

1. **Identify the goal** — use the Quick Decision Guide above to find the right sub-skill file.
2. **Load the sub-skill file** — read the relevant `.md` file in this folder (e.g., `generics.md`).
3. **Follow its patterns** — each file contains concrete code examples, best practices, and anti-patterns for that domain.
4. **Load multiple sub-skills** when the task spans several domains — for example, building a typed repository with generics + OOP + error handling requires reading `generics.md`, `object-oriented.md`, and `error-handling.md`.

> All sub-skill files are located relative to this file (e.g., `config-tsconfig.md`).
