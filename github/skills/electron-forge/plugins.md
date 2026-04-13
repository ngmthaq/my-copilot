# Electron Forge — Plugins

## Overview

Plugins extend the Forge build pipeline. They can modify how the app is built, packaged, and run. Beyond the bundler plugins (Vite, Webpack), several other plugins address security, native modules, and code analysis.

## Fuses Plugin

Electron Fuses are compile-time flags that disable Electron features at the binary level. Once flipped, they cannot be re-enabled without replacing the binary.

```bash
npm install --save-dev @electron-forge/plugin-fuses @electron/fuses
```

```typescript
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

new FusesPlugin({
  version: FuseVersion.V1,
  [FuseV1Options.RunAsNode]: false,
  // Prevents: ELECTRON_RUN_AS_NODE=1 ./myapp script.js

  [FuseV1Options.EnableCookieEncryption]: true,
  // Encrypts cookies stored on disk

  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
  // Prevents: NODE_OPTIONS="--inspect" ./myapp

  [FuseV1Options.EnableNodeCliInspectArguments]: false,
  // Prevents: ./myapp --inspect

  [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
  // Validates ASAR archive integrity at startup

  [FuseV1Options.OnlyLoadAppFromAsar]: true,
  // Prevents loading app from plain files (must be in asar)

  [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,
  // Use browser-specific V8 snapshot (experimental)

  [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
  // Restrict file:// protocol privileges
}),
```

### Recommended Fuse Settings

| Fuse                                    | Recommended | Why                                       |
| --------------------------------------- | ----------- | ----------------------------------------- |
| `RunAsNode`                             | `false`     | Prevents using Electron binary as Node.js |
| `EnableCookieEncryption`                | `true`      | Protects stored cookies                   |
| `EnableNodeOptionsEnvironmentVariable`  | `false`     | Prevents Node.js debugging flags          |
| `EnableNodeCliInspectArguments`         | `false`     | Prevents `--inspect` debugging            |
| `EnableEmbeddedAsarIntegrityValidation` | `true`      | Validates packed app hasn't been tampered |
| `OnlyLoadAppFromAsar`                   | `true`      | Prevents loading unpacked source          |

## Auto-Unpack Natives Plugin

Automatically unpacks native `.node` modules from the ASAR archive (native modules can't be loaded from inside ASAR):

```bash
npm install --save-dev @electron-forge/plugin-auto-unpack-natives
```

```typescript
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";

new AutoUnpackNativesPlugin({}),
```

This is equivalent to setting `asar.unpack: "**/*.node"` in packagerConfig, but handles it automatically.

## Electronegativity Plugin

Runs security checks on your Electron app during the build:

```bash
npm install --save-dev @electron-forge/plugin-electronegativity
```

```typescript
import { ElectronegativityPlugin } from "@electron-forge/plugin-electronegativity";

new ElectronegativityPlugin({
  isSarif: true, // Output in SARIF format for CI integration
}),
```

Checks for common security misconfigurations like:

- `nodeIntegration: true`
- `contextIsolation: false`
- Missing CSP headers
- Insecure protocol handlers

## Local Electron Plugin

Use a custom-built Electron binary instead of the released version:

```bash
npm install --save-dev @electron-forge/plugin-local-electron
```

```typescript
import { LocalElectronPlugin } from "@electron-forge/plugin-local-electron";

new LocalElectronPlugin({
  electronPath: "/path/to/custom/electron",
}),
```

## Writing a Custom Plugin

```typescript
import { PluginBase } from "@electron-forge/plugin-base";
import type { ForgeHookFn } from "@electron-forge/shared-types";

class MyCustomPlugin extends PluginBase<{}> {
  name = "my-custom-plugin";

  getHooks(): { [key: string]: ForgeHookFn } {
    return {
      prePackage: async () => {
        console.log("Running custom pre-package logic...");
      },
      postMake: async (_config, makeResults) => {
        console.log(
          "Built artifacts:",
          makeResults.map((r) => r.artifacts),
        );
      },
    };
  }
}
```

## Plugin Order

Plugins are applied in the order they appear in the `plugins` array. Place them in this order:

```typescript
plugins: [
  // 1. Bundler plugin (Vite or Webpack)
  new VitePlugin({ /* ... */ }),

  // 2. Native modules handling
  new AutoUnpackNativesPlugin({}),

  // 3. Security hardening
  new FusesPlugin({ /* ... */ }),

  // 4. Security analysis (optional)
  new ElectronegativityPlugin({}),
],
```

## Best Practices

1. **Always include FusesPlugin** — essential for production security
2. **Use AutoUnpackNativesPlugin** — if your app uses any native `.node` modules
3. **Run Electronegativity** — catches security issues during build rather than in production
4. **Keep plugins ordered** — bundler first, then native handling, then security
5. **Enable strict fuses** — use the recommended settings table as a starting point
