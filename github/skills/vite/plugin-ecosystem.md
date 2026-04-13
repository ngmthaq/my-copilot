---
name: vite-plugin-ecosystem
description: "Vite plugin ecosystem — official plugins (React, Vue), common community plugins (PWA, Icons, Inspect), and how to write a simple custom plugin. Use when adding or creating Vite plugins."
---

# Vite Plugin Ecosystem

## 1. How Plugins Work

Plugins are added to the `plugins` array in `vite.config.ts`. They hook into Vite's build pipeline (which is based on Rollup).

```typescript
export default defineConfig({
  plugins: [pluginA(), pluginB()], // order matters
});
```

---

## 2. Official Plugins

### React

```bash
npm install -D @vitejs/plugin-react
```

```typescript
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()] });
```

### Vue

```bash
npm install -D @vitejs/plugin-vue
```

```typescript
import vue from "@vitejs/plugin-vue";
export default defineConfig({ plugins: [vue()] });
```

### Vue JSX

```bash
npm install -D @vitejs/plugin-vue-jsx
```

```typescript
import vueJsx from "@vitejs/plugin-vue-jsx";
export default defineConfig({ plugins: [vue(), vueJsx()] });
```

---

## 3. Common Community Plugins

| Plugin                     | Install                             | Purpose                              |
| -------------------------- | ----------------------------------- | ------------------------------------ |
| `vite-plugin-svgr`         | `npm i -D vite-plugin-svgr`         | Import SVGs as React components      |
| `vite-tsconfig-paths`      | `npm i -D vite-tsconfig-paths`      | Auto-read aliases from tsconfig.json |
| `vite-plugin-pwa`          | `npm i -D vite-plugin-pwa`          | Add PWA / service worker support     |
| `unplugin-icons`           | `npm i -D unplugin-icons`           | Use 100k+ icons as components        |
| `vite-plugin-inspect`      | `npm i -D vite-plugin-inspect`      | Debug plugin transformations         |
| `rollup-plugin-visualizer` | `npm i -D rollup-plugin-visualizer` | Bundle size treemap                  |
| `@vitejs/plugin-basic-ssl` | `npm i -D @vitejs/plugin-basic-ssl` | HTTPS in dev with self-signed cert   |

---

## 4. Example: PWA Plugin

```typescript
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My App",
        short_name: "App",
        theme_color: "#ffffff",
      },
    }),
  ],
});
```

---

## 5. Writing a Simple Custom Plugin

A Vite plugin is a plain object with hook functions:

```typescript
// vite-plugin-hello.ts
import type { Plugin } from "vite";

export function helloPlugin(): Plugin {
  return {
    name: "vite-plugin-hello", // required, unique name

    // called once when Vite starts
    buildStart() {
      console.log("Build started!");
    },

    // transform a file's content
    transform(code, id) {
      if (!id.endsWith(".ts")) return; // only process .ts files
      // inject something at the top of every TS file
      return `/* processed by hello-plugin */\n${code}`;
    },

    // resolve a custom module id
    resolveId(id) {
      if (id === "virtual:config") return "\0virtual:config";
    },

    load(id) {
      if (id === "\0virtual:config") {
        return `export const version = '${process.env.npm_package_version}';`;
      }
    },
  };
}
```

```typescript
// vite.config.ts
import { helloPlugin } from "./vite-plugin-hello";
export default defineConfig({ plugins: [helloPlugin()] });
```

---

## 6. Plugin Application Order

```typescript
export function myPlugin(): Plugin {
  return {
    name: "my-plugin",
    enforce: "pre", // run before other plugins (default: normal order)
    // enforce: 'post' // run after other plugins
    apply: "build", // 'build' | 'serve' | omit for both
  };
}
```
