---
name: html-metadata
description: "HTML metadata & head — charset, viewport, title, meta tags, Open Graph, Twitter Cards, structured data, favicon, canonical URL, SEO. Use when: writing <head> content; setting up meta tags; SEO optimization; social sharing previews; favicon setup. DO NOT USE FOR: body content; performance hints (use html-performance)."
---

# HTML Metadata & Head

## 1. Essential Head Elements

```html
<head>
  <!-- Character encoding (must be first, within first 1024 bytes) -->
  <meta charset="UTF-8" />

  <!-- Viewport for responsive design -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Page title (unique per page, WCAG 2.4.2) -->
  <title>Page Title — Site Name</title>

  <!-- Meta description (SEO, search result snippet) -->
  <meta name="description" content="A concise 150-160 char description of the page content." />

  <!-- Canonical URL (prevents duplicate content) -->
  <link rel="canonical" href="https://example.com/page" />
</head>
```

### Title Best Practices

- Unique per page (max ~60 characters for search results).
- Pattern: `Page Title — Site Name` or `Page Title | Site Name`.
- Descriptive: tells users and screen readers what the page is about.

---

## 2. SEO Meta Tags

```html
<!-- Robots directive -->
<meta name="robots" content="index, follow" />
<!-- noindex: don't show in search; nofollow: don't follow links -->
<meta name="robots" content="noindex, nofollow" />

<!-- Author -->
<meta name="author" content="Jane Doe" />

<!-- Theme color (browser UI tinting) -->
<meta name="theme-color" content="#1a1a2e" />
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)" />

<!-- Language alternatives (hreflang) -->
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

---

## 3. Open Graph (Facebook, LinkedIn, etc.)

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Concise page description." />
<meta property="og:image" content="https://example.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Description of the image" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:site_name" content="Site Name" />
<meta property="og:locale" content="en_US" />
```

### og:type Values

| Type      | Use Case                  |
| --------- | ------------------------- |
| `website` | Default for most pages    |
| `article` | Blog posts, news articles |
| `profile` | User/author profile pages |
| `product` | Product detail pages      |

### Image Guidelines

- Recommended size: 1200×630 pixels.
- Minimum size: 600×315 pixels.
- Format: JPEG or PNG (< 8 MB).
- Always include `og:image:alt`.

---

## 4. Twitter Cards

```html
<!-- Summary card (small image) -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Concise page description." />
<meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
<meta name="twitter:image:alt" content="Description of the image" />
<meta name="twitter:site" content="@SiteHandle" />

<!-- Large image card -->
<meta name="twitter:card" content="summary_large_image" />
```

### Card Types

| Card                  | Image Size  | Use Case              |
| --------------------- | ----------- | --------------------- |
| `summary`             | 144×144 min | General content       |
| `summary_large_image` | 600×314 min | Visual content, blogs |
| `player`              | N/A         | Video/audio embeds    |
| `app`                 | N/A         | App download links    |

---

## 5. Favicon & App Icons

```html
<!-- Standard favicon -->
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />

<!-- Apple touch icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<!-- 180×180 px -->

<!-- Web app manifest -->
<link rel="manifest" href="/site.webmanifest" />
```

### Minimal `site.webmanifest`

```json
{
  "name": "My App",
  "short_name": "App",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#ffffff"
}
```

---

## 6. Stylesheets & Fonts

```html
<!-- External stylesheet -->
<link rel="stylesheet" href="/css/main.css" />

<!-- Preload critical CSS -->
<link rel="preload" href="/css/critical.css" as="style" />
<link rel="stylesheet" href="/css/critical.css" />

<!-- Google Fonts (optimized) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" />
```

---

## 7. Structured Data (JSON-LD)

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Understanding HTML Metadata",
    "author": {
      "@type": "Person",
      "name": "Jane Doe"
    },
    "datePublished": "2025-06-15",
    "image": "https://example.com/article-image.jpg",
    "publisher": {
      "@type": "Organization",
      "name": "Example Inc",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    }
  }
</script>
```

### Common Types

| Type             | Use Case                       |
| ---------------- | ------------------------------ |
| `Article`        | Blog posts, news               |
| `Product`        | E-commerce product pages       |
| `BreadcrumbList` | Breadcrumb navigation          |
| `FAQPage`        | FAQ sections                   |
| `Organization`   | Company/org info               |
| `LocalBusiness`  | Physical business with address |
| `WebSite`        | Sitelinks search box           |

---

## 8. Security Headers (via meta)

```html
<!-- Content Security Policy (basic, prefer HTTP header) -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
/>

<!-- Prevent MIME type sniffing (prefer HTTP header) -->
<meta http-equiv="X-Content-Type-Options" content="nosniff" />

<!-- Prevent clickjacking (prefer HTTP header) -->
<meta http-equiv="X-Frame-Options" content="DENY" />
```

> **Note:** HTTP headers are preferred for security policies. Use `<meta>` only as a fallback when you cannot control server headers.

---

## 9. Complete Head Template

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title — Site Name</title>
  <meta name="description" content="Page description in 150-160 characters." />
  <link rel="canonical" href="https://example.com/page" />

  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="32x32" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#1a1a2e" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Page description." />
  <meta property="og:image" content="https://example.com/og-image.jpg" />
  <meta property="og:image:alt" content="Image description" />
  <meta property="og:url" content="https://example.com/page" />
  <meta property="og:site_name" content="Site Name" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Page Title" />
  <meta name="twitter:description" content="Page description." />
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
  <meta name="twitter:image:alt" content="Image description" />

  <!-- Preconnect / Preload -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="/css/main.css" />
</head>
```

---

## 10. Anti-Patterns

| Anti-Pattern                        | Fix                                                |
| ----------------------------------- | -------------------------------------------------- |
| Missing `<meta charset="UTF-8">`    | Always first element in `<head>`                   |
| Missing `viewport` meta             | Add `width=device-width, initial-scale=1.0`        |
| Same `<title>` on every page        | Unique, descriptive title per page                 |
| Description > 160 characters        | Keep meta description to 150-160 chars             |
| No canonical URL                    | Add `<link rel="canonical">` to prevent duplicates |
| Missing `og:image`                  | Always include for social sharing previews         |
| `og:image` without `og:image:alt`   | Add alt text for accessibility                     |
| Favicon only as `.ico`              | Add SVG favicon and apple-touch-icon               |
| Security policies only in meta tags | Prefer HTTP response headers                       |
| No structured data                  | Add JSON-LD for rich search results                |
