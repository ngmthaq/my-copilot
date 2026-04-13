---
name: vite-asset-handling
description: "Vite asset handling — public folder, importing images/SVGs/fonts, CSS modules, and controlling inline vs URL output. Use when working with static assets in a Vite project."
---

# Vite Asset Handling

## 1. The public/ Folder

Files in `public/` are served at the root URL and are never processed by Vite (no hashing, no transforms).

```
public/
  favicon.ico       → served at /favicon.ico
  robots.txt        → served at /robots.txt
  logo.png          → served at /logo.png
```

Reference them with absolute paths in code:

```html
<img src="/logo.png" />
```

> Use `public/` only for files that need a fixed URL. For anything you import in JS/TS, put it in `src/assets/`.

---

## 2. Importing Images

Images imported in JS/TS are processed by Vite (hashed filename, inlined if small):

```typescript
import logo from './assets/logo.png';

// In JSX:
<img src={logo} alt="Logo" />
```

The imported value is a URL string at runtime.

---

## 3. Importing SVGs

```typescript
// As a URL string (default):
import iconUrl from './assets/icon.svg';
<img src={iconUrl} />

// As a React component (needs @svgr/rollup plugin):
import { ReactComponent as Icon } from './assets/icon.svg?component';
<Icon className="icon" />
```

For SVG-as-component in React, use `vite-plugin-svgr`:

```bash
npm install -D vite-plugin-svgr
```

```typescript
import svgr from "vite-plugin-svgr";
export default defineConfig({ plugins: [svgr()] });
```

Then:

```typescript
import { ReactComponent as Icon } from "./icon.svg?react";
```

---

## 4. Importing Fonts

```css
/* src/styles/global.css */
@font-face {
  font-family: "MyFont";
  src: url("../assets/fonts/MyFont.woff2") format("woff2");
}
```

Or import the CSS file in `main.ts` and let Vite handle the font file.

---

## 5. CSS Modules

Name your CSS file `*.module.css` to enable CSS Modules (locally scoped class names):

```css
/* Button.module.css */
.button {
  background: blue;
  color: white;
}
```

```typescript
import styles from './Button.module.css';

export function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

Vite scopes class names automatically — no global collisions.

---

## 6. Controlling Inline vs URL

You can override the default 4 KB threshold per import using query suffixes:

```typescript
// Force inline as base64 (regardless of file size)
import smallIcon from "./icon.svg?inline";

// Force output as URL (never inline)
import logo from "./logo.png?url";

// Import file content as a raw string
import shaderCode from "./shader.glsl?raw";

// Import as a Web Worker
import MyWorker from "./worker.ts?worker";
const worker = new MyWorker();
```

---

## 7. JSON Imports

```typescript
import config from "./config.json"; // auto-parsed as object
console.log(config.version);
```
