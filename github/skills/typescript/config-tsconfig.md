---
name: typescript-config-tsconfig
description: "TypeScript tsconfig.json configuration — compiler options, strict mode, module resolution, path aliases, project references, and common presets for Node.js, React, and library projects. Use when: setting up a TS project; configuring compiler options; fixing module resolution; setting up path aliases. DO NOT USE FOR: ESLint/Prettier config; build tool config (Webpack/Vite)."
---

# TypeScript tsconfig.json Configuration

## 1. Essential Structure

```jsonc
{
  "compilerOptions": {
    /* ... */
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"],
}
```

---

## 2. Strict Mode (Always Enable)

```jsonc
{
  "compilerOptions": {
    "strict": true,
    // Equivalent to enabling all of these:
    // "strictNullChecks": true,        — null/undefined are distinct types
    // "strictFunctionTypes": true,     — strict function parameter checking
    // "strictBindCallApply": true,     — strict bind/call/apply
    // "strictPropertyInitialization": true, — class properties must be initialized
    // "noImplicitAny": true,           — error on implicit any
    // "noImplicitThis": true,          — error on implicit this
    // "alwaysStrict": true,            — emit "use strict"
    // "useUnknownInCatchVariables": true — catch variables are unknown
  },
}
```

---

## 3. Recommended Additional Checks

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true, // arr[0] is T | undefined
    "noUnusedLocals": true, // Error on unused variables
    "noUnusedParameters": true, // Error on unused params
    "exactOptionalPropertyTypes": true, // Distinguish missing vs undefined
    "noFallthroughCasesInSwitch": true, // Require break in switch
    "forceConsistentCasingInFileNames": true, // Prevent case-sensitivity bugs
    "noImplicitReturns": true, // All code paths must return
    "noImplicitOverride": true, // Require override keyword
  },
}
```

---

## 4. Module & Resolution

```jsonc
{
  "compilerOptions": {
    // Module system
    "module": "NodeNext", // or "ESNext" for bundlers
    "moduleResolution": "NodeNext", // or "Bundler" for Vite/Webpack

    // Module interop
    "esModuleInterop": true, // import fs from "fs" (vs import * as fs)
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true, // import data from "./data.json"
    "isolatedModules": true, // Required for esbuild/swc/Vite

    // Output
    "target": "ES2022", // JS output version
    "lib": ["ES2023"], // Available APIs
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true, // Generate .d.ts files
    "declarationMap": true, // Source maps for declarations
    "sourceMap": true, // JS source maps
  },
}
```

### Module Resolution Comparison

| Setting    | Use for                   | File extensions | package.json field |
| ---------- | ------------------------- | --------------- | ------------------ |
| `NodeNext` | Node.js (ESM or CJS)      | Required (.js)  | `exports`          |
| `Bundler`  | Vite, Webpack, esbuild    | Optional        | `exports`          |
| `Node10`   | Legacy Node.js (CJS only) | Optional        | `main`             |

---

## 5. Path Aliases

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@utils/*": ["src/utils/*"],
      "@modules/*": ["src/modules/*"],
    },
  },
}
```

```typescript
// Before
import { UserService } from "../../../modules/user/user.service";

// After
import { UserService } from "@modules/user/user.service";
```

> **Note:** Path aliases are compile-time only. For runtime, configure your bundler or use `tsc-alias`/`tsconfig-paths`.

---

## 6. Common Presets

### Node.js API (ESM)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
}
```

### React (Vite/CRA)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
  },
  "include": ["src"],
}
```

### Library (Dual CJS/ESM)

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
  },
  "include": ["src"],
  "exclude": ["**/*.test.ts"],
}
```

---

## 7. Project References (Monorepo)

```jsonc
// tsconfig.json (root)
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ],
  "files": [] // Root config doesn't compile anything
}

// packages/api/tsconfig.json
{
  "compilerOptions": {
    "composite": true,    // Required for project references
    "outDir": "dist",
    "rootDir": "src"
  },
  "references": [
    { "path": "../shared" }
  ]
}
```

```bash
# Build all projects in dependency order
tsc --build
# or
tsc -b --watch
```

---

## 8. Extending Configs

```jsonc
// tsconfig.base.json — shared settings
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}

// tsconfig.json — extends base
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}

// Use community bases
// npm install -D @tsconfig/node20
{
  "extends": "@tsconfig/node20/tsconfig.json"
}
```

---

## 9. Key Options Reference

| Option             | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `strict`           | Enable all strict checks                         |
| `target`           | JS output version (ES2020, ES2022, ESNext)       |
| `module`           | Module system (NodeNext, ESNext, CommonJS)       |
| `moduleResolution` | How imports are resolved (NodeNext, Bundler)     |
| `lib`              | Available global APIs (ES2023, DOM)              |
| `outDir`           | Output directory for compiled JS                 |
| `declaration`      | Generate .d.ts type definition files             |
| `skipLibCheck`     | Skip checking node_modules .d.ts (faster builds) |
| `isolatedModules`  | Required for non-tsc transpilers (esbuild, swc)  |
| `noEmit`           | Type-check only, don't emit JS (for bundlers)    |
| `jsx`              | JSX handling (react-jsx, preserve)               |
| `composite`        | Enable for project references                    |
| `incremental`      | Cache compilation for faster rebuilds            |

---

## 10. Best Practices

- **Always enable `strict: true`** — it's the whole point of using TS
- **Use `noUncheckedIndexedAccess`** — prevents assuming array access is non-null
- **Use `skipLibCheck: true`** — dramatically speeds up compilation
- **Use `Bundler` resolution** for Vite/Webpack, `NodeNext` for Node.js
- **Enable `isolatedModules`** if using esbuild, swc, or Vite
- **Use `extends`** to share config across packages
- **Set `target` to match your runtime** — don't downlevel unnecessarily
- **Use project references** for monorepos — enables incremental builds
- **Use `paths`** for clean imports, but configure your runtime too
- **Keep `include` explicit** — don't accidentally compile test files into dist
