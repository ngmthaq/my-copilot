# Electron Forge — Makers

## Overview

Makers transform your packaged Electron app into platform-specific distributables (installers, archives). Configure them in `forge.config.ts` under the `makers` array.

## Available Makers

| Maker           | Output Format          | Platform       | Package                          |
| --------------- | ---------------------- | -------------- | -------------------------------- |
| `MakerSquirrel` | `.exe` (NSIS/Squirrel) | Windows        | `@electron-forge/maker-squirrel` |
| `MakerWix`      | `.msi`                 | Windows        | `@electron-forge/maker-wix`      |
| `MakerDMG`      | `.dmg`                 | macOS          | `@electron-forge/maker-dmg`      |
| `MakerZIP`      | `.zip`                 | All            | `@electron-forge/maker-zip`      |
| `MakerDeb`      | `.deb`                 | Linux (Debian) | `@electron-forge/maker-deb`      |
| `MakerRpm`      | `.rpm`                 | Linux (RedHat) | `@electron-forge/maker-rpm`      |
| `MakerFlatpak`  | `.flatpak`             | Linux          | `@electron-forge/maker-flatpak`  |
| `MakerSnap`     | `.snap`                | Linux          | `@electron-forge/maker-snap`     |
| `MakerAppImage` | `.AppImage`            | Linux          | `@electron-forge/maker-appimage` |

## Windows — Squirrel.Windows

```typescript
import { MakerSquirrel } from "@electron-forge/maker-squirrel";

new MakerSquirrel({
  // App identity
  name: "my-app",
  setupExe: "MyApp-Setup.exe",
  setupIcon: "./resources/icon.ico",

  // Auto-update
  // remoteReleases: "https://your-update-server.com/releases",

  // Code signing (see code-signing.md)
  // certificateFile: "./cert.pfx",
  // certificatePassword: process.env.CERT_PASSWORD,
}),
```

### Squirrel Startup Events (Windows)

Handle Squirrel install/update events in main process:

```typescript
// src/main.ts — must be at the very top
import { app } from "electron";

if (require("electron-squirrel-startup")) {
  app.quit();
}
```

```bash
npm install electron-squirrel-startup
```

## Windows — WiX MSI

```typescript
import { MakerWix } from "@electron-forge/maker-wix";

new MakerWix({
  name: "My App",
  manufacturer: "My Company",
  icon: "./resources/icon.ico",
  ui: {
    chooseDirectory: true, // Allow custom install directory
  },
}),
```

Requires WiX Toolset v3 installed on the build machine.

## macOS — DMG

```typescript
import { MakerDMG } from "@electron-forge/maker-dmg";

new MakerDMG({
  name: "MyApp",
  icon: "./resources/icon.icns",
  background: "./resources/dmg-background.png",
  format: "ULFO", // Lzfse compression (default)
  contents: [
    { x: 130, y: 220, type: "file", path: "" }, // App icon position
    { x: 410, y: 220, type: "link", path: "/Applications" }, // Applications shortcut
  ],
}),
```

## macOS/All — ZIP

```typescript
import { MakerZIP } from "@electron-forge/maker-zip";

// ZIP for macOS (common for direct distribution)
new MakerZIP({}, ["darwin"]),

// ZIP for all platforms
new MakerZIP({}),
```

## Linux — Debian (.deb)

```typescript
import { MakerDeb } from "@electron-forge/maker-deb";

new MakerDeb({
  options: {
    name: "my-app",
    productName: "My App",
    genericName: "Utility",
    description: "A useful Electron application",
    productDescription: "A longer description of My App.",
    icon: "./resources/icon.png",
    categories: ["Development", "Utility"],
    section: "utils",
    homepage: "https://example.com",
    maintainer: "Your Name <you@example.com>",
    depends: ["libgtk-3-0", "libnotify4", "libnss3", "libsecret-1-0"],
    mimeType: ["x-scheme-handler/myapp"],
    desktopTemplate: "./resources/desktop.ejs", // Custom .desktop file
  },
}),
```

## Linux — RPM

```typescript
import { MakerRpm } from "@electron-forge/maker-rpm";

new MakerRpm({
  options: {
    name: "my-app",
    productName: "My App",
    icon: "./resources/icon.png",
    categories: ["Development", "Utility"],
    homepage: "https://example.com",
    license: "MIT",
    requires: ["gtk3", "libnotify", "nss", "libsecret"],
  },
}),
```

## Linux — Flatpak

```typescript
import { MakerFlatpak } from "@electron-forge/maker-flatpak";

new MakerFlatpak({
  options: {
    id: "com.example.myapp",
    genericName: "My App",
    categories: ["Development", "Utility"],
    runtimeVersion: "23.08",
  },
}),
```

## Linux — Snap

```typescript
import { MakerSnap } from "@electron-forge/maker-snap";

new MakerSnap({
  stagePackages: ["libsecret-1-0"],
  confinement: "strict",
  grade: "stable",
}),
```

## Platform-Specific Maker Selection

Only the makers for the current OS will run. Configure all target platforms:

```typescript
makers: [
  // Windows
  new MakerSquirrel({}),

  // macOS
  new MakerDMG({}),
  new MakerZIP({}, ["darwin"]),

  // Linux
  new MakerDeb({}),
  new MakerRpm({}),
],
```

## Running Makers

```bash
# Make for current platform
npm run make

# Make for specific platform (must be on that OS or using CI)
npx electron-forge make --platform=win32
npx electron-forge make --platform=darwin
npx electron-forge make --platform=linux

# Make specific architecture
npx electron-forge make --arch=x64
npx electron-forge make --arch=arm64
```

Output goes to `out/make/` directory.

## Best Practices

1. **Include all target platform makers** — they're only invoked on the matching OS
2. **Provide platform-specific icons** — `.ico` for Windows, `.icns` for macOS, `.png` for Linux
3. **Handle Squirrel startup** — Windows Squirrel installs launch the app during install/update
4. **Set proper metadata** — `name`, `description`, `categories`, `homepage` for Linux packages
5. **Test on each platform** — makers have platform-specific behaviors and requirements
6. **Use CI/CD for cross-platform builds** — build Windows on Windows, macOS on macOS, Linux on Linux
