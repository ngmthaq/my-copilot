---
name: electronjs
description: "Unified Electron.js skill index — covers project conventions, main process & app lifecycle, renderer process & web content, preload scripts & context isolation, IPC communication (ipcMain/ipcRenderer/contextBridge), native OS APIs (dialogs, menus, tray, notifications, clipboard, shell), BrowserWindow management, security best practices (sandbox, CSP, nodeIntegration), auto-update with electron-updater, performance optimization & memory management, and testing Electron apps. Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Electron.js Skill

## Overview

This file is the top-level entry point for all Electron.js-related topics. It identifies the right sub-skill file to consult based on what the user is trying to accomplish. Each sub-skill file contains clear patterns, examples, and best practices for its domain.

---

## Sub-Skills Reference

| Domain                       | File                                         | When to use                                                                                            |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Conventions                  | [convention.md](convention.md)               | Project structure, naming rules, file organization, TypeScript setup, directory layout                 |
| Main Process & App Lifecycle | [main-process.md](main-process.md)           | App startup, ready event, window-all-closed, activate, single instance lock, app quit handling         |
| Renderer Process             | [renderer-process.md](renderer-process.md)   | Web content rendering, DOM manipulation, frontend framework integration, DevTools                      |
| Preload Scripts              | [preload-scripts.md](preload-scripts.md)     | Context isolation, contextBridge.exposeInMainWorld, sandboxed preload APIs                             |
| IPC Communication            | [ipc-communication.md](ipc-communication.md) | ipcMain.handle, ipcRenderer.invoke, send/on patterns, bidirectional messaging, typed IPC channels      |
| BrowserWindow Management     | [browser-window.md](browser-window.md)       | Creating windows, window options, frameless windows, multi-window, parent/child, modal, webPreferences |
| Native OS APIs               | [native-apis.md](native-apis.md)             | Dialogs, menus (app/context), tray, notifications, clipboard, shell, screen, powerMonitor, nativeTheme |
| Security                     | [security.md](security.md)                   | Context isolation, sandbox, CSP, nodeIntegration, webSecurity, permission handling, safe practices     |
| Auto-Update                  | [auto-update.md](auto-update.md)             | electron-updater setup, update lifecycle, differential updates, custom update UI, code signing         |
| Performance                  | [performance.md](performance.md)             | Startup optimization, memory management, lazy loading, process monitoring, reducing bundle size        |
| Testing                      | [testing.md](testing.md)                     | Unit testing main/renderer, integration tests, Playwright/Spectron, mocking Electron APIs              |

---

## Quick Decision Guide

```
What are you trying to do?
│
├── Set up project structure, naming, or file layout?
│   └── → convention.md
│
├── Handle app startup, lifecycle events, or quit behavior?
│   └── → main-process.md
│
├── Render web content, integrate a frontend framework, or use DevTools?
│   └── → renderer-process.md
│
├── Write a preload script or expose APIs safely to the renderer?
│   └── → preload-scripts.md
│
├── Communicate between main and renderer processes?
│   └── → ipc-communication.md
│
├── Create or manage BrowserWindows (options, frameless, multi-window)?
│   └── → browser-window.md
│
├── Use native OS features (dialogs, menus, tray, notifications, clipboard)?
│   └── → native-apis.md
│
├── Harden security (CSP, sandbox, permissions, context isolation)?
│   └── → security.md
│
├── Set up auto-update for your Electron app?
│   └── → auto-update.md
│
├── Optimize startup time, memory usage, or overall performance?
│   └── → performance.md
│
└── Write tests for your Electron app?
    └── → testing.md
```

---

## How to Use This Skill

1. **Identify the goal** using the Quick Decision Guide above.
2. **Load the corresponding sub-skill file** with `read_file`.
3. **Follow the patterns and examples** in that file to produce the response.
4. **Load multiple sub-skill files** when the task spans domains — for example, a new feature typically involves `ipc-communication.md` + `preload-scripts.md` + `security.md`.
