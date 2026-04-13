# Electron Forge — Webpack Plugin

## Overview

The `@electron-forge/plugin-webpack` provides Webpack bundling for Electron apps. It manages separate configs for main and renderer, with HMR and dev server support.

## Installation

```bash
npm install --save-dev @electron-forge/plugin-webpack
```

Already included if you scaffolded with the `webpack-typescript` template.

## Plugin Configuration in forge.config.ts

```typescript
import { WebpackPlugin } from "@electron-forge/plugin-webpack";

// In plugins array:
new WebpackPlugin({
  mainConfig: "./webpack.main.config.ts",
  devContentSecurityPolicy: "connect-src 'self' http://localhost:* ws://localhost:* 'unsafe-eval'",
  renderer: {
    config: "./webpack.renderer.config.ts",
    entryPoints: [
      {
        html: "./src/index.html",
        js: "./src/renderer.ts",
        name: "main_window",
        preload: {
          js: "./src/preload.ts",
        },
      },
    ],
  },
}),
```

## Webpack Main Config

```typescript
// webpack.main.config.ts
import type { Configuration } from "webpack";
import { rules } from "./webpack.rules";

export const mainConfig: Configuration = {
  entry: "./src/main.ts",
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".json"],
  },
  // Electron main process runs in Node.js
  target: "electron-main",
};

export default mainConfig;
```

## Webpack Renderer Config

```typescript
// webpack.renderer.config.ts
import type { Configuration } from "webpack";
import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

export const rendererConfig: Configuration = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
  // Renderer runs in a browser-like environment
  target: "web",
};

export default rendererConfig;
```

## Webpack Rules

```typescript
// webpack.rules.ts
import type { ModuleOptions } from "webpack";

export const rules: Required<ModuleOptions>["rules"] = [
  {
    test: /native_modules[/\\].+\.node$/,
    use: "node-loader",
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: "@vercel/webpack-asset-relocator-loader",
      options: {
        outputAssetBase: "native_modules",
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
      },
    },
  },
];
```

## Accessing Dev Server URL in Main Process

```typescript
// src/main.ts
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};
```

The naming pattern: `{ENTRY_NAME}_WEBPACK_ENTRY` and `{ENTRY_NAME}_PRELOAD_WEBPACK_ENTRY` where `ENTRY_NAME` is the uppercased `name` from entryPoints.

## Multiple Entry Points

```typescript
renderer: {
  config: "./webpack.renderer.config.ts",
  entryPoints: [
    {
      html: "./src/index.html",
      js: "./src/renderer.ts",
      name: "main_window",
      preload: { js: "./src/preload.ts" },
    },
    {
      html: "./src/settings.html",
      js: "./src/settings-renderer.ts",
      name: "settings_window",
      preload: { js: "./src/settings-preload.ts" },
    },
  ],
},
```

## Dev Content Security Policy

The Webpack plugin sets a CSP for the dev server. Customize it:

```typescript
new WebpackPlugin({
  devContentSecurityPolicy:
    "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; connect-src 'self' http://localhost:* ws://localhost:*",
  // ...
}),
```

## Best Practices

1. **Use `transpileOnly: true`** in ts-loader — type checking slows down Webpack; use `fork-ts-checker-webpack-plugin` separately
2. **Externalize native modules** — use `node-loader` for `.node` files
3. **Set correct targets** — `electron-main` for main, `web` for renderer
4. **Configure CSP for dev** — the default is restrictive; customize for your dev needs
5. **Consider migrating to Vite** — Vite plugin is faster for most projects
