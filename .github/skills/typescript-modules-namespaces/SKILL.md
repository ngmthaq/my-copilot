---
name: typescript-modules-namespaces
description: "TypeScript modules and namespaces — ES module typing, declaration files (.d.ts), module augmentation, ambient declarations, namespace patterns, and triple-slash directives. Use when: typing modules; writing declaration files; augmenting third-party types; migrating from namespaces to modules. DO NOT USE FOR: JS module basics (use javascript-module-system); tsconfig module settings (use typescript-config-tsconfig)."
---

# TypeScript Modules & Namespaces

## 1. Module Typing Basics

```typescript
// TypeScript follows ES module syntax — every file with import/export is a module

// Named exports with types
export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserRole = "admin" | "user" | "guest";

export function createUser(data: Omit<User, "id">): User {
  return { id: crypto.randomUUID(), ...data };
}

// Default export
export default class UserService {
  async findById(id: string): Promise<User | null> {
    /* ... */
  }
}

// Type-only exports (erased at compile time)
export type { User, UserRole };
export { type User, createUser };

// Type-only imports
import type { User, UserRole } from "./user";
import { type User, createUser } from "./user";
```

---

## 2. Declaration Files (.d.ts)

```typescript
// .d.ts files contain ONLY type information — no implementation

// types/user.d.ts
declare interface User {
  id: string;
  name: string;
  email: string;
}

// Declare a module's types (for untyped packages)
// types/untyped-lib.d.ts
declare module "untyped-lib" {
  export function doSomething(input: string): number;
  export interface Options {
    timeout: number;
    retries: number;
  }
  export default function init(opts: Options): void;
}

// Wildcard module declarations
declare module "*.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}
```

### Generating Declaration Files

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true, // Generate .d.ts files
    "declarationMap": true, // Source maps for .d.ts (Go to Definition)
    "declarationDir": "dist/types", // Output directory
    "emitDeclarationOnly": true, // Only emit .d.ts (for bundler builds)
  },
}
```

---

## 3. Module Augmentation

```typescript
// Extend existing module types without modifying the source

// Augment Express Request
declare module "express" {
  interface Request {
    user?: {
      id: string;
      role: "admin" | "user";
    };
    requestId: string;
  }
}

// Now TypeScript knows about req.user and req.requestId
app.get("/profile", (req, res) => {
  req.user?.id; // ✓ typed
  req.requestId; // ✓ typed
});

// Augment a local module
// original: src/config.ts exports interface Config
declare module "./config" {
  interface Config {
    newFeatureFlag: boolean;
  }
}

// Augment global scope
declare global {
  interface Window {
    analytics: {
      track(event: string, data?: Record<string, unknown>): void;
    };
  }

  // Add to globalThis (Node.js)
  var __DEV__: boolean;
}

export {}; // Required to make this a module
```

---

## 4. Ambient Declarations

```typescript
// Declare types for things that exist at runtime but TS doesn't know about

// Global variables
declare const __VERSION__: string;
declare const __DEV__: boolean;
declare const process: {
  env: Record<string, string | undefined>;
};

// Global functions
declare function gtag(command: string, ...args: unknown[]): void;

// Global classes
declare class Analytics {
  static init(key: string): void;
  static track(event: string): void;
}

// Environment variables (type-safe .env)
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}
```

---

## 5. Namespaces (Legacy)

```typescript
// Namespaces — TS-specific, mostly legacy. Prefer ES modules.

namespace Validation {
  export interface Rule {
    validate(value: unknown): boolean;
    message: string;
  }

  export class RequiredRule implements Rule {
    message = "Field is required";
    validate(value: unknown): boolean {
      return value != null && value !== "";
    }
  }

  export class MinLengthRule implements Rule {
    constructor(private min: number) {
      this.message = `Minimum length is ${min}`;
    }
    validate(value: unknown): boolean {
      return typeof value === "string" && value.length >= this.min;
    }
  }
}

// Usage
const rule: Validation.Rule = new Validation.RequiredRule();

