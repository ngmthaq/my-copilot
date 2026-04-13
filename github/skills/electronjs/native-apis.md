# Electron.js — Native OS APIs

## Dialogs

```typescript
import { dialog, BrowserWindow } from "electron";

// Open file dialog
async function openFileDialog(parentWindow: BrowserWindow) {
  const result = await dialog.showOpenDialog(parentWindow, {
    title: "Open File",
    defaultPath: app.getPath("documents"),
    filters: [
      { name: "Text Files", extensions: ["txt", "md"] },
      { name: "All Files", extensions: ["*"] },
    ],
    properties: ["openFile"], // "openDirectory", "multiSelections", "showHiddenFiles"
  });

  if (result.canceled) return null;
  return result.filePaths[0];
}

// Save file dialog
async function saveFileDialog(parentWindow: BrowserWindow) {
  const result = await dialog.showSaveDialog(parentWindow, {
    title: "Save File",
    defaultPath: path.join(app.getPath("documents"), "untitled.txt"),
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });

  if (result.canceled) return null;
  return result.filePath;
}

// Message box
async function showConfirmDialog(parentWindow: BrowserWindow) {
  const result = await dialog.showMessageBox(parentWindow, {
    type: "question", // "none", "info", "error", "question", "warning"
    title: "Confirm",
    message: "Are you sure you want to delete this?",
    detail: "This action cannot be undone.",
    buttons: ["Cancel", "Delete"],
    defaultId: 0,
    cancelId: 0,
  });

  return result.response === 1; // true if "Delete" clicked
}

// Error dialog (synchronous, works before app is ready)
dialog.showErrorBox("Fatal Error", "The application encountered an unrecoverable error.");
```

## Application Menu

```typescript
import { Menu, app, shell, BrowserWindow } from "electron";

const isMac = process.platform === "darwin";

const template: Electron.MenuItemConstructorOptions[] = [
  // macOS app menu
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" as const },
            { type: "separator" as const },
            { role: "services" as const },
            { type: "separator" as const },
            { role: "hide" as const },
            { role: "hideOthers" as const },
            { role: "unhide" as const },
            { type: "separator" as const },
            { role: "quit" as const },
          ],
        },
      ]
    : []),

  // File menu
  {
    label: "File",
    submenu: [
      {
        label: "Open File",
        accelerator: "CmdOrCtrl+O",
        click: async () => {
          const window = BrowserWindow.getFocusedWindow();
          if (window) await openFileDialog(window);
        },
      },
      { type: "separator" },
      isMac ? { role: "close" } : { role: "quit" },
    ],
  },

  // Edit menu
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },

  // View menu
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },

  // Help menu
  {
    label: "Help",
    submenu: [
      {
        label: "Documentation",
        click: () => shell.openExternal("https://example.com/docs"),
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
```

## Context Menu

```typescript
import { Menu, BrowserWindow } from "electron";
import { ipcMain } from "electron";

ipcMain.on("show-context-menu", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Cut",
      role: "cut",
    },
    {
      label: "Copy",
      role: "copy",
    },
    {
      label: "Paste",
      role: "paste",
    },
    { type: "separator" },
    {
      label: "Inspect Element",
      click: () => event.sender.inspectElement(0, 0),
    },
  ]);

  contextMenu.popup({ window });
});
```

## System Tray

```typescript
import { Tray, Menu, nativeImage, app } from "electron";

let tray: Tray | null = null;

export function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "../../resources/tray-icon.png"));

  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip(app.name);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => mainWindow?.show() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);

  // Click tray icon to show/hide window
  tray.on("click", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
}
```

## Notifications

```typescript
import { Notification } from "electron";

function showNotification(title: string, body: string) {
  if (!Notification.isSupported()) return;

  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, "../../resources/icon.png"),
    silent: false,
  });

  notification.on("click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  notification.show();
}
```

## Clipboard

```typescript
import { clipboard, nativeImage } from "electron";

// Text
clipboard.writeText("Hello, World!");
const text = clipboard.readText();

// HTML
clipboard.writeHTML("<b>Bold</b>");
const html = clipboard.readHTML();

// Image
const image = nativeImage.createFromPath("/path/to/image.png");
clipboard.writeImage(image);
const clipImage = clipboard.readImage();
```

## Shell

```typescript
import { shell } from "electron";

// Open URL in default browser
shell.openExternal("https://example.com");

// Open file in default application
shell.openPath("/path/to/file.pdf");

// Show file in file manager
shell.showItemInFolder("/path/to/file.txt");

// Move file to trash
shell.trashItem("/path/to/file.txt");
```

## Screen & Display

```typescript
import { screen } from "electron";

// Get primary display info
const primaryDisplay = screen.getPrimaryDisplay();
const { width, height } = primaryDisplay.workAreaSize;

// Get all displays
const displays = screen.getAllDisplays();

// Get display nearest to a point
const display = screen.getDisplayNearestPoint({ x: 100, y: 100 });
```

## Power Monitor

```typescript
import { powerMonitor } from "electron";

powerMonitor.on("suspend", () => {
  // System is going to sleep
});

powerMonitor.on("resume", () => {
  // System woke up
});

powerMonitor.on("on-ac", () => {
  // Switched to AC power
});

powerMonitor.on("on-battery", () => {
  // Switched to battery power
});

powerMonitor.on("lock-screen", () => {
  // Screen was locked
});

powerMonitor.on("unlock-screen", () => {
  // Screen was unlocked
});
```

## Native Theme

```typescript
import { nativeTheme } from "electron";

// Check current theme
const isDark = nativeTheme.shouldUseDarkColors;
const themeSource = nativeTheme.themeSource; // "system", "light", "dark"

// Set theme
nativeTheme.themeSource = "dark"; // "system", "light", "dark"

// Listen for theme changes
nativeTheme.on("updated", () => {
  const isDark = nativeTheme.shouldUseDarkColors;
  mainWindow?.webContents.send("theme-changed", isDark);
});
```

## Best Practices

1. **Always pass `parentWindow`** to dialogs — ensures proper modal behavior and OS integration
2. **Handle macOS menu differences** — macOS expects app name as first menu item
3. **Use `CmdOrCtrl`** for accelerators — works on both macOS and Windows/Linux
4. **Resize tray icons** — use 16x16 on macOS, 16x16 or 32x32 on Windows
5. **Check `Notification.isSupported()`** — before attempting to show notifications
6. **Use `shell.openExternal`** — never load untrusted URLs inside your app windows
