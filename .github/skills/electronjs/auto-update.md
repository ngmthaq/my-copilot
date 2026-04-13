# Electron.js — Auto-Update

## Overview

Use `electron-updater` (from `electron-builder`) for auto-update functionality. It supports differential updates, multiple platforms, and custom update servers.

## Setup with electron-updater

```bash
npm install electron-updater
```

```typescript
// src/main/services/auto-updater.ts
import { autoUpdater } from "electron-updater";
import { BrowserWindow } from "electron";
import log from "electron-log";

autoUpdater.logger = log;
autoUpdater.autoDownload = false; // Let user decide when to download
autoUpdater.autoInstallOnAppQuit = true;

export function initAutoUpdater(mainWindow: BrowserWindow) {
  // Check for updates
  autoUpdater.checkForUpdates();

  // Update available
  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update:available", {
      version: info.version,
      releaseNotes: info.releaseNotes,
    });
  });

  // No update available
  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update:not-available");
  });

  // Download progress
  autoUpdater.on("download-progress", (progress) => {
    mainWindow.webContents.send("update:download-progress", {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  // Update downloaded — ready to install
  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update:downloaded");
  });

  // Error
  autoUpdater.on("error", (error) => {
    mainWindow.webContents.send("update:error", error.message);
  });
}

// IPC handlers for user-initiated actions
export function registerUpdateHandlers() {
  ipcMain.handle("update:check", async () => {
    const result = await autoUpdater.checkForUpdates();
    return result?.updateInfo;
  });

  ipcMain.handle("update:download", async () => {
    await autoUpdater.downloadUpdate();
  });

  ipcMain.handle("update:install", () => {
    autoUpdater.quitAndInstall(false, true);
  });
}
```

## Preload API for Updates

```typescript
// src/preload/index.ts
contextBridge.exposeInMainWorld("electronAPI", {
  // Update actions
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  downloadUpdate: () => ipcRenderer.invoke("update:download"),
  installUpdate: () => ipcRenderer.invoke("update:install"),

  // Update event listeners
  onUpdateAvailable: (callback: (info: { version: string }) => void) => {
    const handler = (_event: any, info: any) => callback(info);
    ipcRenderer.on("update:available", handler);
    return () => ipcRenderer.removeListener("update:available", handler);
  },
  onDownloadProgress: (callback: (progress: { percent: number }) => void) => {
    const handler = (_event: any, progress: any) => callback(progress);
    ipcRenderer.on("update:download-progress", handler);
    return () => ipcRenderer.removeListener("update:download-progress", handler);
  },
  onUpdateDownloaded: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on("update:downloaded", handler);
    return () => ipcRenderer.removeListener("update:downloaded", handler);
  },
});
```

## Publishing Configuration

### GitHub Releases

```yaml
# electron-builder.yml
publish:
  provider: github
  owner: your-username
  repo: your-repo
```

### Generic Server

```yaml
publish:
  provider: generic
  url: https://your-update-server.com/releases
```

### S3

```yaml
publish:
  provider: s3
  bucket: your-bucket
  region: us-east-1
```

## Update Flow

```
1. App starts → checkForUpdates()
2. If update available → notify user
3. User clicks "Download" → downloadUpdate()
4. Download progress → show progress bar
5. Download complete → notify user
6. User clicks "Install" → quitAndInstall()
7. App restarts with new version
```

## Periodic Update Checks

```typescript
// Check every 4 hours
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000;

function startPeriodicUpdateCheck() {
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {
      // Silently fail — user may be offline
    });
  }, UPDATE_CHECK_INTERVAL);
}
```

## Code Signing

Auto-update requires code-signed applications on macOS and Windows:

- **macOS**: Apple Developer ID certificate
- **Windows**: EV or standard code signing certificate
- **Linux**: No code signing needed for most update mechanisms

Without code signing, the OS will block the update or show scary warnings.

## Best Practices

1. **Don't auto-download by default** — let users choose when to download (bandwidth concerns)
2. **Show release notes** — tell users what's in the update
3. **Handle offline gracefully** — catch errors from update checks silently
4. **Test updates in staging** — use a staging update channel before production
5. **Code sign your app** — required for auto-update on macOS and Windows
6. **Use differential updates** — electron-updater supports delta updates to minimize download size
7. **Provide manual download fallback** — in case auto-update fails

## Related Skills

For **code signing and publishing** configuration, load the `electron-forge` skill (see `code-signing.md` and `publishers.md`).
