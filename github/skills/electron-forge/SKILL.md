---
name: electron-forge
description: "Unified Electron Forge skill index — covers project setup & scaffolding, forge.config.ts configuration, Vite plugin integration, Webpack plugin integration, makers (DMG, Squirrel, deb, rpm, zip, Flatpak, Snap), publishers (GitHub, S3, Snapcraft, Bitbucket), plugins (Fuses, Auto-unpack, Electronegativity), packaging & distribution, lifecycle hooks (generateAssets, prePackage, postPackage, preMake, postMake), and code signing for macOS/Windows. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Electron Forge Skill

## Overview

This file is the top-level entry point for all Electron Forge-related topics. Electron Forge is the official toolchain for building, packaging, and publishing Electron applications. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                   | File                                         | When to use                                                                                      |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Setup & Scaffolding      | [setup-scaffolding.md](setup-scaffolding.md) | Creating new projects, initializing Forge in existing projects, project templates                |
| Configuration            | [configuration.md](configuration.md)         | forge.config.ts structure, packagerConfig, rebuildConfig, makers, publishers, plugins            |
| Vite Plugin              | [plugin-vite.md](plugin-vite.md)             | Setting up Vite bundler, vite.main.config.ts, vite.renderer.config.ts, vite.preload.config.ts    |
| Webpack Plugin           | [plugin-webpack.md](plugin-webpack.md)       | Setting up Webpack bundler, main/renderer webpack configs, dev server, HMR                       |
| Makers                   | [makers.md](makers.md)                       | Building distributable packages: DMG, Squirrel.Windows, deb, rpm, zip, Flatpak, Snap, WiX MSI    |
| Publishers               | [publishers.md](publishers.md)               | Publishing to GitHub Releases, S3, Snapcraft, Bitbucket, Nucleus, custom servers                 |
| Plugins                  | [plugins.md](plugins.md)                     | Fuses, Auto-unpack natives, Electronegativity, custom plugins                                    |
| Packaging & Distribution | [packaging.md](packaging.md)                 | forge package, forge make, ASAR archives, platform-specific builds, CI/CD pipelines              |
| Lifecycle Hooks          | [lifecycle-hooks.md](lifecycle-hooks.md)     | generateAssets, prePackage, postPackage, preMake, postMake, readPackageJson, custom hook scripts |
| Code Signing             | [code-signing.md](code-signing.md)           | macOS notarization, Windows Authenticode signing, certificate management, CI/CD signing          |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Create a new Electron project or add Forge to an existing one?
│   └── → setup-scaffolding.md
│
├── Configure forge.config.ts (packager, makers, publishers, plugins)?
│   └── → configuration.md
│
├── Set up Vite as the bundler for your Electron app?
│   └── → plugin-vite.md
│
├── Set up Webpack as the bundler for your Electron app?
│   └── → plugin-webpack.md
│
├── Build installers/distributables (DMG, exe, deb, rpm, zip)?
│   └── → makers.md
│
├── Publish releases to GitHub, S3, or other platforms?
│   └── → publishers.md
│
├── Configure Electron Fuses, auto-unpack, or other plugins?
│   └── → plugins.md
│
├── Package your app, configure ASAR, or set up CI/CD builds?
│   └── → packaging.md
│
├── Run custom scripts at specific build lifecycle stages?
│   └── → lifecycle-hooks.md
│
└── Code sign or notarize your app for macOS/Windows?
    └── → code-signing.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file`.
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, setting up a new project typically involves `setup-scaffolding.md` + `configuration.md` + `plugin-vite.md`.
5. **Load the `electronjs` skill** when the task also involves Electron core APIs (IPC, windows, security, etc.).
