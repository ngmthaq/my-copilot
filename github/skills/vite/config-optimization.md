---
name: vite-config-optimization
description: "Vite config optimization — structuring vite.config.ts, using defineConfig, conditional config per environment, and common optimizations. Use when structuring or improving the Vite config file."
---

# Vite Config Optimization

## 1. Basic Structure with defineConfig

Always use `defineConfig` — it provides TypeScript autocompletion.

```typescript
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  resolve: {},
  server: {},
  build: {},
});
```

---

## 2. Mode-based Config (dev vs prod)

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [react()],
    build: {
      sourcemap: !isProd, // source maps in dev only
      minify: isProd ? "esbuild" : false,
    },
  };
});
```

---

## 3. Splitting Config into Multiple Files

For large configs, split into helpers:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { plugins } from "./vite/plugins";
import { resolve } from "./vite/resolve";
import { build } from "./vite/build";

export default defineConfig({
  plugins,
  resolve,
  build,
});
```

```typescript
// vite/plugins.ts
import react from "@vitejs/plugin-react";
export const plugins = [react()];
```

---

## 4. Optimize Dependencies (Pre-bundling)

Vite pre-bundles dependencies with esbuild. Control which packages are included:

```typescript
export default defineConfig({
  optimizeDeps: {
    // force pre-bundle these (useful for CJS packages)
    include: ["lodash-es", "axios"],
    // exclude from pre-bundling (e.g. linked local packages)
    exclude: ["my-local-lib"],
  },
});
```

---

## 5. Root & Base Path

```typescript
export default defineConfig({
  // project root (where index.html lives)
  root: "src",

  // public base URL — important when deploying to a subfolder
  base: "/my-app/",
});
```

---

## 6. Cache Directory

Vite caches pre-bundled deps in `node_modules/.vite`. Reset it if you hit stale module issues:

```bash
npx vite --force   # clears cache and restarts dev server
```

Or set a custom cache dir:

```typescript
export default defineConfig({
  cacheDir: ".vite-cache",
});
```
