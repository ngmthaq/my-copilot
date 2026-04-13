# Electron.js — Main Process & App Lifecycle

## App Lifecycle Events

```typescript
import { app, BrowserWindow } from "electron";

// App is ready to create windows
app.whenReady().then(() => {
  createMainWindow();

  // macOS: re-create window when dock icon clicked and no windows open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed (except macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Cleanup before quit
app.on("before-quit", () => {
  // Save state, close DB connections, etc.
});
```

## Single Instance Lock

Prevent multiple instances of your app:

```typescript
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    // Focus existing window when user tries to open another instance
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // Handle deep link from commandLine if needed
  });
}
```

## App Entry Point Pattern

```typescript
// src/main/index.ts
import { app } from "electron";
import { createMainWindow } from "./windows/main-window";
import { registerIpcHandlers } from "./ipc";
import { initializeServices } from "./services";

async function bootstrap() {
  await app.whenReady();

  // Initialize services before creating windows
  await initializeServices();

  // Register all IPC handlers
  registerIpcHandlers();

  // Create the main window
  createMainWindow();
}

bootstrap().catch(console.error);
```

## App Paths

```typescript
import { app } from "electron";

// Common paths
app.getPath("userData"); // User-specific app data
app.getPath("documents"); // User's Documents folder
app.getPath("downloads"); // User's Downloads folder
app.getPath("temp"); // Temp directory
app.getPath("home"); // User's home directory
app.getPath("appData"); // Per-user app data (roaming on Windows)
app.getAppPath(); // App's root directory
```

## Protocol Handling

Register custom protocols for your app:

```typescript
import { app, protocol, net } from "electron";

// Must be called before app.whenReady()
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

app.whenReady().then(() => {
  protocol.handle("app", (request) => {
    const url = new URL(request.url);
    const filePath = path.join(__dirname, url.pathname);
    return net.fetch(`file://${filePath}`);
  });
});
```

## Environment Detection

```typescript
import { app } from "electron";

// Check if running in development
const isDev = !app.isPackaged;

// Check platform
const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";

// App version
const appVersion = app.getVersion();
const appName = app.getName();
```

## Graceful Shutdown

```typescript
import { app } from "electron";

let isQuitting = false;

app.on("before-quit", () => {
  isQuitting = true;
});

// In window close handler — hide to tray instead of quitting (if tray is used)
mainWindow.on("close", (event) => {
  if (!isQuitting) {
    event.preventDefault();
    mainWindow.hide();
  }
});
```

## Best Practices

1. **Always use `app.whenReady()`** — not `app.on("ready")`, as `whenReady()` returns a Promise and works even if ready already fired
2. **Handle macOS `activate`** — users expect clicking the dock icon to re-open the app
3. **Use single instance lock** for apps that should only have one running instance
4. **Initialize services before creating windows** — DB connections, config loading, etc.
5. **Never block the main process** — offload heavy work to worker threads or utility processes
6. **Use `app.getPath()`** — never hardcode OS-specific paths
