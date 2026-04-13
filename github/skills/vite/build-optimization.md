---
name: vite-build-optimization
description: "Vite build optimization — output folder, minification, target browsers, asset inlining, source maps, and bundle analysis. Use when optimizing the production build output."
---

# Vite Build Optimization

## 1. Basic Build Config

```typescript
export default defineConfig({
  build: {
    outDir: "dist", // output folder (default: dist)
    emptyOutDir: true, // clear dist before each build
    sourcemap: false, // disable in production (set true for debugging)
    minify: "esbuild", // 'esbuild' (fast) | 'terser' (smaller) | false
  },
});
```

---

## 2. Browser Target

Control which browser features Vite can use in output. Narrower targets = more transforms = bigger output.

```typescript
build: {
  target: 'es2015',    // safe default for most browsers
  // or be explicit:
  target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
},
```

> Vite defaults to `modules` (browsers supporting native ESM). Use `es2015` if you need wider support.

---

## 3. Asset Inlining

Small assets are inlined as base64 by default (below 4 KB). Change the threshold:

```typescript
build: {
  assetsInlineLimit: 4096,   // in bytes. 0 = never inline
},
```

---

## 4. CSS Code Splitting

By default Vite extracts CSS into separate files per chunk. Disable to inline all CSS into JS:

```typescript
build: {
  cssCodeSplit: true,  // default: true
},
```

---

## 5. Large Chunk Warning

Vite warns when a chunk is over 500 KB. Raise or lower the threshold:

```typescript
build: {
  chunkSizeWarningLimit: 1000,  // in KB
},
```

Actively fix large chunks instead of raising the limit. See `code-splitting.md`.

---

## 6. Terser for Smaller Output

Terser produces smaller bundles than esbuild but is slower:

```bash
npm install -D terser
```

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,   // remove console.log in production
      drop_debugger: true,
    },
  },
},
```

---

## 7. Analyze Bundle Size

Use `rollup-plugin-visualizer` to see what's in your bundle:

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    visualizer({
      open: true, // auto-open report in browser after build
      gzipSize: true,
      filename: "dist/stats.html",
    }),
  ],
});
```

Run `npm run build` — a visual treemap of your bundle opens automatically.
