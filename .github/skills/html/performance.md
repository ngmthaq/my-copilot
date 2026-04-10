---
name: html-performance
description: "HTML performance optimization — resource hints (preload, prefetch, preconnect, dns-prefetch), lazy loading, async/defer scripts, fetchpriority, critical rendering path, inline critical CSS, document order. Use when: optimizing page load; prioritizing resources; lazy loading below-fold content; deferring scripts. DO NOT USE FOR: CSS optimization; JavaScript bundling; server-side caching."
---

# HTML Performance Optimization

## 1. Resource Hints

### Preconnect (Early Connection Setup)

```html
<!-- Establish early connection to critical third-party origins -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
```

- Use for origins you **will** fetch from within seconds.
- `crossorigin` required for font files and CORS resources.
- Limit to 2-4 origins — each connection has a cost.

### DNS Prefetch (Lightweight Alternative)

```html
<!-- Resolve DNS only (cheaper than preconnect) -->
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

- Use for origins that are used but not critical-path.
- Negligible cost — safe to use more liberally than preconnect.

### Preload (Force Early Fetch)

```html
<!-- Preload critical resources discovered late by browser -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/css/critical.css" as="style" />
<link rel="preload" href="/img/hero.avif" as="image" />
<link rel="preload" href="/js/app.js" as="script" />

<!-- Responsive preload -->
<link rel="preload" href="/img/hero-mobile.jpg" as="image" media="(max-width: 640px)" />
<link rel="preload" href="/img/hero-desktop.jpg" as="image" media="(min-width: 641px)" />
```

### `as` Values Reference

| Value      | Resource Type      |
| ---------- | ------------------ |
| `script`   | JavaScript         |
| `style`    | CSS                |
| `font`     | Font files         |
| `image`    | Images             |
| `fetch`    | Fetch/XHR requests |
| `document` | HTML (iframes)     |
| `video`    | Video files        |
| `audio`    | Audio files        |

### Prefetch (Next Navigation)

```html
<!-- Fetch resources for likely next navigation -->
<link rel="prefetch" href="/next-page.html" />
<link rel="prefetch" href="/js/dashboard.js" as="script" />
```

- Low priority — fetched when browser is idle.
- Use for resources needed on the **next** page, not current.

### Modulepreload (ES Modules)

```html
<!-- Preload ES modules and their dependencies -->
<link rel="modulepreload" href="/js/app.mjs" />
<link rel="modulepreload" href="/js/utils.mjs" />
```

---

## 2. Script Loading

### Async vs Defer vs Blocking

```html
<!-- Blocking (default): blocks HTML parsing — avoid -->
<script src="/js/legacy.js"></script>

<!-- Async: downloads in parallel, executes ASAP (can interrupt parsing) -->
<script src="/js/analytics.js" async></script>

<!-- Defer: downloads in parallel, executes after parsing in order -->
<script src="/js/app.js" defer></script>

<!-- Module: deferred by default -->
<script type="module" src="/js/app.mjs"></script>
```

### Decision Guide

```
Is this a critical rendering script?
│
├─ Yes → Place before </body> or use defer
│
├─ No → Does execution order matter?
│   ├─ Yes → defer (maintains order)
│   └─ No → async (analytics, ads, third-party)
│
└─ Is it an ES module?
    └─ <script type="module"> (deferred by default)
```

### Inline Critical JavaScript

```html
<!-- Small critical JS can be inlined -->
<script>
  // Theme detection to avoid FOUC
  document.documentElement.dataset.theme = localStorage.getItem("theme") || "light";
</script>
```

---

## 3. CSS Loading

### Critical CSS Inline

```html
<head>
  <!-- Inline critical above-the-fold styles -->
  <style>
    /* Only styles needed for initial render */
    body {
      margin: 0;
      font-family: system-ui;
    }
    .header {
      background: #1a1a2e;
      color: #fff;
      padding: 1rem;
    }
    .hero {
      min-height: 60vh;
    }
  </style>

  <!-- Load full CSS asynchronously -->
  <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/css/main.css" /></noscript>
</head>
```

### Print and Media-Specific CSS

```html
<!-- Browser won't block render for non-matching media -->
<link rel="stylesheet" href="/css/print.css" media="print" />
<link rel="stylesheet" href="/css/desktop.css" media="(min-width: 1024px)" />
```

---

## 4. Image Optimization

### Fetchpriority

```html
<!-- High priority: LCP image -->
<img src="/hero.jpg" alt="..." fetchpriority="high" loading="eager" width="1200" height="600" />

