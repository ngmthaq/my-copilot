---
name: vite-env-variables
description: "Vite environment variables — .env files, VITE_ prefix, import.meta.env, and TypeScript types. Use when setting up or accessing environment variables in a Vite project."
---

# Vite Environment Variables

## 1. .env File Names

Vite loads `.env` files based on the current mode:

```
.env                # loaded in all modes
.env.local          # loaded in all modes, ignored by git
.env.development    # loaded in dev (npm run dev)
.env.production     # loaded in prod (npm run build)
.env.test           # loaded in test mode
```

Mode-specific files take priority over `.env`.

---

## 2. The VITE\_ Prefix Rule

Only variables prefixed with `VITE_` are exposed to your source code. Variables without this prefix are only available in the Node.js config context (e.g., `vite.config.ts`).

```bash
# .env
VITE_API_URL=https://api.example.com   # exposed to browser code
DB_PASSWORD=secret                      # NOT exposed (server-only)
```

---

## 3. Accessing Variables in Code

Use `import.meta.env` — not `process.env`:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV; // boolean, true in dev mode
const isProd = import.meta.env.PROD; // boolean, true in prod mode
const mode = import.meta.env.MODE; // 'development' | 'production' | custom
const base = import.meta.env.BASE_URL; // the `base` config value
```

---

## 4. TypeScript Types for Custom Env Vars

Add type declarations so TypeScript knows about your variables:

```typescript
// src/vite-env.d.ts  (extend the existing file)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_FEATURE_FLAG: string; // env vars are always strings
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 5. Using Env Vars in vite.config.ts

Load env vars inside the config function using `loadEnv`:

```typescript
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // loads .env.[mode] — the third argument '' means load ALL vars (not just VITE_)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      proxy: {
        "/api": env.API_TARGET, // can use server-only vars here
      },
    },
  };
});
```

---

## 6. Validation at Startup

Validate required env vars early to catch missing values before runtime errors:

```typescript
// src/config.ts
const requiredVars = ["VITE_API_URL", "VITE_APP_TITLE"] as const;

for (const key of requiredVars) {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  appTitle: import.meta.env.VITE_APP_TITLE,
};
```