// Nested namespaces
namespace App {
  export namespace Models {
    export interface User {
      id: string;
      name: string;
    }
  }
  export namespace Services {
    export function getUser(id: string): Models.User {
      /* ... */
    }
  }
}
```

### When Namespaces Are Still Used

```typescript
// 1. Declaration merging with enums
enum Color {
  Red,
  Green,
  Blue,
}
namespace Color {
  export function parse(str: string): Color {
    /* ... */
  }
}
Color.parse("red"); // Works alongside enum

// 2. Companion namespace for a class
class User {
  constructor(public name: string) {}
}
namespace User {
  export interface CreateInput {
    name: string;
    email: string;
  }
  export function create(input: CreateInput): User {
    return new User(input.name);
  }
}
User.create({ name: "Alice", email: "alice@test.com" });

// 3. Global type organization in .d.ts files
declare namespace API {
  interface Response<T> {
    data: T;
    meta: { total: number };
  }
  interface Error {
    code: string;
    message: string;
  }
}
```

---

## 6. Re-exporting & Barrel Files

```typescript
// src/modules/user/index.ts (barrel file)
export { UserService } from "./user.service";
export { UserRepository } from "./user.repository";
export type { User, CreateUserDto, UpdateUserDto } from "./user.types";

// Re-export with rename
export { UserService as default } from "./user.service";
export { createUser as makeUser } from "./user.factory";

// Re-export everything
export * from "./user.types";
export * as validators from "./user.validators";

// Consumers get clean imports
import { UserService, type User } from "@/modules/user";
```

---

## 7. Module Resolution & Path Mapping

```typescript
// package.json — control what consumers can import
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",   // TS looks here first
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./utils": {
      "types": "./dist/types/utils/index.d.ts",
      "import": "./dist/esm/utils/index.js"
    }
  },
  "typesVersions": {
    "*": {
      "utils": ["dist/types/utils/index.d.ts"]
    }
  }
}

// tsconfig.json — path aliases
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@modules/*": ["src/modules/*"]
    }
  }
}
```

---

## 8. Typing Third-Party Modules

```typescript
// Option 1: Install @types package
// npm install -D @types/express @types/lodash

// Option 2: Write your own .d.ts
// src/types/untyped-package.d.ts
declare module "untyped-package" {
  interface Config {
    apiKey: string;
    timeout?: number;
  }

  export function init(config: Config): void;
  export function query<T>(sql: string, params?: unknown[]): Promise<T[]>;
}

// Option 3: Quick escape hatch (avoid in production)
declare module "totally-untyped" {
  const mod: any;
  export default mod;
}

// Option 4: Augment incomplete types
// @types/some-lib has missing methods
declare module "some-lib" {
  interface Client {
    newMethod(param: string): Promise<void>; // Added
  }
}
```

---

## 9. Triple-Slash Directives (Rarely Needed)

```typescript
// Reference type declarations (in .d.ts files)
/// <reference types="node" />
/// <reference types="jest" />

// Reference another declaration file
/// <reference path="./custom-types.d.ts" />

// Specify lib
/// <reference lib="es2023" />
/// <reference lib="dom" />

// When to use:
// - Global .d.ts files that aren't modules
// - When tsconfig include/lib isn't enough
// - Legacy codebases
// Prefer tsconfig "types" and "lib" over triple-slash directives
```

---

## 10. Best Practices

- **Use ES modules** — namespaces are legacy, modules are the standard
- **Use `type` imports** — `import type { X }` prevents runtime import of types
- **Write `.d.ts` files** for untyped packages instead of using `any`
- **Use module augmentation** to extend third-party types cleanly
- **Use barrel files sparingly** — deep re-exports hurt tree-shaking
- **Use `exports` in package.json** for libraries — control the public API
- **Use `declaration: true`** in tsconfig for libraries
- **Declare environment variables** in a `env.d.ts` file
- **Prefer `@types/*`** packages over hand-written declarations
- **Use namespaces only** for declaration merging with enums/classes or in `.d.ts` files
