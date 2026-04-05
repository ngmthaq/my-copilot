---
name: vite-project-setup
description: "Vite project setup — scaffolding, installing dependencies, TypeScript config, and first run. Use when starting a new Vite project from scratch."
---

# Vite Project Setup

## 1. Scaffold a New Project

Use the official scaffolding tool — pick a template (vanilla, react, vue, etc.):

```bash
# npm
npm create vite@latest my-app -- --template react-ts

# pnpm
pnpm create vite my-app --template react-ts

# yarn
yarn create vite my-app --template react-ts
```

Available templates: `vanilla`, `vanilla-ts`, `react`, `react-ts`, `vue`, `vue-ts`, `preact`, `preact-ts`, `lit`, `lit-ts`, `svelte`, `svelte-ts`.

---

## 2. Install & Run

```bash
cd my-app
npm install
npm run dev     # start dev server
npm run build   # production build
npm run preview # preview production build locally
```

---

## 3. Minimal Project Structure

```
my-app/
├── public/             # static files served as-is
│   └── favicon.ico
├── src/
│   ├── main.ts         # entry point
│   ├── App.tsx
│   └── vite-env.d.ts   # Vite type declarations
├── index.html          # root HTML (entry for Vite)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

> `index.html` is the entry point — Vite reads it directly, not a separate webpack entry.

---

## 4. Minimal vite.config.ts

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

---

## 5. TypeScript Setup

Vite generates `tsconfig.json` automatically. The key addition is `vite-env.d.ts` in `src/`:

```typescript
// src/vite-env.d.ts (generated automatically — do not delete)
/// <reference types="vite/client" />
```

This gives you types for `import.meta.env`, asset imports, and CSS modules.

---

## 6. Recommended tsconfig Settings

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```