<!-- Low priority: below-fold decorative -->
<img src="/decoration.jpg" alt="" fetchpriority="low" loading="lazy" width="400" height="300" />
```

### Lazy Loading

```html
<!-- Lazy load below-the-fold images -->
<img src="/photo.jpg" alt="..." loading="lazy" width="800" height="600" />

<!-- Lazy load iframes -->
<iframe src="/widget" loading="lazy" title="Widget" width="600" height="400"></iframe>
```

### Rules

- Never lazy-load the LCP image.
- Always set `width` and `height` to prevent CLS.
- Use `fetchpriority="high"` on the LCP image.
- Use modern formats (AVIF > WebP > JPEG) via `<picture>`.

### Responsive Images (Performance)

```html
<img
  src="/img/photo-800.jpg"
  srcset="/img/photo-400.jpg 400w, /img/photo-800.jpg 800w, /img/photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="..."
  width="1200"
  height="800"
  loading="lazy"
  decoding="async"
/>
```

### Decoding

```html
<!-- Let browser decode image off main thread -->
<img src="/photo.jpg" alt="..." decoding="async" />
```

---

## 5. Document Order for Performance

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- 1. charset (must be first, within 1024 bytes) -->
    <meta charset="UTF-8" />

    <!-- 2. viewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- 3. title -->
    <title>Page Title</title>

    <!-- 4. Preconnect to critical origins -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <!-- 5. Preload critical resources -->
    <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

    <!-- 6. Critical inline styles -->
    <style>
      /* critical CSS */
    </style>

    <!-- 7. External stylesheets -->
    <link rel="stylesheet" href="/css/main.css" />

    <!-- 8. Deferred scripts -->
    <script src="/js/app.js" defer></script>

    <!-- 9. Async scripts (analytics, non-critical) -->
    <script src="/js/analytics.js" async></script>

    <!-- 10. Prefetch for next navigation -->
    <link rel="prefetch" href="/next-page.html" />

    <!-- 11. Meta tags, OG, etc. -->
    <meta name="description" content="..." />
  </head>
  <body>
    ...
  </body>
</html>
```

---

## 6. Preventing Layout Shift (CLS)

```html
<!-- Always set dimensions on replaced content -->
<img src="/photo.jpg" alt="..." width="800" height="600" />
<video width="640" height="360" poster="/thumb.jpg">...</video>
<iframe width="560" height="315" title="...">...</iframe>
<canvas width="300" height="150"></canvas>

<!-- CSS aspect-ratio for responsive sizing -->
<style>
  .video-wrapper {
    aspect-ratio: 16 / 9;
    width: 100%;
  }
</style>
```

### Common CLS Causes

| Cause                              | Fix                                       |
| ---------------------------------- | ----------------------------------------- |
| Images without dimensions          | Set `width` and `height` attributes       |
| Web fonts causing FOUT/FOIT        | `font-display: swap` + preload font files |
| Dynamically injected content above | Reserve space with min-height or skeleton |
| Ads/embeds without reserved space  | Use fixed containers with aspect-ratio    |
| Late-loading CSS shifting layout   | Inline critical CSS, preload the rest     |

---

## 7. Prerendering & Speculation Rules

```html
<!-- Speculation Rules API (Chrome 121+) -->
<script type="speculationrules">
  {
    "prerender": [
      {
        "where": { "href_matches": "/products/*" },
        "eagerness": "moderate"
      }
    ],
    "prefetch": [
      {
        "urls": ["/about", "/pricing"]
      }
    ]
  }
</script>
```

- `prerender`: Fully renders the page in background (instant navigation).
- `prefetch`: Fetches the page resources only.
- `eagerness`: `immediate`, `eager`, `moderate`, `conservative`.

---

## 8. Anti-Patterns

| Anti-Pattern                                   | Fix                                             |
| ---------------------------------------------- | ----------------------------------------------- |
| Render-blocking `<script>` in `<head>`         | Use `defer` or `async`; move to end of `<body>` |
| Render-blocking CSS for non-critical styles    | Inline critical CSS, async-load the rest        |
| Too many preconnects (> 4-6)                   | Limit to critical origins only                  |
| Preloading resources not used within 3 seconds | Only preload what's needed for initial render   |
| `loading="lazy"` on LCP image                  | Use `loading="eager"` + `fetchpriority="high"`  |
| Missing `width`/`height` on images             | Always set to prevent CLS                       |
| Synchronous third-party scripts                | Load with `async` or behind user interaction    |
| Large inline `<style>` blocks (> 14 KB)        | Keep inline CSS minimal, load rest externally   |
| No `font-display: swap` on web fonts           | Add to prevent invisible text during font load  |
| Preloading unused resources                    | Audit with Lighthouse; remove unused preloads   |
