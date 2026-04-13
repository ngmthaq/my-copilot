---
name: vite
description: "Unified Vite skill index — covers project setup, config optimization, dev server, alias resolution, environment variables, build optimization, code splitting, asset handling, plugin ecosystem, and module federation. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Vite Skill

## Overview

This is the top-level entry point for all Vite-related topics. It identifies the right sub-skill file based on what you need to do. Each sub-skill file contains practical patterns and examples for its domain.

---

## Sub-Skills Reference

| Domain              | File                                             | When to use                                                                                    |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Project Setup       | [project-setup.md](project-setup.md)             | Scaffolding a new Vite project; installing dependencies; basic TypeScript config; first run    |
| Config Optimization | [config-optimization.md](config-optimization.md) | Structuring `vite.config.ts`; using `defineConfig`; merging configs for different environments |
| Dev Server          | [dev-server.md](dev-server.md)                   | Changing port; setting up proxy; configuring HMR; HTTPS in dev; open browser on start          |
| Alias Resolution    | [alias-resolution.md](alias-resolution.md)       | Setting up `@/` path aliases; syncing aliases between Vite and TypeScript                      |
| Environment Vars    | [env-variables.md](env-variables.md)             | Using `.env` files; `VITE_` prefix; `import.meta.env`; TypeScript types for env vars           |
| Build Optimization  | [build-optimization.md](build-optimization.md)   | Output folder; minification; target browsers; inlining assets; source maps                     |
| Code Splitting      | [code-splitting.md](code-splitting.md)           | Dynamic imports; `manualChunks`; lazy-loading routes; vendor chunk separation                  |
| Asset Handling      | [asset-handling.md](asset-handling.md)           | `public/` folder; importing images/fonts/SVGs; CSS modules; inline vs URL assets               |
| Plugin Ecosystem    | [plugin-ecosystem.md](plugin-ecosystem.md)       | Official plugins (React, Vue); common community plugins; writing a simple custom plugin        |
| Module Federation   | [federation.md](federation.md)                   | Sharing code between micro-frontends with `vite-plugin-federation`                             |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Start a brand-new Vite project?
│   └── → project-setup.md
│
├── Structure or merge vite.config.ts cleanly?
│   └── → config-optimization.md
│
├── Change dev server port, proxy API calls, or configure HMR?
│   └── → dev-server.md
│
├── Set up @/ path aliases?
│   └── → alias-resolution.md
│
├── Use .env files or access VITE_ variables in code?
│   └── → env-variables.md
│
├── Optimize the production build (size, target, source maps)?
│   └── → build-optimization.md
│
├── Split bundles, lazy-load routes, or separate vendor chunks?
│   └── → code-splitting.md
│
├── Import images, SVGs, fonts, or configure CSS modules?
│   └── → asset-handling.md
│
├── Add a plugin (React, Vue, PWA, Icons, etc.)?
│   └── → plugin-ecosystem.md
│
└── Share components between micro-frontends?
    └── → federation.md
```

---

## How to Use This Skill

1. Pick the goal from the Quick Decision Guide above.
2. Load the matching sub-skill file with `read_file`.
3. Follow the patterns in that file to produce a response.
4. Load multiple files when the task spans topics (e.g., alias-resolution + env-variables when setting up a new project).
