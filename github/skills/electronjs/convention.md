# Electron.js — Project Conventions

## Directory Structure

```
project-root/
├── src/
│   ├── main/               # Main process code
│   │   ├── index.ts         # App entry point
│   │   ├── windows/         # Window creation & management
│   │   ├── ipc/             # IPC handlers grouped by domain
│   │   ├── services/        # Business logic (file I/O, DB, etc.)
│   │   └── utils/           # Shared main-process utilities
│   ├── preload/             # Preload scripts
│   │   ├── index.ts         # Default preload script
│   │   └── api.ts           # contextBridge API definitions
│   ├── renderer/            # Renderer process (frontend)
│   │   ├── index.html       # Entry HTML
│   │   ├── index.ts         # Renderer entry point
│   │   ├── components/      # UI components
│   │   ├── pages/           # Pages or views
│   │   ├── styles/          # CSS/SCSS files
│   │   └── utils/           # Renderer-side utilities
│   └── shared/              # Types & constants shared across processes
│       ├── types.ts          # Shared TypeScript interfaces
│       └── constants.ts      # IPC channel names, app constants
├── resources/               # Static assets (icons, images, etc.)
├── forge.config.ts          # Electron Forge config (if using Forge)
├── tsconfig.json
├── package.json
└── .electron-builder.yml    # electron-builder config (if using builder)
```

## Naming Conventions

| Element           | Convention             | Example                                   |
| ----------------- | ---------------------- | ----------------------------------------- |
| Files & folders   | kebab-case             | `ipc-handlers.ts`, `main-window/`         |
| IPC channel names | kebab-case, namespaced | `"app:get-version"`, `"file:open-dialog"` |
| TypeScript types  | PascalCase             | `WindowConfig`, `IpcChannels`             |
| Constants         | UPPER_SNAKE_CASE       | `DEFAULT_WIDTH`, `IPC_CHANNELS`           |
| Functions         | camelCase              | `createMainWindow()`, `handleFileOpen()`  |
| Event handlers    | `on` + PascalCase      | `onWindowClose()`, `onAppReady()`         |

## IPC Channel Naming

Define all IPC channel names as constants in a shared file to avoid typos and enable type safety:

```typescript
// src/shared/constants.ts
export const IPC_CHANNELS = {
  APP_GET_VERSION: "app:get-version",
  FILE_OPEN_DIALOG: "file:open-dialog",
  FILE_SAVE: "file:save",
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE: "window:maximize",
  WINDOW_CLOSE: "window:close",
} as const;
```

## TypeScript Configuration

Use separate `tsconfig` files for main and renderer if needed:

```jsonc
// tsconfig.json (base)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
  },
}
```

## File Organization Rules

1. **One concern per file** — separate IPC handlers, window management, and services
2. **Group IPC handlers by domain** — `ipc/file-handlers.ts`, `ipc/app-handlers.ts`
3. **Keep preload scripts minimal** — only expose what the renderer needs
4. **Share types, not code** — `src/shared/` is for types and constants only, never runtime code that imports Electron APIs
5. **Static assets in `resources/`** — icons, images, and other packaged assets

## Import Order

```typescript
// 1. Node.js built-ins
import path from "node:path";
import fs from "node:fs";

// 2. Electron imports
import { app, BrowserWindow, ipcMain } from "electron";

// 3. Third-party packages
import Store from "electron-store";

// 4. Internal modules (absolute/alias paths)
import { createMainWindow } from "./windows/main-window";
import { IPC_CHANNELS } from "../shared/constants";

// 5. Types (type-only imports)
import type { WindowConfig } from "../shared/types";
```

## Process Separation Rules

- **Never import `electron` in renderer** — use preload + contextBridge
- **Never import renderer code in main** — communicate via IPC only
- **Shared code must be process-agnostic** — no Electron or DOM APIs in `src/shared/`

## Related Skills

For **JavaScript conventions** (ES6+ syntax, async patterns, modules, error handling), load the `javascript` skill. For **TypeScript conventions** (types, generics, utility types, tsconfig, coding standards), load the `typescript` skill. For **build toolchain** (packaging, makers, Vite/Webpack plugins, code signing), load the `electron-forge` skill.
