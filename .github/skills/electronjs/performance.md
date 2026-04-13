# Electron.js — Performance Optimization

## Startup Optimization

### Defer Non-Critical Work

```typescript
// src/main/index.ts
app.whenReady().then(async () => {
  // CRITICAL: Create and show window first
  const mainWindow = createMainWindow();

  // DEFERRED: Non-critical initialization after window is visible
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Defer non-essential work
    setImmediate(() => {
      registerIpcHandlers();
      initAutoUpdater(mainWindow);
      createTray();
    });
  });
});
```

### Lazy Module Loading

```typescript
// Don't import heavy modules at the top level
// import heavyModule from "heavy-module"; // ❌

// Lazy load when needed
async function processFile(filePath: string) {
  const { processData } = await import("./services/heavy-processor");
  return processData(filePath);
}
```

### Preload Script Optimization

Keep preload scripts minimal — they run before every page load:

```typescript
// GOOD — minimal preload
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
});

// BAD — importing heavy modules in preload
// import someHeavyLib from "some-heavy-lib"; // ❌ Slows down every window
```

## Memory Management

### Monitor Memory Usage

```typescript
// Main process memory
const mainMemory = process.memoryUsage();
console.log(`Heap used: ${Math.round(mainMemory.heapUsed / 1024 / 1024)}MB`);

// Renderer process memory
mainWindow.webContents.on("render-process-gone", (_event, details) => {
  console.error("Renderer crashed:", details.reason);
});

// Get all process metrics
const metrics = app.getAppMetrics();
metrics.forEach((metric) => {
  console.log(`${metric.type}: ${Math.round(metric.memory.workingSetSize / 1024)}MB`);
});
```

### Prevent Memory Leaks

```typescript
// Clean up IPC listeners when windows close
mainWindow.on("closed", () => {
  ipcMain.removeHandler("some-channel");
  ipcMain.removeAllListeners("some-event");
  mainWindow = null;
});

// Clean up intervals and timeouts
let updateInterval: NodeJS.Timeout | null = null;

function startUpdates() {
  updateInterval = setInterval(() => checkForUpdates(), 60000);
}

function stopUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

app.on("before-quit", stopUpdates);
```

## Process Architecture

### Utility Process (Electron 22+)

Offload heavy computation to a utility process (replaces worker threads for Electron-specific work):

```typescript
import { utilityProcess } from "electron";
import path from "node:path";

const child = utilityProcess.fork(path.join(__dirname, "heavy-worker.js"));

child.postMessage({ type: "process", data: largeDataSet });

child.on("message", (result) => {
  console.log("Processing complete:", result);
});

child.on("exit", (code) => {
  console.log(`Worker exited with code ${code}`);
});
```

```typescript
// heavy-worker.js (utility process entry)
process.parentPort.on("message", (event) => {
  const { type, data } = event.data;

  if (type === "process") {
    const result = expensiveComputation(data);
    process.parentPort.postMessage({ type: "result", data: result });
  }
});
```

### Worker Threads (for CPU-intensive tasks)

```typescript
import { Worker } from "node:worker_threads";

function runInWorker<T>(workerPath: string, data: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
}
```

## Renderer Performance

### Lazy Load Windows

Don't create all windows at startup:

```typescript
// Create windows on demand
let settingsWindow: BrowserWindow | null = null;

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    /* options */
  });
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}
```

### Hidden Window for Background Tasks

```typescript
const backgroundWindow = new BrowserWindow({
  show: false,
  webPreferences: {
    preload: path.join(__dirname, "../preload/background.js"),
  },
});

backgroundWindow.loadFile("background.html");
```

## Bundle Size Optimization

### Exclude Unnecessary Files from ASAR

```javascript
// forge.config.ts or electron-builder config
{
  packagerConfig: {
    ignore: [
      /\.git/,
      /node_modules\/.*\/test/,
      /node_modules\/.*\/docs/,
      /\.md$/,
      /\.map$/,
    ],
  },
}
```

### Use V8 Snapshots

For faster startup, use V8 snapshots to pre-compile JavaScript:

```typescript
// This is an advanced optimization typically done through electron-link
// or custom snapshot scripts — only use if startup time is critical
```

## Performance Monitoring

```typescript
// Track window load time
const startTime = Date.now();

mainWindow.webContents.on("did-finish-load", () => {
  const loadTime = Date.now() - startTime;
  console.log(`Window loaded in ${loadTime}ms`);
});

// Track IPC latency
ipcMain.handle("ping", () => {
  return Date.now();
});
```

## Best Practices

1. **Show the window first, initialize later** — perceived performance matters
2. **Lazy load modules** — use dynamic `import()` for heavy dependencies
3. **Offload CPU work** — use utility processes or worker threads, never block the main process
4. **Clean up resources** — remove event listeners, clear intervals, null out references
5. **Monitor memory** — use `app.getAppMetrics()` to track process memory usage
6. **Minimize preload scripts** — they run before every page load
7. **Exclude unnecessary files** — reduce ASAR size for faster startup
8. **Create windows on demand** — don't pre-create windows that may not be used
