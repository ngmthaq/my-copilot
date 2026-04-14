# Electron.js — IPC Communication

## Overview

Inter-Process Communication (IPC) is the primary way to communicate between the main process and renderer processes in Electron. There are three patterns: invoke/handle (request-response), send/on (one-way), and main-to-renderer (push).

## Pattern 1: Invoke/Handle (Request-Response) — Preferred

The recommended pattern for most communication. Returns a Promise.

### Main Process Handler

```typescript
// src/main/ipc/app-handlers.ts
import { ipcMain, app } from "electron";

export function registerAppHandlers() {
  ipcMain.handle("app:get-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("app:get-path", (_event, name: string) => {
    return app.getPath(name as any);
  });
}
```

### Preload Exposure

```typescript
// src/preload/index.ts
contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  getPath: (name: string) => ipcRenderer.invoke("app:get-path", name),
});
```

### Renderer Usage

```typescript
const version = await window.electronAPI.getVersion();
const userDataPath = await window.electronAPI.getPath("userData");
```

## Pattern 2: Send/On (One-Way, Renderer → Main)

For fire-and-forget messages from renderer to main.

```typescript
// Main process
ipcMain.on("window:minimize", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
});

// Preload
contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => ipcRenderer.send("window:minimize"),
});

// Renderer
window.electronAPI.minimizeWindow();
```

## Pattern 3: Main → Renderer (Push)

For pushing data from main to the renderer (e.g., update notifications, progress).

```typescript
// Main process — send to a specific window
mainWindow.webContents.send("download:progress", { percent: 45 });

// Preload — expose listener with cleanup
contextBridge.exposeInMainWorld("electronAPI", {
  onDownloadProgress: (callback: (data: { percent: number }) => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      data: { percent: number },
    ) => callback(data);
    ipcRenderer.on("download:progress", handler);
    return () => ipcRenderer.removeListener("download:progress", handler);
  },
});

// Renderer
const cleanup = window.electronAPI.onDownloadProgress((data) => {
  console.log(`Download: ${data.percent}%`);
});
// Call cleanup() when component unmounts
```

## Typed IPC Channels

Define all channels and their signatures in a shared location:

```typescript
// src/shared/ipc-types.ts
export interface IpcChannelMap {
  // Invoke/Handle channels (request → response)
  "app:get-version": { args: []; result: string };
  "file:open-dialog": { args: []; result: string | null };
  "file:save": { args: [content: string, filePath: string]; result: boolean };
  "file:read": { args: [filePath: string]; result: string };

  // Send/On channels (one-way)
  "window:minimize": { args: [] };
  "window:maximize": { args: [] };
  "window:close": { args: [] };

  // Main → Renderer channels (push)
  "update:available": { data: { version: string } };
  "download:progress": { data: { percent: number } };
}
```

## Organizing IPC Handlers

Group handlers by domain in separate files:

```typescript
// src/main/ipc/index.ts
import { registerAppHandlers } from "./app-handlers";
import { registerFileHandlers } from "./file-handlers";
import { registerWindowHandlers } from "./window-handlers";

export function registerIpcHandlers() {
  registerAppHandlers();
  registerFileHandlers();
  registerWindowHandlers();
}
```

```typescript
// src/main/ipc/file-handlers.ts
import { ipcMain, dialog, BrowserWindow } from "electron";
import fs from "node:fs/promises";

export function registerFileHandlers() {
  ipcMain.handle("file:open-dialog", async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return null;

    const result = await dialog.showOpenDialog(window, {
      properties: ["openFile"],
      filters: [{ name: "Text Files", extensions: ["txt", "md"] }],
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return fs.readFile(result.filePaths[0], "utf-8");
  });

  ipcMain.handle(
    "file:save",
    async (_event, content: string, filePath: string) => {
      await fs.writeFile(filePath, content, "utf-8");
      return true;
    },
  );
}
```

## Error Handling in IPC

Errors thrown in `ipcMain.handle` are serialized and re-thrown in the renderer:

```typescript
// Main process
ipcMain.handle("file:read", async (_event, filePath: string) => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read file: ${(error as Error).message}`);
  }
});

// Renderer — errors propagate through invoke
try {
  const content = await window.electronAPI.readFile("/some/path");
} catch (error) {
  console.error("File read failed:", error.message);
}
```

## MessagePort Communication

For high-frequency communication or direct renderer-to-renderer:

```typescript
// Main process — create and transfer MessagePort
const { port1, port2 } = new MessageChannelMain();

mainWindow.webContents.postMessage("port", null, [port1]);
secondWindow.webContents.postMessage("port", null, [port2]);

// Preload
ipcRenderer.on("port", (event) => {
  const port = event.ports[0];
  contextBridge.exposeInMainWorld("commsPort", {
    send: (data: unknown) => port.postMessage(data),
    onMessage: (callback: (data: unknown) => void) => {
      port.onmessage = (event) => callback(event.data);
    },
  });
  port.start();
});
```

## Best Practices

1. **Prefer `invoke`/`handle`** over `send`/`on` — it returns a Promise and handles errors naturally
2. **Always validate IPC arguments** in main process handlers — the renderer is untrusted
3. **Namespace channel names** — `"domain:action"` format prevents collisions
4. **Centralize channel names** — define in `src/shared/constants.ts` to avoid typos
5. **Group handlers by domain** — one file per feature area
6. **Return cleanup functions** — for all event listener subscriptions
7. **Never send sensitive data** through IPC without validation — always sanitize
8. **Use `BrowserWindow.fromWebContents(event.sender)`** — to get the window that sent the message
