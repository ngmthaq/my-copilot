---
name: vite-federation
description: "Vite module federation — sharing code between micro-frontends using vite-plugin-federation. Use when setting up a host/remote micro-frontend architecture with Vite."
---

# Vite Module Federation

## 1. What is Module Federation?

Module Federation lets multiple separate Vite apps share code at runtime — without publishing to npm. One app (the **remote**) exposes components/utilities; another (the **host**) consumes them.

---

## 2. Install

```bash
# In both host and remote apps
npm install -D @originjs/vite-plugin-federation
```

---

## 3. Remote App (Exposes Code)

```typescript
// remote-app/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "remote-app",
      filename: "remoteEntry.js", // the manifest file the host loads
      exposes: {
        "./Button": "./src/components/Button", // key is the import path used by host
        "./useAuth": "./src/hooks/useAuth",
      },
      shared: ["react", "react-dom"], // shared deps — loaded once, not duplicated
    }),
  ],
  build: {
    target: "esnext", // required for module federation
    minify: false, // optional but helps debugging
  },
});
```

---

## 4. Host App (Consumes Code)

```typescript
// host-app/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host-app",
      remotes: {
        // key is the module name used in imports; value is the URL to remoteEntry.js
        "remote-app": "http://localhost:5001/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
  },
});
```

---

## 5. Using Remote Components in Host

```typescript
// host-app/src/App.tsx
import { lazy, Suspense } from 'react';

// Import from remote app using the key defined in remotes config
const RemoteButton = lazy(() => import('remote-app/Button'));

export function App() {
  return (
    <Suspense fallback={<div>Loading remote...</div>}>
      <RemoteButton label="Click me" />
    </Suspense>
  );
}
```

---

## 6. TypeScript Support for Remote Modules

TypeScript doesn’t know the types of remote modules by default. Add declarations:

```typescript
// host-app/src/types/remotes.d.ts
declare module "remote-app/Button" {
  import { FC } from "react";
  export const Button: FC<{ label: string }>;
  export default Button;
}

declare module "remote-app/useAuth" {
  export function useAuth(): { user: unknown; logout: () => void };
}
```

---

## 7. Development Workflow

```bash
# Terminal 1: start remote app
cd remote-app && npm run dev   # runs on :5001

# Terminal 2: start host app
cd host-app && npm run dev     # runs on :5000, loads from remote at :5001
```

In production, deploy the remote app first and point `remotes` to its CDN URL.
