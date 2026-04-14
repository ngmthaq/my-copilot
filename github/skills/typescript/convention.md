---
name: typescript-convention
description: "TypeScript coding conventions — naming, file organization, type annotations, import ordering, error handling patterns, and code style guidelines. Use when: setting up project standards; reviewing code style; onboarding developers to TS conventions. DO NOT USE FOR: tsconfig setup (use typescript-config-tsconfig); ESLint rules (use eslint-rule-configuration)."
---

# TypeScript Conventions

> **Prerequisite:** Also load [javascript/convention.md](../javascript/convention.md) for base formatting, Prettier, naming, import organization, EditorConfig, and ESLint rules. This file covers TypeScript-specific conventions only.

## TypeScript-Specific Rules (from project standard)

- Always annotate function return types explicitly.
- Avoid `any`; prefer `unknown` and narrow the type.
- Prefer `interface` for object shapes; use `type` for unions, intersections, and aliases.
- Use `readonly` for properties that must not change after construction.
- Avoid non-null assertion (`!`) unless absolutely certain; prefer optional chaining (`?.`).
- Use strict mode (`"strict": true` in `tsconfig.json`).

```ts
// Good
function getUser(id: string): Promise<User | null> { ... }

// Avoid
function getUser(id: any): any { ... }
```

---

## 1. Naming Conventions

```typescript
// Variables and functions — camelCase
const userName = "Alice";
function getUserById(id: string): User {
  /* ... */
}
const handleClick = (e: MouseEvent) => {
  /* ... */
};

// Types, interfaces, classes, enums — PascalCase
type UserRole = "admin" | "user" | "guest";
interface UserRepository {
  findById(id: string): Promise<User>;
}
class UserService {
  /* ... */
}
enum Status {
  Active,
  Inactive,
}

// Constants — UPPER_SNAKE_CASE (only for true constants)
const MAX_RETRIES = 3;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_TIMEOUT_MS = 5000;

// Generics — descriptive or single uppercase
type Result<TData, TError> = { data: TData } | { error: TError };
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  /* ... */
}
// Common: T (type), K (key), V (value), E (error/element), R (return)

// Booleans — use is/has/can/should prefix
const isActive = true;
const hasPermission = user.role === "admin";
function canDelete(user: User, post: Post): boolean {
  /* ... */
}

// Private fields — no _ prefix (use # or access modifier)
class User {
  #password: string; // ✅ Runtime private
  private email: string; // ✅ TS private
  _legacy: string; // ❌ Avoid underscore convention
}
```

---

## 2. File & Folder Organization

```
src/
├── modules/
│   └── user/
│       ├── user.controller.ts   // Route handlers
│       ├── user.service.ts      // Business logic
│       ├── user.repository.ts   // Data access
│       ├── user.dto.ts          // DTOs and validation
│       ├── user.types.ts        // Module-specific types
│       └── user.test.ts         // Tests co-located
├── common/
│   ├── types/                   // Shared types
│   │   ├── index.ts
│   │   └── api.types.ts
│   ├── errors/                  // Error classes
│   ├── middleware/              // Shared middleware
│   └── utils/                  // Shared utilities
├── config/
│   └── index.ts
└── index.ts                    // Entry point
```

### File Naming

```
// kebab-case for files
user-service.ts       // ✅
user.service.ts       // ✅ (dotted convention)
UserService.ts        // ❌ Avoid PascalCase files
userService.ts        // ❌ Avoid camelCase files

// Suffixes to indicate purpose
user.controller.ts
user.service.ts
user.repository.ts
user.dto.ts
user.types.ts
user.test.ts
user.spec.ts
```

---

## 3. Type Annotation Rules

```typescript
// ✅ Let TS infer when obvious
const name = "Alice"; // string (inferred)
const count = items.length; // number (inferred)
const users = [alice, bob]; // User[] (inferred)

// ✅ Annotate function signatures
function getUser(id: string): Promise<User | null> {
  return db.users.findUnique({ where: { id } });
}

// ✅ Annotate when inference is wrong or unclear
const config: AppConfig = loadConfig();
const emptyArr: User[] = [];

// ❌ Don't over-annotate
const name: string = "Alice"; // Redundant
const result: number = add(1, 2); // Redundant
const users: User[] = getUsers(); // Redundant if getUsers returns User[]

// ✅ Annotate complex return types for documentation
function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
): PaginatedResponse<T> {
  return { items, total, page, totalPages: Math.ceil(total / 20) };
}
```

---

## 4. Import Organization

