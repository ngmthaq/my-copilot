# Electron.js — Renderer Process

## Overview

The renderer process runs web content inside a `BrowserWindow`. Each window runs in its own renderer process. With context isolation enabled (default since Electron 12), the renderer has no direct access to Node.js or Electron APIs — it communicates with the main process exclusively through the preload script and IPC.

## Loading Content

### Local HTML Files

```typescript
// Load from file system
mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
```

### Dev Server (during development)

```typescript
const isDev = !app.isPackaged;

if (isDev) {
  mainWindow.loadURL("http://localhost:5173"); // Vite dev server
} else {
  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
}
```

## Frontend Framework Integration

### With React, Vue, or other SPA frameworks

The renderer is a standard web environment. Use any frontend framework:

```typescript
// src/renderer/index.ts (React example)
import { createRoot } from "react-dom/client";
import { App } from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
```

### Accessing Exposed APIs

The renderer accesses main process functionality through APIs exposed in the preload script:

```typescript
// src/renderer/utils/electron-api.ts
// The preload script exposes APIs on window.electronAPI (or similar)
// See preload-scripts.md for the exposure pattern

// Type-safe access to preload-exposed APIs
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      openFile: () => Promise<string | null>;
      onUpdateAvailable: (callback: () => void) => void;
    };
  }
}

// Usage in components
const version = await window.electronAPI.getVersion();
```

## DevTools

```typescript
// Open DevTools in development
if (!app.isPackaged) {
  mainWindow.webContents.openDevTools({ mode: "detach" });
}

// Toggle DevTools programmatically
mainWindow.webContents.toggleDevTools();

// Open DevTools for a specific panel
mainWindow.webContents.openDevTools({ mode: "right" });
// Modes: "right", "bottom", "undocked", "detach"
```

## WebContents Events

```typescript
const { webContents } = mainWindow;

// Page finished loading
webContents.on("did-finish-load", () => {
  console.log("Page loaded");
});

// Handle navigation (prevent unwanted external navigation)
webContents.on("will-navigate", (event, url) => {
  const parsedUrl = new URL(url);
  if (parsedUrl.origin !== "http://localhost:5173") {
    event.preventDefault();
  }
});

// Handle new window requests (e.g., target="_blank" links)
webContents.setWindowOpenHandler(({ url }) => {
  // Open external links in default browser
  shell.openExternal(url);
  return { action: "deny" };
});

// DOM ready
webContents.on("dom-ready", () => {
  // Inject CSS or perform DOM operations
});
```

## Sending Data to Renderer

From the main process, send messages to the renderer:

```typescript
// Main process → Renderer
mainWindow.webContents.send("update-available", { version: "2.0.0" });
```

The renderer listens via the preload-exposed API (see `ipc-communication.md` and `preload-scripts.md`).

## Content Security Policy

Set CSP in your HTML to restrict what the renderer can load:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
/>
```

See `security.md` for comprehensive CSP configuration.

## Best Practices

1. **Never enable `nodeIntegration`** in the renderer — use preload + contextBridge
2. **Type your exposed APIs** — declare global `Window` interface extensions
3. **Handle navigation events** — prevent the renderer from navigating to untrusted URLs
4. **Use `setWindowOpenHandler`** — control how new window requests are handled
5. **Open DevTools only in dev** — use `app.isPackaged` to gate DevTools
6. **Set CSP headers** — restrict resource loading in your HTML
