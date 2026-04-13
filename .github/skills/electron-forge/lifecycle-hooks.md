# Electron Forge — Lifecycle Hooks

## Overview

Hooks let you run custom logic at specific stages of the Forge build pipeline. Define them in `forge.config.ts` under the `hooks` property.

## Available Hooks

| Hook                | When it runs                                 | Common uses                              |
| ------------------- | -------------------------------------------- | ---------------------------------------- |
| `generateAssets`    | Before `start`, `package`, `make`, `publish` | Generate files, compile resources        |
| `prePackage`        | Before packaging (after bundling)            | Validate, clean, copy assets             |
| `postPackage`       | After packaging                              | Sign binaries, verify output             |
| `packageAfterCopy`  | After source files are copied to package dir | Modify files in the packaged output      |
| `packageAfterPrune` | After pruning dev dependencies from package  | Add back specific files that were pruned |
| `preMake`           | Before creating distributables               | Validate, modify package before make     |
| `postMake`          | After creating distributables                | Upload, notify, generate checksums       |
| `readPackageJson`   | When Forge reads package.json                | Dynamically modify package.json values   |

## Hook Configuration

```typescript
// forge.config.ts
import type { ForgeConfig } from "@electron-forge/shared-types";

const config: ForgeConfig = {
  // ... packagerConfig, makers, etc.

  hooks: {
    generateAssets: async () => {
      console.log("Generating assets...");
      // Run before any build step
    },

    prePackage: async () => {
      console.log("Pre-package hook running...");
    },

    postPackage: async (_config, result) => {
      console.log(`Packaged to: ${result.outputPaths.join(", ")}`);
    },

    preMake: async () => {
      console.log("About to create distributables...");
    },

    postMake: async (_config, makeResults) => {
      for (const result of makeResults) {
        console.log(`Made: ${result.artifacts.join(", ")}`);
      }
      return makeResults;
    },

    readPackageJson: async (_config, packageJson) => {
      // Dynamically modify package.json before it's used
      packageJson.version = process.env.APP_VERSION || packageJson.version;
      return packageJson;
    },
  },
};

export default config;
```

## Hook Signatures

```typescript
hooks: {
  // No arguments
  generateAssets: async () => void;

  // No arguments
  prePackage: async () => void;

  // Receives the packaging result
  postPackage: async (
    forgeConfig: ResolvedForgeConfig,
    result: {
      outputPaths: string[];
      platform: string;
      arch: string;
    }
  ) => void;

  // Receives packaging dir, electronVersion, platform, arch
  packageAfterCopy: async (
    forgeConfig: ResolvedForgeConfig,
    buildPath: string,
    electronVersion: string,
    platform: string,
    arch: string
  ) => void;

  // Same as packageAfterCopy
  packageAfterPrune: async (
    forgeConfig: ResolvedForgeConfig,
    buildPath: string,
    electronVersion: string,
    platform: string,
    arch: string
  ) => void;

  // No arguments
  preMake: async () => void;

  // Receives make results, must return them (possibly modified)
  postMake: async (
    forgeConfig: ResolvedForgeConfig,
    makeResults: MakeResult[]
  ) => MakeResult[];

  // Receives package.json, must return it
  readPackageJson: async (
    forgeConfig: ResolvedForgeConfig,
    packageJson: Record<string, unknown>
  ) => Record<string, unknown>;
}
```

## Practical Examples

### Generate Build Info

```typescript
hooks: {
  generateAssets: async () => {
    const buildInfo = {
      buildTime: new Date().toISOString(),
      gitCommit: execSync("git rev-parse HEAD").toString().trim(),
      gitBranch: execSync("git rev-parse --abbrev-ref HEAD").toString().trim(),
    };

    await fs.writeFile(
      path.join(__dirname, "src/build-info.json"),
      JSON.stringify(buildInfo, null, 2)
    );
  },
},
```

### Generate Checksums After Make

```typescript
import crypto from "node:crypto";

hooks: {
  postMake: async (_config, makeResults) => {
    for (const result of makeResults) {
      for (const artifact of result.artifacts) {
        const content = await fs.readFile(artifact);
        const hash = crypto.createHash("sha256").update(content).digest("hex");
        await fs.writeFile(`${artifact}.sha256`, `${hash}  ${path.basename(artifact)}\n`);
        console.log(`SHA256: ${path.basename(artifact)} → ${hash}`);
      }
    }
    return makeResults;
  },
},
```

### Clean Build Directory

```typescript
hooks: {
  prePackage: async () => {
    const outDir = path.join(__dirname, "out");
    await fs.rm(outDir, { recursive: true, force: true });
    console.log("Cleaned output directory");
  },
},
```

### Inject Environment into Package.json

```typescript
hooks: {
  readPackageJson: async (_config, packageJson) => {
    // Inject build environment
    if (process.env.CI) {
      packageJson.version = `${packageJson.version}-build.${process.env.BUILD_NUMBER}`;
    }
    return packageJson;
  },
},
```

### Copy Extra Files After Packaging

```typescript
hooks: {
  packageAfterCopy: async (_config, buildPath) => {
    // Copy license and readme into the packaged app
    await fs.copyFile(
      path.join(__dirname, "LICENSE"),
      path.join(buildPath, "LICENSE")
    );
  },
},
```

## Best Practices

1. **Use `generateAssets` for build metadata** — commit hash, build time, version info
2. **Use `postMake` for checksums** — generate SHA-256 hashes alongside distributables
3. **Use `readPackageJson` for dynamic versioning** — CI build numbers, environment-based versions
4. **Always return modified data** — `postMake` and `readPackageJson` must return their results
5. **Keep hooks fast** — they run synchronously in the pipeline; slow hooks delay the entire build
6. **Log hook activity** — add console output so build logs show what happened