```typescript
// 1. Node.js built-ins
import { readFile } from "node:fs/promises";
import path from "node:path";

// 2. External packages
import express from "express";
import { z } from "zod";

// 3. Internal aliases (@/)
import { AppError } from "@/common/errors";
import { logger } from "@/common/utils/logger";

// 4. Relative imports
import { UserService } from "./user.service";
import { CreateUserDto } from "./user.dto";

// 5. Type-only imports (always use type keyword)
import type { Request, Response } from "express";
import type { User } from "./user.types";
```

### Import Rules

```typescript
// ✅ Use type-only imports for types
import type { User } from "./user.types";
import { type User, createUser } from "./user";

// ✅ Use barrel exports sparingly
export { UserService } from "./user.service";
export type { User, CreateUserDto } from "./user.types";

// ❌ Don't import from deep internal paths of packages
import { something } from "some-lib/dist/internal/thing";
```

---

## 5. Type Definitions

```typescript
// ✅ Prefer type aliases for unions, intersections, utilities
type UserId = string;
type Status = "active" | "inactive" | "pending";
type CreateUserInput = Omit<User, "id" | "createdAt">;

// ✅ Use interfaces for objects that may be extended
interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}

// ✅ Export types from a dedicated .types.ts file
// user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export type UserRole = "admin" | "user" | "guest";
export type CreateUserDto = Pick<User, "name" | "email" | "role">;
export type UpdateUserDto = Partial<CreateUserDto>;

// ❌ Don't use I prefix for interfaces
interface IUserService {} // ❌
interface UserService {} // ✅
```

---

## 6. Function Patterns

```typescript
// ✅ Use arrow functions for callbacks and short functions
const isActive = (user: User): boolean => user.status === "active";
const toDto = (user: User): UserDto => ({ id: user.id, name: user.name });

// ✅ Use function declarations for top-level functions
function createUserService(repo: UserRepository): UserService {
  return {
    /* ... */
  };
}

// ✅ Use object params for 3+ parameters
// ❌
function createUser(
  name: string,
  email: string,
  role: string,
  avatar?: string,
) {}
// ✅
function createUser(params: {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}): User {
  /* ... */
}

// ✅ Use overloads only when return type depends on input
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number) {
  return typeof input === "string" ? Number(input) : String(input);
}
```

---

## 7. Error Handling

```typescript
// ✅ Use typed custom errors
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ✅ Use unknown in catch blocks (default with strict)
try {
  await riskyOperation();
} catch (err: unknown) {
  if (err instanceof AppError) {
    logger.error(err.message, { code: err.code });
  } else if (err instanceof Error) {
    logger.error(err.message);
  } else {
    logger.error("Unknown error", { err });
  }
}

// ✅ Use Result type for expected failures
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

function parseConfig(raw: string): Result<Config> {
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}
```

---

## 8. Null Handling

```typescript
// ✅ Use optional chaining
const city = user?.address?.city;

// ✅ Use nullish coalescing
const port = config.port ?? 3000;

// ✅ Narrow before using
function getName(user: User | null): string {
  if (!user) return "Anonymous";
  return user.name;
}

// ❌ Avoid non-null assertions (!)
const el = document.getElementById("app")!; // Unsafe

// ✅ Prefer proper narrowing
const el = document.getElementById("app");
if (!el) throw new Error("Element #app not found");
el.textContent = "Hello"; // Safely narrowed
```

---

## 9. Enums vs Unions

```typescript
// ❌ Avoid enums in most cases
enum Role {
  Admin = "ADMIN",
  User = "USER",
}

// ✅ Prefer union of string literals
type Role = "admin" | "user" | "guest";

// ✅ Use const object when you need runtime values + type
const Role = {
  Admin: "admin",
  User: "user",
  Guest: "guest",
} as const;

type Role = (typeof Role)[keyof typeof Role];
// "admin" | "user" | "guest"
```

---

## 10. Best Practices Summary

- **Enable `strict: true`** — non-negotiable for any TS project
- **Use `type` imports** — `import type { X }` for types only
- **Avoid `any`** — use `unknown` and narrow, or specific types
- **Avoid `enum`** — use union literals or `as const` objects
- **No `I` prefix** on interfaces — it's a C# convention, not TS
- **Co-locate types** with the code that uses them
- **Use `readonly`** by default — mutate only when needed
- **Fail fast** — validate at boundaries (API input, config), trust internals
- **One export per concern** — don't mix unrelated things in one file
- **Use `satisfies`** to validate literal objects without widening
