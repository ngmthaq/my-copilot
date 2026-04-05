---
name: javascript-module-system
description: "JavaScript module system — ES Modules (import/export), CommonJS (require/module.exports), dynamic imports, module patterns, bundling concepts, and migration strategies. Use when: structuring code into modules; choosing between ESM and CJS; lazy-loading code; understanding module resolution. DO NOT USE FOR: specific bundler configs (Webpack/Vite); package management (npm/yarn)."
---

# JavaScript Module System

## 1. ES Modules (ESM)

```javascript
// Named exports
export const API_URL = "https://api.example.com";
export function fetchUser(id) {
  /* ... */
}
export class UserService {
  /* ... */
}

// Named imports
import { fetchUser, API_URL } from "./api.js";

// Rename on import/export
import { fetchUser as getUser } from "./api.js";
export { fetchUser as getUser };

// Default export (one per module)
export default class UserService {
  /* ... */
}
import UserService from "./user-service.js";

// Mixed
import UserService, { API_URL, fetchUser } from "./api.js";

// Namespace import
import * as api from "./api.js";
api.fetchUser(1);
api.API_URL;

// Re-export (barrel files)
// src/services/index.js
export { UserService } from "./user-service.js";
export { PostService } from "./post-service.js";
export { default as AuthService } from "./auth-service.js";
```

---

## 2. CommonJS (CJS)

```javascript
// Export
module.exports = { fetchUser, API_URL };
module.exports = UserService; // Single export
exports.fetchUser = fetchUser; // Named (shorthand)

// Import
const { fetchUser, API_URL } = require("./api");
const UserService = require("./user-service");

// Conditional require (CJS-only advantage)
if (process.env.NODE_ENV === "test") {
  const mock = require("./mock-api");
}
```

---

## 3. ESM vs CJS Differences

| Feature         | ESM                          | CJS                        |
| --------------- | ---------------------------- | -------------------------- |
| Syntax          | `import`/`export`            | `require`/`module.exports` |
| Loading         | Static (compile-time)        | Dynamic (runtime)          |
| Top-level await | Yes                          | No                         |
| Tree-shakeable  | Yes                          | No                         |
| `this` at top   | `undefined`                  | `module.exports`           |
| File extension  | `.mjs` or `"type": "module"` | `.cjs` or default in Node  |
| Circular deps   | Live bindings (works)        | Partial object (fragile)   |

```json
// package.json — enable ESM for whole project
{
  "type": "module"
}
```

---

## 4. Dynamic Imports

```javascript
// Lazy-load modules at runtime (returns Promise)
const module = await import("./heavy-feature.js");
module.default; // Default export
module.namedExport; // Named exports

// Conditional loading
if (user.isAdmin) {
  const { AdminPanel } = await import("./admin.js");
}

// Route-based code splitting (frameworks)
const routes = [
  { path: "/dashboard", component: () => import("./Dashboard.js") },
  { path: "/settings", component: () => import("./Settings.js") },
];

// Webpack magic comments
const Chart = await import(/* webpackChunkName: "chart" */ "./Chart.js");
```

---

## 5. Module Patterns

```javascript
// Barrel file — clean public API
// src/utils/index.js
export { formatDate, parseDate } from "./date.js";
export { formatCurrency } from "./currency.js";
export { validate } from "./validation.js";

// Import from barrel
import { formatDate, formatCurrency } from "./utils";

// Namespace pattern — group related exports
// src/validators.js
export const validators = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  required: (v) => v != null && v !== "",
  minLength: (min) => (v) => v.length >= min,
};

// Singleton via module (modules are cached after first import)
// src/config.js
class Config {
  constructor() {
    this.values = new Map();
  }
  set(key, val) {
    this.values.set(key, val);
  }
  get(key) {
    return this.values.get(key);
  }
}
export const config = new Config(); // Same instance everywhere
```

---

## 6. Module Resolution

```javascript
// Node.js resolution order:
// 1. Built-in modules (fs, path, http)
// 2. node_modules (walks up directory tree)
// 3. Relative paths (./file, ../file)

// package.json "exports" field (modern)
{
  "exports": {
    ".": "./src/index.js",
    "./utils": "./src/utils/index.js",
    "./package.json": "./package.json"
  }
}
// Controls what consumers can import:
// import { x } from "my-lib"       → ./src/index.js
// import { y } from "my-lib/utils" → ./src/utils/index.js

// Conditional exports
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  }
}
```

---

## 7. Circular Dependencies

```javascript
// ⚠️ CJS — partial exports at time of require
// a.js
const b = require("./b"); // b.value is undefined (b hasn't finished)
module.exports = { value: "A" };

// b.js
const a = require("./a"); // Gets partial exports of a
module.exports = { value: "B" };

// ✅ ESM — live bindings (works better)
// a.js
import { value as bValue } from "./b.js";
export const value = "A";
// bValue will resolve when b.js finishes

// ✅ Best fix: extract shared code into a third module
// shared.js — no circular dependency
export const shared = {
  /* ... */
};
```

---

## 8. CJS to ESM Migration

```javascript
// Step 1: Add "type": "module" to package.json

// Step 2: Rename files that must stay CJS to .cjs

// Step 3: Replace require/exports
// Before (CJS)
const fs = require("fs");
const { fetchUser } = require("./api");
module.exports = { processUser };

// After (ESM)
import fs from "fs";
import { fetchUser } from "./api.js"; // Note: .js extension required
export { processUser };

// Step 4: Replace __dirname/__filename (not available in ESM)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Step 5: Replace require.resolve
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const resolvedPath = require.resolve("some-package");
```

---

## 9. Best Practices

- **Use ESM** for new projects — it's the standard, tree-shakeable, and supports top-level await
- **One concern per module** — keep modules focused and small
- **Use barrel files** for clean public APIs, but avoid deep barrel nesting (hurts tree-shaking)
- **Use dynamic imports** for code splitting and lazy loading
- **Include file extensions** in ESM imports (`.js`) — Node.js requires them
- **Avoid circular dependencies** — extract shared code into separate modules
- **Use `exports` field** in package.json to control public API
- **Prefer named exports** over default exports — better refactoring, auto-import support
- **Don't mix CJS and ESM** in the same package without proper dual-package setup
