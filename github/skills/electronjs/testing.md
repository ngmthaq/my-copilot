# Electron.js — Testing

## Overview

Electron apps have three testing layers: unit tests for isolated logic, integration tests for IPC and process communication, and end-to-end tests for full app behavior.

## Unit Testing (Main Process Logic)

Test main process services and utilities without launching Electron:

```typescript
// src/main/services/file-service.ts
import fs from "node:fs/promises";

export async function readFileContent(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export function isValidExtension(filePath: string, allowed: string[]): boolean {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  return allowed.includes(ext);
}
```

```typescript
// tests/unit/file-service.test.ts
import { describe, it, expect } from "vitest";
import { isValidExtension } from "../../src/main/services/file-service";

describe("file-service", () => {
  describe("isValidExtension", () => {
    it("returns true for allowed extensions", () => {
      expect(isValidExtension("test.txt", ["txt", "md"])).toBe(true);
    });

    it("returns false for disallowed extensions", () => {
      expect(isValidExtension("test.exe", ["txt", "md"])).toBe(false);
    });
  });
});
```

## Mocking Electron APIs

Use `vi.mock` to mock Electron modules in unit tests:

```typescript
// tests/unit/main-process.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Electron before importing modules that use it
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn((name: string) => `/mock/${name}`),
    getVersion: vi.fn(() => "1.0.0"),
    isPackaged: false,
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn(),
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadFile: vi.fn(),
    loadURL: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    show: vi.fn(),
    webContents: {
      send: vi.fn(),
      on: vi.fn(),
    },
  })),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn(),
  },
}));
```

## Testing IPC Handlers

```typescript
// tests/unit/ipc-handlers.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain } from "electron";
import { registerFileHandlers } from "../../src/main/ipc/file-handlers";

vi.mock("electron");

describe("file IPC handlers", () => {
  let handlers: Map<string, Function>;

  beforeEach(() => {
    handlers = new Map();
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      handlers.set(channel, handler);
    });

    registerFileHandlers();
  });

  it("registers file:open-dialog handler", () => {
    expect(handlers.has("file:open-dialog")).toBe(true);
  });

  it("file:read handler returns file content", async () => {
    const handler = handlers.get("file:read")!;
    vi.mock("node:fs/promises", () => ({
      readFile: vi.fn().mockResolvedValue("file content"),
    }));

    const result = await handler({}, "/valid/path.txt");
    expect(result).toBe("file content");
  });
});
```

## End-to-End Testing with Playwright

Playwright has built-in Electron support:

```bash
npm install -D @playwright/test
```

```typescript
// tests/e2e/app.spec.ts
import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";

let electronApp: Awaited<ReturnType<typeof electron.launch>>;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [path.join(__dirname, "../../dist/main/index.js")],
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  });
});

test.afterAll(async () => {
  await electronApp.close();
});

test("app window opens with correct title", async () => {
  const window = await electronApp.firstWindow();
  const title = await window.title();
  expect(title).toBe("My App");
});

test("app displays main content", async () => {
  const window = await electronApp.firstWindow();
  await window.waitForSelector("#app");
  const text = await window.textContent("#app");
  expect(text).toContain("Welcome");
});

test("file open dialog works", async () => {
  const window = await electronApp.firstWindow();

  // Evaluate in main process
  const version = await electronApp.evaluate(async ({ app }) => {
    return app.getVersion();
  });
  expect(version).toBeTruthy();
});

test("IPC communication works", async () => {
  const window = await electronApp.firstWindow();

  // Call preload-exposed API from renderer context
  const result = await window.evaluate(async () => {
    return await (window as any).electronAPI.getVersion();
  });
  expect(result).toMatch(/^\d+\.\d+\.\d+$/);
});
```

## Testing Preload Scripts

```typescript
// tests/unit/preload.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));

describe("preload script", () => {
  it("exposes electronAPI on window", async () => {
    const { contextBridge } = await import("electron");

    // Import preload to trigger exposeInMainWorld
    await import("../../src/preload/index");

    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith(
      "electronAPI",
      expect.objectContaining({
        getVersion: expect.any(Function),
      }),
    );
  });
});
```

## Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node", // Main process tests run in Node
    globals: true,
    coverage: {
      include: ["src/main/**", "src/preload/**"],
    },
  },
});
```

```typescript
// playwright.config.ts (for E2E)
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 1,
  use: {
    trace: "on-first-retry",
  },
});
```

## Test Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Best Practices

1. **Separate test layers** — unit tests for logic, E2E for full app behavior
2. **Mock Electron APIs** — don't launch Electron for unit tests
3. **Test IPC contracts** — verify handlers are registered and return expected data
4. **Use Playwright for E2E** — it has native Electron support
5. **Keep business logic testable** — extract logic from Electron-specific code into pure functions
6. **Test preload exposure** — verify the correct APIs are exposed to the renderer
7. **Set test timeouts** — Electron startup can be slow, use generous timeouts for E2E
