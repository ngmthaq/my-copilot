# Electron Forge — Vite Plugin

## Overview

The `@electron-forge/plugin-vite` provides Vite-based bundling for Electron apps. It manages separate Vite configs for the main process, preload scripts, and renderer processes, with HMR support in development.

## Installation

```bash
npm install --save-dev @electron-forge/plugin-vite
```

Already included if you scaffolded with the `vite-typescript` template.

## Plugin Configuration in forge.config.ts

```typescript
import { VitePlugin } from "@electron-forge/plugin-vite";

// In plugins array:
new VitePlugin({
  // Main process and preload builds
  build: [
    {
      entry: "src/main.ts",
      config: "vite.main.config.ts",
      target: "main", // Identifies this as the main process entry
    },
    {
      entry: "src/preload.ts",
      config: "vite.preload.config.ts",
      target: "preload", // Identifies this as a preload script
    },
  ],

  // Renderer processes
  renderer: [
    {
      name: "main_window",
      config: "vite.renderer.config.ts",
    },
  ],
}),
```

## Vite Main Process Config

```typescript
// vite.main.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      // Externalize Node.js built-ins and Electron
      external: ["electron"],
    },
  },
  resolve: {
    // Ensure .ts files resolve correctly
    extensions: [".ts", ".js", ".json"],
  },
});
```

## Vite Preload Config

```typescript
// vite.preload.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["electron"],
    },
  },
});
```

## Vite Renderer Config

```typescript
// vite.renderer.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // If using React

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src/renderer",
    },
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});
```

## Accessing Vite Dev Server URL in Main Process

During development, the Forge Vite plugin provides environment variables for the dev server URLs:

```typescript
// src/main.ts
import { BrowserWindow } from "electron";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    // ...
  });

  // MAIN_WINDOW_VITE_DEV_SERVER_URL is set by the Vite plugin in dev
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};
```

### TypeScript Declarations for Forge Vite Globals

```typescript
// src/env.d.ts (or vite-env.d.ts)
/// <reference types="vite/client" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
```

The naming pattern follows: `{RENDERER_NAME}_VITE_DEV_SERVER_URL` and `{RENDERER_NAME}_VITE_NAME` where `RENDERER_NAME` is the uppercased `name` from the renderer config.

## Multiple Renderer Windows

```typescript
// forge.config.ts — Vite plugin with multiple renderers
new VitePlugin({
  build: [
    { entry: "src/main.ts", config: "vite.main.config.ts" },
    { entry: "src/preload.ts", config: "vite.preload.config.ts" },
  ],
  renderer: [
    {
      name: "main_window",
      config: "vite.renderer.config.ts",
    },
    {
      name: "settings_window",
      config: "vite.settings.config.ts",
    },
  ],
}),
```

```typescript
// src/main.ts — loading different renderer windows
if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
} else {
  mainWindow.loadFile(
    path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  );
}

if (SETTINGS_WINDOW_VITE_DEV_SERVER_URL) {
  settingsWindow.loadURL(SETTINGS_WINDOW_VITE_DEV_SERVER_URL);
} else {
  settingsWindow.loadFile(
    path.join(__dirname, `../renderer/${SETTINGS_WINDOW_VITE_NAME}/index.html`),
  );
}
```

## Framework-Specific Setup

### React

```bash
npm install react react-dom
npm install -D @vitejs/plugin-react @types/react @types/react-dom
```

```typescript
// vite.renderer.config.ts
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()] });
```

### Vue

```bash
npm install vue
npm install -D @vitejs/plugin-vue
```

```typescript
// vite.renderer.config.ts
import vue from "@vitejs/plugin-vue";
export default defineConfig({ plugins: [vue()] });
```

### Svelte

```bash
npm install svelte
npm install -D @sveltejs/vite-plugin-svelte
```

```typescript
// vite.renderer.config.ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
export default defineConfig({ plugins: [svelte()] });
```

## Environment Variables in Renderer

```typescript
// vite.renderer.config.ts
export default defineConfig({
  define: {
    "import.meta.env.APP_VERSION": JSON.stringify(
      process.env.npm_package_version,
    ),
  },
});
```

## Best Practices

1. **Keep Vite configs separate** — use `vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`
2. **Externalize `electron`** — in main and preload configs, always externalize the electron module
3. **Declare Forge globals** — add TypeScript declarations for `VITE_DEV_SERVER_URL` and `VITE_NAME`
4. **Use path aliases** — configure `@` alias in renderer config for cleaner imports
5. **Don't mix configs** — main process config should not include frontend framework plugins
