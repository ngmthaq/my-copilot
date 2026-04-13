# Electron Forge — Setup & Scaffolding

## Create New Project

### Using the CLI

```bash
# Create with Vite + TypeScript (recommended)
npm init electron-app@latest my-app -- --template=vite-typescript

# Create with Webpack + TypeScript
npm init electron-app@latest my-app -- --template=webpack-typescript

# Create with plain JavaScript (Vite)
npm init electron-app@latest my-app -- --template=vite

# Create with plain JavaScript (Webpack)
npm init electron-app@latest my-app -- --template=webpack
```

### Available Templates

| Template             | Bundler | Language   | Use When                         |
| -------------------- | ------- | ---------- | -------------------------------- |
| `vite-typescript`    | Vite    | TypeScript | New projects (recommended)       |
| `vite`               | Vite    | JavaScript | Quick prototypes                 |
| `webpack-typescript` | Webpack | TypeScript | Complex builds needing Webpack   |
| `webpack`            | Webpack | JavaScript | Legacy or Webpack-specific needs |

## Add Forge to an Existing Project

```bash
cd existing-electron-app
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

This will:

1. Add Forge dependencies to `package.json`
2. Create `forge.config.ts` (or `.js`)
3. Update npm scripts (`start`, `package`, `make`, `publish`)
4. Detect and configure your existing bundler setup

## Project Structure (Vite Template)

```
my-app/
├── src/
│   ├── main.ts           # Main process entry
│   ├── preload.ts         # Preload script
│   ├── renderer.ts        # Renderer entry
│   └── index.html         # Renderer HTML
├── forge.config.ts        # Forge configuration
├── vite.main.config.ts    # Vite config for main process
├── vite.preload.config.ts # Vite config for preload
├── vite.renderer.config.ts # Vite config for renderer
├── tsconfig.json
└── package.json
```

## package.json Scripts

After scaffolding, these scripts are available:

```json
{
  "scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make",
    "publish": "electron-forge publish",
    "lint": "eslint --ext .ts,.tsx ."
  }
}
```

| Script    | Purpose                                       |
| --------- | --------------------------------------------- |
| `start`   | Launch app in dev mode with hot reload        |
| `package` | Bundle and package app (no distributable)     |
| `make`    | Package + create platform installers          |
| `publish` | Package + make + publish to configured target |

## Key Dependencies

The scaffolded project includes:

```json
{
  "devDependencies": {
    "@electron-forge/cli": "^7.x",
    "@electron-forge/maker-squirrel": "^7.x",
    "@electron-forge/maker-zip": "^7.x",
    "@electron-forge/maker-deb": "^7.x",
    "@electron-forge/maker-rpm": "^7.x",
    "@electron-forge/plugin-vite": "^7.x",
    "@electron-forge/plugin-fuses": "^7.x",
    "electron": "^33.x",
    "typescript": "^5.x"
  }
}
```

## Minimum Forge Version

Use Electron Forge v7+ (the latest major version). v7 requires Electron 28+.

## Post-Setup Checklist

1. Verify `npm start` launches the app
2. Review `forge.config.ts` and customize makers for your target platforms
3. Set `packagerConfig.name` to your app's display name
4. Add app icons in `resources/` directory
5. Configure code signing if distributing publicly (see `code-signing.md`)
6. Add Fuses plugin for security hardening (see `plugins.md`)

## Best Practices

1. **Use Vite template** — faster dev server, better tree-shaking, modern defaults
2. **Start with TypeScript** — Forge configs and Electron APIs benefit from type safety
3. **Don't eject** — Forge is designed to be configured, not ejected
4. **Lock Electron version** — pin to a specific major version to avoid breaking changes
5. **Use `forge.config.ts`** — TypeScript config gives autocomplete and type checking
