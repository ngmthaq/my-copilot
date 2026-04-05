---
name: vite-dev-server
description: "Vite dev server — port, host, proxy, HMR, HTTPS, and open browser. Use when configuring the local development server."
---

# Vite Dev Server

## 1. Basic Server Options

```typescript
export default defineConfig({
  server: {
    port: 3000, // default: 5173
    host: true, // expose to local network (0.0.0.0)
    open: true, // open browser on start
    strictPort: true, // fail if port is taken (don't pick another)
  },
});
```

---

## 2. Proxy API Requests

Useful when your backend runs on a different port — avoids CORS during dev.

```typescript
export default defineConfig({
  server: {
    proxy: {
      // proxy /api/* to http://localhost:8080/api/*
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },

      // rewrite: /api/users → /users (strips /api prefix)
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

---

## 3. HTTPS in Development

The easiest way is the `@vitejs/plugin-basic-ssl` plugin:

```bash
npm install -D @vitejs/plugin-basic-ssl
```

```typescript
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [basicSsl()],
  server: { https: true },
});
```

For a real certificate, pass paths:

```typescript
server: {
  https: {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
  },
},
```

---

## 4. HMR (Hot Module Replacement)

HMR is on by default. Customize it if needed:

```typescript
server: {
  hmr: {
    overlay: true,    // show error overlay in browser
    port: 3001,       // use a separate port for HMR websocket
  },
},
```

Disable HMR entirely:

```typescript
server: { hmr: false },
```

---

## 5. Watch Options

Control which files trigger a reload:

```typescript
server: {
  watch: {
    // ignore these paths (useful for large generated folders)
    ignored: ['**/node_modules/**', '**/dist/**'],
  },
},
```

---

## 6. Preview Server (After Build)

The preview server serves the production build locally:

```bash
npm run build && npm run preview
```

```typescript
export default defineConfig({
  preview: {
    port: 4173, // default
    open: true,
  },
});
```
