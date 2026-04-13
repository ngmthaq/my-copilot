# Electron Forge — Configuration

## forge.config.ts Structure

```typescript
import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const config: ForgeConfig = {
  // Electron Packager options
  packagerConfig: {
    name: "My App",
    executableName: "my-app",
    appBundleId: "com.example.my-app",
    icon: "./resources/icon", // No extension — Forge adds per-platform
    asar: true,
    // See packaging.md for full options
  },

  // Native module rebuild options
  rebuildConfig: {},

  // Makers — create platform distributables
  makers: [
    new MakerSquirrel({
      setupIcon: "./resources/icon.ico",
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerDeb({
      options: {
        icon: "./resources/icon.png",
      },
    }),
    new MakerRpm({}),
  ],

  // Publishers — upload distributables
  publishers: [],

  // Plugins — extend the build pipeline
  plugins: [
    new VitePlugin({
      build: [
        { entry: "src/main.ts", config: "vite.main.config.ts" },
        { entry: "src/preload.ts", config: "vite.preload.config.ts" },
      ],
      renderer: [{ name: "main_window", config: "vite.renderer.config.ts" }],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],

  // Lifecycle hooks
  hooks: {},
};

export default config;
```

## packagerConfig Options

```typescript
packagerConfig: {
  // App identity
  name: "My App",                    // App name
  executableName: "my-app",          // Executable file name
  appBundleId: "com.example.myapp",  // macOS bundle ID
  appVersion: "1.0.0",               // Override package.json version
  buildVersion: "100",               // Build number (macOS CFBundleVersion)

  // Icons
  icon: "./resources/icon",          // No extension — auto-resolved per platform

  // ASAR
  asar: true,                        // Package app source into asar archive
  // asar: { unpack: "*.node" },     // Unpack native modules from asar

  // Platform-specific
  appCategoryType: "public.app-category.developer-tools", // macOS category

  // Extra resources (copied alongside asar, accessible at runtime)
  extraResource: ["./resources/data"],

  // Files to ignore during packaging
  ignore: [
    /\.git/,
    /\.vscode/,
    /node_modules\/.*\/(test|docs|\.md)/,
  ],

  // macOS signing (see code-signing.md)
  osxSign: {},
  osxNotarize: {},

  // Windows signing
  // windowsSign: {},

  // Protocols (deep linking)
  protocols: [
    {
      name: "My App Protocol",
      schemes: ["myapp"],
    },
  ],
},
```

## Environment-Specific Configuration

```typescript
import type { ForgeConfig } from "@electron-forge/shared-types";

const isProduction = process.env.NODE_ENV === "production";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: "./resources/icon",
    // Only sign in production builds
    ...(isProduction && {
      osxSign: {},
      osxNotarize: {
        appleId: process.env.APPLE_ID!,
        appleIdPassword: process.env.APPLE_PASSWORD!,
        teamId: process.env.APPLE_TEAM_ID!,
      },
    }),
  },
  // ... rest of config
};

export default config;
```

## Config File Formats

Forge supports multiple config formats (in order of priority):

| File                          | Format     | TypeScript Support |
| ----------------------------- | ---------- | ------------------ |
| `forge.config.ts`             | TypeScript | Yes (recommended)  |
| `forge.config.js`             | CommonJS   | No                 |
| `forge.config.cjs`            | CommonJS   | No                 |
| `package.json` `config.forge` | JSON       | No                 |

## Type-Checked Config

The TypeScript config provides full autocomplete:

```typescript
import type { ForgeConfig } from "@electron-forge/shared-types";

// All properties are typed — IDE will suggest valid options
const config: ForgeConfig = {
  // ...
};

export default config;
```

## Best Practices

1. **Use `forge.config.ts`** — TypeScript config gives autocomplete and catches errors
2. **Set `executableName`** — use lowercase kebab-case for the binary name
3. **Provide icons** — without extension; Forge picks `.icns` (macOS), `.ico` (Windows), `.png` (Linux)
4. **Enable ASAR** — packages source code into an archive for slight protection and faster reads
5. **Add Fuses plugin** — hardens security by disabling unneeded Electron features at binary level
6. **Use environment variables for secrets** — never hardcode signing credentials
7. **Separate platform makers** — only include makers for platforms you actually target
