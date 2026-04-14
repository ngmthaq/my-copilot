# Electron.js — Security

## Security Checklist

| Setting                       | Required Value | Default | Notes                          |
| ----------------------------- | -------------- | ------- | ------------------------------ |
| `contextIsolation`            | `true`         | `true`  | Never disable                  |
| `nodeIntegration`             | `false`        | `false` | Never enable in renderer       |
| `sandbox`                     | `true`         | `true`  | Restricts preload capabilities |
| `webSecurity`                 | `true`         | `true`  | Enforces same-origin policy    |
| `allowRunningInsecureContent` | `false`        | `false` | Never allow mixed content      |
| `experimentalFeatures`        | `false`        | `false` | Avoid unless absolutely needed |
| `enableBlinkFeatures`         | unset          | unset   | Don't enable Blink features    |

## Secure BrowserWindow Configuration

```typescript
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "../preload/index.js"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    // Do NOT set these:
    // nodeIntegrationInWorker: false,
    // nodeIntegrationInSubFrames: false,
    // experimentalFeatures: false,
    // enableBlinkFeatures: "",
  },
});
```

## Content Security Policy

Set CSP in your HTML to control what resources can load:

```html
<!-- Strict CSP for production -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  "
/>
```

For development with a dev server:

```html
<!-- Development CSP (allows localhost dev server) -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self' http://localhost:*;
    script-src 'self' http://localhost:* 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    connect-src 'self' http://localhost:* ws://localhost:*;
  "
/>
```

Set CSP via session headers (recommended for production):

```typescript
import { session } from "electron";

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
        ],
      },
    });
  });
});
```

## Navigation & New Window Protection

Prevent the renderer from navigating to untrusted URLs:

```typescript
// Block all navigation away from the app
mainWindow.webContents.on("will-navigate", (event, url) => {
  const parsedUrl = new URL(url);
  const allowedOrigins = ["http://localhost:5173", "file://"];

  if (!allowedOrigins.some((origin) => url.startsWith(origin))) {
    event.preventDefault();
    // Optionally open in external browser
    shell.openExternal(url);
  }
});

// Control new window creation
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  // Open all new window requests in external browser
  shell.openExternal(url);
  return { action: "deny" };
});
```

## Permission Handling

Control what permissions the renderer can request:

```typescript
import { session } from "electron";

session.defaultSession.setPermissionRequestHandler(
  (webContents, permission, callback) => {
    const allowedPermissions = ["clipboard-read", "notifications"];

    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      console.warn(`Denied permission: ${permission}`);
      callback(false);
    }
  },
);

// Check permission status
session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
  const allowedPermissions = ["clipboard-read", "notifications"];
  return allowedPermissions.includes(permission);
});
```

## IPC Validation

Always validate data received through IPC in the main process:

```typescript
import { ipcMain } from "electron";
import path from "node:path";

ipcMain.handle("file:read", async (_event, filePath: string) => {
  // Validate input type
  if (typeof filePath !== "string") {
    throw new Error("File path must be a string");
  }

  // Prevent path traversal
  const resolvedPath = path.resolve(filePath);
  const allowedDir = path.resolve(app.getPath("userData"));

  if (!resolvedPath.startsWith(allowedDir)) {
    throw new Error("Access denied: path outside allowed directory");
  }

  return fs.readFile(resolvedPath, "utf-8");
});
```

## Electron Fuses

Fuses are compile-time flags that disable certain Electron features at the binary level:

```typescript
// Using @electron/fuses with Electron Forge
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

// In forge.config.ts plugins array:
new FusesPlugin({
  version: FuseVersion.V1,
  [FuseV1Options.RunAsNode]: false, // Disable ELECTRON_RUN_AS_NODE
  [FuseV1Options.EnableCookieEncryption]: true, // Encrypt cookies
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // Disable NODE_OPTIONS
  [FuseV1Options.EnableNodeCliInspectArguments]: false, // Disable --inspect
  [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true, // Validate asar
  [FuseV1Options.OnlyLoadAppFromAsar]: true, // Only load from asar
});
```

## Protocol Security

Register custom protocols securely:

```typescript
import { protocol } from "electron";

// Register before app.whenReady()
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false,
    },
  },
]);
```

## Session Security

```typescript
import { session } from "electron";

app.whenReady().then(() => {
  // Disable remote module globally
  // Clear storage data on quit (if needed for sensitive apps)
  // Configure certificate verification
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    // Use default certificate verification
    callback(-3); // Use Chromium's default verification
  });
});
```

## Security Anti-Patterns

```typescript
// NEVER do these:

// ❌ Enable node integration in renderer
{
  nodeIntegration: true;
}

// ❌ Disable context isolation
{
  contextIsolation: false;
}

// ❌ Disable web security
{
  webSecurity: false;
}

// ❌ Load remote content with node integration
mainWindow.loadURL("https://untrusted-site.com");

// ❌ Use eval() or new Function() with user input
eval(userInput);

// ❌ Expose entire ipcRenderer
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);

// ❌ Use shell.openExternal with unvalidated URLs
shell.openExternal(userProvidedUrl); // Validate first!
```

## Best Practices

1. **Keep Electron updated** — security patches are released frequently
2. **Enable all security defaults** — don't disable contextIsolation, sandbox, or webSecurity
3. **Set CSP headers** — restrict what resources the renderer can load
4. **Validate all IPC inputs** — the renderer is an untrusted boundary
5. **Prevent path traversal** — validate file paths against allowed directories
6. **Use Electron Fuses** — disable unneeded features at the binary level
7. **Block navigation** — prevent renderer from navigating to untrusted origins
8. **Control permissions** — only grant permissions your app actually needs
9. **Don't load remote content** — if you must, treat it as completely untrusted
10. **Code sign your app** — prevents tampering with the distributed binary

## Related Skills

For **Electron Fuses configuration** and **code signing**, load the `electron-forge` skill (see `plugins.md` and `code-signing.md`).
