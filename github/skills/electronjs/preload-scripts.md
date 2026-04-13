# Electron.js — Preload Scripts

## Overview

Preload scripts run in a special context that has access to a limited set of Node.js and Electron APIs while being attached to the renderer's DOM. They serve as the secure bridge between the main process and the renderer using `contextBridge`.

## Basic Preload Pattern

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Invoke main process handlers (request-response)
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  openFile: () => ipcRenderer.invoke("file:open-dialog"),
  saveFile: (content: string) => ipcRenderer.invoke("file:save", content),

  // Send one-way messages to main
  minimizeWindow: () => ipcRenderer.send("window:minimize"),

  // Listen for messages from main
  onUpdateAvailable: (callback: (version: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, version: string) => callback(version);
    ipcRenderer.on("update-available", listener);
    // Return cleanup function
    return () => ipcRenderer.removeListener("update-available", listener);
  },
});
```

## Type-Safe Preload API

Define the API types in a shared file:

```typescript
// src/shared/types.ts
export interface ElectronAPI {
  getVersion: () => Promise<string>;
  openFile: () => Promise<string | null>;
  saveFile: (content: string) => Promise<boolean>;
  minimizeWindow: () => void;
  onUpdateAvailable: (callback: (version: string) => void) => () => void;
}
```

Declare the global type for the renderer:

```typescript
// src/shared/types.ts (or src/renderer/global.d.ts)
import type { ElectronAPI } from "./types";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

## Context Isolation

Context isolation (enabled by default since Electron 12) ensures the preload script runs in a separate JavaScript context from the renderer's web content. This prevents the renderer from accessing or modifying preload globals.

```typescript
// BrowserWindow config — these are the secure defaults
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "../preload/index.js"),
    contextIsolation: true, // Default: true (DO NOT disable)
    nodeIntegration: false, // Default: false (DO NOT enable)
    sandbox: true, // Default: true (recommended)
  },
});
```

## Safe Event Listener Pattern

Never expose `ipcRenderer.on` directly — wrap it to prevent leaking the `event` object:

```typescript
// WRONG — exposes ipcRenderer event object to renderer
contextBridge.exposeInMainWorld("electronAPI", {
  onMessage: (callback: Function) => ipcRenderer.on("message", callback),
});

// CORRECT — wrap the callback to strip the event object
contextBridge.exposeInMainWorld("electronAPI", {
  onMessage: (callback: (data: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: string) => callback(data);
    ipcRenderer.on("message", listener);
    return () => ipcRenderer.removeListener("message", listener);
  },
});
```

## Multiple Preload Scripts

Use different preload scripts for different windows:

```typescript
// Main window preload
// src/preload/main-preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
  // Full API for main window
});

// Settings window preload
// src/preload/settings-preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
  // Limited API for settings window
});
```

```typescript
// Creating windows with different preloads
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "../preload/main-preload.js"),
  },
});

const settingsWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "../preload/settings-preload.js"),
  },
});
```

## Preload with Cleanup

Provide cleanup for event listeners to prevent memory leaks:

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
  onProgress: (callback: (percent: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, percent: number) => callback(percent);
    ipcRenderer.on("download:progress", handler);
    return () => {
      ipcRenderer.removeListener("download:progress", handler);
    };
  },
  removeAllProgressListeners: () => {
    ipcRenderer.removeAllListeners("download:progress");
  },
});
```

## Best Practices

1. **Always use `contextBridge.exposeInMainWorld`** — never disable context isolation
2. **Never expose `ipcRenderer` directly** — only expose specific methods
3. **Strip event objects** — never pass `IpcRendererEvent` to the renderer
4. **Return cleanup functions** — for every `on` listener, return a removal function
5. **Type all exposed APIs** — use shared types for type safety across processes
6. **Keep preload minimal** — only expose what the renderer strictly needs
7. **Use `ipcRenderer.invoke`** — prefer invoke/handle over send/on for request-response
8. **Never expose `require`** — the whole point of preload is controlled API exposure
