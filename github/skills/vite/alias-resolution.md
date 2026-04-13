---
name: vite-alias-resolution
description: "Vite alias resolution — setting up @/ path aliases in vite.config.ts and syncing them with TypeScript's tsconfig.json. Use when configuring import aliases."
---

# Vite Alias Resolution

## 1. Define Aliases in vite.config.ts

```typescript
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Now you can import like this:

```typescript
import { Button } from "@/components/Button"; // → src/components/Button
import { useAuth } from "@/hooks/useAuth"; // → src/hooks/useAuth
```

---

## 2. Multiple Aliases

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@assets': path.resolve(__dirname, './src/assets'),
  },
},
```

---

## 3. Sync Aliases with TypeScript

Vite aliases are for the bundler. TypeScript needs `paths` in `tsconfig.json` to understand the same aliases.

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

> Both `vite.config.ts` and `tsconfig.json` must be updated — one without the other causes either bundler or editor errors.

---

## 4. Using vite-tsconfig-paths (Automatic Sync)

Avoid duplication by reading aliases directly from `tsconfig.json`:

```bash
npm install -D vite-tsconfig-paths
```

```typescript
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()], // reads paths from tsconfig.json automatically
});
```

With this plugin you only need to maintain `tsconfig.json` — no `resolve.alias` needed.

---

## 5. Using import.meta for ESM-compatible \_\_dirname

In ESM (`"type": "module"` in package.json), `__dirname` is not available. Use `import.meta.url` instead:

```typescript
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```
