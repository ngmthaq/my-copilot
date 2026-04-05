---
name: code-formatting-standards
description: "Enforce and apply consistent code formatting rules across TypeScript, JavaScript, React (JSX/TSX), Vue, NestJS, and Express projects. Use when: formatting code, reviewing code style, setting up Prettier/ESLint, applying naming conventions, organizing imports, enforcing indentation or line-length rules, standardizing brace style or quote style. DO NOT USE FOR: runtime logic errors, business logic implementation, framework-specific patterns unrelated to style."
---

# Code Formatting Standards

## When to Use

- Formatting or refactoring code to match project style
- Reviewing a PR or file for style consistency
- Setting up Prettier or ESLint configuration
- Applying naming conventions to variables, functions, classes, or files
- Organizing and sorting import statements
- Deciding indentation, quote style, semicolons, or trailing commas

---

## 1. General Formatting Rules

| Rule                       | Value                                                           |
| -------------------------- | --------------------------------------------------------------- |
| Indentation                | 2 spaces (no tabs)                                              |
| Max line length            | 120 characters                                                  |
| Quotes                     | Double quotes (`"`) everywhere — JS/TS, JSX/TSX attributes      |
| Semicolons                 | Required at end of statements                                   |
| Trailing commas            | `all` — in multi-line arrays, objects, parameters, and generics |
| Brace style                | Same line (`1tbs`)                                              |
| Arrow function parentheses | Always — `(x) => x` not `x => x`                                |
| Object spacing             | `{ key: value }` with spaces inside braces                      |
| End of file                | Single newline (`\n`)                                           |
| Line endings               | LF (`\n`)                                                       |

---

## 2. Prettier Configuration

Use `.prettierrc` at the project root:

```json
{
  "semi": true,
  "singleQuote": false,
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 3. Naming Conventions

### Variables & Functions

- Use `camelCase` for all variables, function names, and method names.
- Prefer descriptive names over abbreviations.
- Boolean variables should use `is`, `has`, `can`, `should` prefixes.

```ts
const isLoading = true;
const hasPermission = false;
function getUserById(id: string) { ... }
```

### Constants

- Use `UPPER_SNAKE_CASE` for module-level constants.

```ts
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;
const USER_ROLE = {
  ADMIN: "admin",
  EDITOR: "editor",
};
```

### Classes & Interfaces & Types

- Use `PascalCase` for classes, interfaces, type aliases, and enums.
- Do NOT prefix interfaces with `I`.

```ts
class UserService { ... }
interface UserProfile { ... }
type ApiResponse<T> = { data: T; error: string | null };
enum UserRole { Admin = "admin", Editor = "editor" }
```

### React Components

- Use `PascalCase` for component names and their files.

```
UserCard.tsx
DashboardLayout.tsx
```

### Vue Components

- Use `PascalCase` for Single File Component (SFC) names and files.

```
UserCard.vue
AppHeader.vue
```

### Files & Folders

| Context           | Convention                           | Example               |
| ----------------- | ------------------------------------ | --------------------- |
| React components  | `PascalCase.tsx`                     | `UserCard.tsx`        |
| Vue components    | `PascalCase.vue`                     | `UserCard.vue`        |
| Hooks (React)     | `camelCase.ts` starting with `use`   | `useAuth.ts`          |
| Composables (Vue) | `camelCase.ts` starting with `use`   | `useAuth.ts`          |
| Services / utils  | `camelCase.ts`                       | `userService.ts`      |
| NestJS modules    | `kebab-case.module.ts`               | `auth.module.ts`      |
| Express routers   | `kebab-case.router.ts`               | `user.router.ts`      |
| DTOs              | `PascalCase.dto.ts`                  | `CreateUserDto.ts`    |
| Test files        | Same name + `.spec.ts` or `.test.ts` | `userService.spec.ts` |

---

## 4. Import Organization

Order imports in this exact sequence, separated by blank lines:

1. Static/side-effect imports — CSS, fonts, polyfills (no bindings, e.g. `import "./styles.css"`)
2. Node.js built-ins (`path`, `fs`, `crypto`)
3. External packages (`express`, `react`, `@nestjs/core`)
4. Internal absolute paths (`@/modules/...`, `@/utils/...`)
5. Relative imports (`../services/user`, `./helpers`)
6. Type-only imports (always last within each group using `import type`)

```ts
import "./styles.css";
import "@/assets/fonts/inter.css";

import path from "path";

import express from "express";
import { Injectable } from "@nestjs/common";

import { AppConfig } from "@/config";
import { UserRepository } from "@/repositories/user";

import { hashPassword } from "../utils/crypto";
import { buildResponse } from "./helpers";

import type { CreateUserDto } from "./dto/create-user.dto";
```

Use `import type` for imports only needed at compile time.

---

## 5. TypeScript Specifics

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

## 6. Functions & Arrow Functions

- Prefer named function declarations for top-level functions.
- Prefer arrow functions for callbacks, array methods, and inline handlers.
- Keep functions small — single responsibility. If a function exceeds ~30 lines, consider splitting it.

```ts
// Top-level
function processOrder(order: Order): void { ... }

// Callback
const activeUsers = users.filter((user) => user.isActive);
```

---

## 7. Object & Array Formatting

Multi-line when 3 or more items; single-line for 1–2 short items:

```ts
// Single-line (short)
const point = { x: 1, y: 2 };

// Multi-line (3+ or long values)
const config = {
  host: "localhost",
  port: 5432,
  database: "mydb",
};

const roles = ["admin", "editor", "viewer"];
```

---

## 8. Comments & Documentation

- Use `//` for inline comments explaining _why_, not _what_.
- Use JSDoc `/** ... */` for exported functions, classes, and complex types.
- Do NOT leave commented-out dead code in committed files.

```ts
/**
 * Hashes a plain text password using bcrypt.
 * @param plainText - The raw password to hash
 * @returns The hashed password string
 */
export async function hashPassword(plainText: string): Promise<string> { ... }
```

---

## 9. EditorConfig

Include a `.editorconfig` at the project root:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## 10. ESLint Key Rules

Enforce these rules in `.eslintrc` / `eslint.config.mjs`:

```json
{
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
        "newlines-between": "always"
      }
    ]
  }
}
```

---

## Quick Checklist

Before committing, verify:

- [ ] Indentation is 2 spaces, no tabs
- [ ] Lines do not exceed 120 characters
- [ ] Double quotes used consistently everywhere
- [ ] Trailing commas on all multi-line structures
- [ ] Imports are ordered and grouped correctly
- [ ] No `any` types without justification
- [ ] Named exports preferred over default exports (except for pages/components)
- [ ] No leftover `console.log` or commented-out code
- [ ] File and folder names follow the convention for their context
