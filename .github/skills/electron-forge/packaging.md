# Electron Forge — Packaging & Distribution

## Commands Overview

```bash
# Package — bundles app into a platform-specific folder
npx electron-forge package

# Make — packages + creates distributable installers
npx electron-forge make

# Publish — packages + makes + uploads to configured publisher
npx electron-forge publish
```

## Package Command Options

```bash
# Basic packaging (current platform + architecture)
npx electron-forge package

# Specific platform
npx electron-forge package --platform=darwin
npx electron-forge package --platform=win32
npx electron-forge package --platform=linux

# Specific architecture
npx electron-forge package --arch=x64
npx electron-forge package --arch=arm64

# Both
npx electron-forge package --platform=darwin --arch=arm64
```

Output: `out/<app-name>-<platform>-<arch>/`

## ASAR Archives

ASAR is an archive format that packages your app's source files into a single file:

```typescript
// forge.config.ts
packagerConfig: {
  // Simple: package everything into asar
  asar: true,

  // Advanced: selective unpacking
  asar: {
    unpack: "*.{node,dll}",         // Unpack native modules
    unpackDir: "node_modules/sharp", // Unpack entire directories
  },
},
```

### Why ASAR?

- Slightly faster file reads (single file seek)
- Hides source code from casual browsing (not encryption)
- Required for `OnlyLoadAppFromAsar` fuse

### Accessing Extra Resources at Runtime

Files in `extraResource` are placed alongside the ASAR:

```typescript
// forge.config.ts
packagerConfig: {
  extraResource: [
    "./resources/data.json",
    "./resources/models/",
  ],
},
```

```typescript
// Access at runtime
import { app } from "electron";
import path from "node:path";

const resourcePath = app.isPackaged
  ? path.join(process.resourcesPath, "data.json")
  : path.join(__dirname, "../resources/data.json");
```

## Ignoring Files

Reduce package size by excluding unnecessary files:

```typescript
packagerConfig: {
  ignore: [
    // Development files
    /\.git/,
    /\.vscode/,
    /\.github/,
    /\.env/,

    // Source files (if using bundler)
    /\/src$/,

    // Test files
    /\/tests?$/,
    /\/__tests__/,
    /\.test\./,
    /\.spec\./,

    // Documentation
    /\.md$/,
    /\/docs?$/,

    // Build artifacts
    /\.map$/,
  ],
},
```

## Platform-Specific Builds in CI/CD

### GitHub Actions — Cross-Platform

```yaml
# .github/workflows/build.yml
name: Build
on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: macos-latest
            platform: darwin
            arch: x64
          - os: macos-latest
            platform: darwin
            arch: arm64
          - os: windows-latest
            platform: win32
            arch: x64
          - os: ubuntu-latest
            platform: linux
            arch: x64

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Package
        run: npx electron-forge make --arch=${{ matrix.arch }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.platform }}-${{ matrix.arch }}
          path: out/make/**/*
```

## Build Output Structure

```
out/
├── my-app-darwin-arm64/        # Packaged app (forge package)
│   └── my-app.app/
├── my-app-win32-x64/           # Packaged app (forge package)
│   └── my-app.exe
├── make/                       # Distributable (forge make)
│   ├── deb/x64/my-app_1.0.0_amd64.deb
│   ├── rpm/x64/my-app-1.0.0-1.x86_64.rpm
│   ├── squirrel.windows/x64/my-app-1.0.0 Setup.exe
│   └── zip/darwin/arm64/my-app-darwin-arm64-1.0.0.zip
└── publish-dry-run/            # Dry run output
```

## Version Management

The app version comes from `package.json`:

```json
{
  "name": "my-app",
  "version": "1.2.3"
}
```

Override at build time:

```typescript
packagerConfig: {
  appVersion: process.env.APP_VERSION || "0.0.0-dev",
  buildVersion: process.env.BUILD_NUMBER || "0",
},
```

## Universal macOS Builds

Build a universal binary (x64 + arm64) for macOS:

```bash
npx electron-forge package --arch=universal
```

Or in config:

```typescript
packagerConfig: {
  // Only for macOS
  ...(process.platform === "darwin" && {
    arch: "universal",
  }),
},
```

## Best Practices

1. **Enable ASAR** — always package source into ASAR for production
2. **Exclude unnecessary files** — use `ignore` to reduce package size
3. **Use `extraResource` for runtime assets** — not for source code
4. **Build per-platform in CI** — macOS on macOS, Windows on Windows, Linux on Linux
5. **Use GitHub Actions matrix** — build all platforms in parallel
6. **Upload artifacts** — store built distributables for download or deployment
7. **Test the packaged app** — always test `forge package` output, not just `forge start`
8. **Pin Electron version** — avoid unexpected changes in CI builds
