# Electron.js — BrowserWindow Management

## Creating a Window

```typescript
// src/main/windows/main-window.ts
import { BrowserWindow, app } from "electron";
import path from "node:path";

let mainWindow: BrowserWindow | null = null;

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Prevent flash of white — show when ready
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Show window when content is ready (prevents flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}
```

## Window Options Reference

```typescript
new BrowserWindow({
  // Size
  width: 1200,
  height: 800,
  minWidth: 600,
  minHeight: 400,
  maxWidth: 1920,
  maxHeight: 1080,

  // Position
  x: 100,
  y: 100,
  center: true,

  // Appearance
  title: "My App",
  icon: path.join(__dirname, "../../resources/icon.png"),
  backgroundColor: "#1e1e1e", // Prevents white flash
  show: false,

  // Frame
  frame: true, // Set false for frameless window
  titleBarStyle: "hidden", // macOS: "default", "hidden", "hiddenInset", "customButtonsOnHover"
  titleBarOverlay: true, // Windows: overlay traffic-light buttons
  trafficLightPosition: { x: 10, y: 10 }, // macOS: reposition traffic lights
  transparent: false,
  vibrancy: "under-window", // macOS vibrancy effect

  // Behavior
  resizable: true,
  movable: true,
  minimizable: true,
  maximizable: true,
  closable: true,
  focusable: true,
  alwaysOnTop: false,
  fullscreenable: true,
  skipTaskbar: false,

  // Web Preferences (security-critical)
  webPreferences: {
    preload: path.join(__dirname, "../preload/index.js"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
  },
});
```

## Frameless Window with Custom Title Bar

```typescript
const mainWindow = new BrowserWindow({
  frame: false,
  titleBarStyle: "hidden",
  titleBarOverlay: {
    color: "#2f3241",
    symbolColor: "#74b1be",
    height: 30,
  },
  webPreferences: {
    preload: path.join(__dirname, "../preload/index.js"),
  },
});
```

```css
/* Renderer CSS — make custom title bar draggable */
.title-bar {
  -webkit-app-region: drag;
  height: 30px;
}

.title-bar button {
  -webkit-app-region: no-drag; /* Buttons must be non-draggable */
}
```

## Multi-Window Management

```typescript
// src/main/windows/window-manager.ts
import { BrowserWindow } from "electron";

const windows = new Map<string, BrowserWindow>();

export function createWindow(id: string, options: Electron.BrowserWindowConstructorOptions): BrowserWindow {
  if (windows.has(id)) {
    const existing = windows.get(id)!;
    existing.focus();
    return existing;
  }

  const window = new BrowserWindow(options);

  windows.set(id, window);
  window.on("closed", () => {
    windows.delete(id);
  });

  return window;
}

export function getWindow(id: string): BrowserWindow | undefined {
  return windows.get(id);
}

export function getAllWindows(): Map<string, BrowserWindow> {
  return windows;
}
```

## Parent/Child and Modal Windows

```typescript
// Child window
const child = new BrowserWindow({
  parent: mainWindow,
  width: 400,
  height: 300,
});

// Modal window (blocks parent)
const modal = new BrowserWindow({
  parent: mainWindow,
  modal: true,
  width: 400,
  height: 300,
  show: false,
});
modal.once("ready-to-show", () => modal.show());
```

## Window State Persistence

Save and restore window position/size:

```typescript
import Store from "electron-store";

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const store = new Store<{ windowState: WindowState }>();

function getWindowState(): WindowState {
  return store.get("windowState", {
    width: 1200,
    height: 800,
    isMaximized: false,
  });
}

function saveWindowState(window: BrowserWindow) {
  const isMaximized = window.isMaximized();
  if (!isMaximized) {
    const bounds = window.getBounds();
    store.set("windowState", { ...bounds, isMaximized });
  } else {
    store.set("windowState.isMaximized", true);
  }
}

export function createMainWindow(): BrowserWindow {
  const state = getWindowState();

  const window = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    // ... other options
  });

  if (state.isMaximized) {
    window.maximize();
  }

  window.on("close", () => saveWindowState(window));

  return window;
}
```

## Window Events

```typescript
mainWindow.on("focus", () => {
  /* Window gained focus */
});
mainWindow.on("blur", () => {
  /* Window lost focus */
});
mainWindow.on("maximize", () => {
  /* Window maximized */
});
mainWindow.on("unmaximize", () => {
  /* Window restored from maximize */
});
mainWindow.on("minimize", () => {
  /* Window minimized */
});
mainWindow.on("restore", () => {
  /* Window restored from minimize */
});
mainWindow.on("resize", () => {
  /* Window resized */
});
mainWindow.on("move", () => {
  /* Window moved */
});
mainWindow.on("enter-full-screen", () => {
  /* Entered fullscreen */
});
mainWindow.on("leave-full-screen", () => {
  /* Left fullscreen */
});
```

## Best Practices

1. **Use `show: false` + `ready-to-show`** — prevents white flash on window creation
2. **Set `backgroundColor`** — matches your app's theme for smooth window appearance
3. **Persist window state** — restore position and size across app restarts
4. **Null out references** — set window references to `null` on `closed` event
5. **Use window IDs** — manage multiple windows with a Map-based manager
6. **Set minimum dimensions** — prevent unusable tiny windows with `minWidth`/`minHeight`
