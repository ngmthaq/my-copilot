---
name: html-media
description: "HTML media elements — images, responsive images (srcset, picture, sizes), video, audio, figure/figcaption, lazy loading, alt text, captions, tracks. Use when: embedding images, video, or audio; making images responsive; adding captions; lazy loading media. DO NOT USE FOR: CSS background images; JavaScript media manipulation; media players built with frameworks."
---

# HTML Media

## 1. Images

### Basic Image

```html
<!-- Informational image: descriptive alt text -->
<img src="/photos/team.jpg" alt="Our team at the 2025 company retreat" width="800" height="600" />

<!-- Decorative image: empty alt -->
<img src="/decorations/divider.svg" alt="" />
```

### Rules

- **Always** set `alt` — descriptive for informational, `alt=""` for decorative.
- **Always** set `width` and `height` to prevent layout shift (CLS).
- Use `loading="lazy"` for below-the-fold images.
- Alt text decision: Does the image convey information? → Describe it. Is it decorative? → `alt=""`. Contains text? → Include that text.

---

## 2. Responsive Images

### `srcset` with Width Descriptors

```html
<!-- Browser picks the best image based on viewport width -->
<img
  src="/img/hero-800.jpg"
  srcset="/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1200.jpg 1200w, /img/hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw,
            (max-width: 1200px) 50vw,
            33vw"
  alt="Mountain landscape at sunset"
  width="1600"
  height="900"
/>
```

### `srcset` with Pixel Density Descriptors

```html
<!-- For fixed-size images (logos, icons) -->
<img
  src="/logo-1x.png"
  srcset="/logo-1x.png 1x, /logo-2x.png 2x, /logo-3x.png 3x"
  alt="Acme Corp logo"
  width="200"
  height="50"
/>
```

### `<picture>` Element (Art Direction)

```html
<!-- Different crops for different viewports -->
<picture>
  <source media="(min-width: 1024px)" srcset="/hero-wide.jpg" />
  <source media="(min-width: 640px)" srcset="/hero-medium.jpg" />
  <img src="/hero-narrow.jpg" alt="Product showcase" width="640" height="480" />
</picture>

<!-- Modern format with fallback -->
<picture>
  <source type="image/avif" srcset="/photo.avif" />
  <source type="image/webp" srcset="/photo.webp" />
  <img src="/photo.jpg" alt="Autumn forest" width="800" height="600" />
</picture>

<!-- Combined: art direction + format -->
<picture>
  <source media="(min-width: 1024px)" type="image/avif" srcset="/hero-wide.avif" />
  <source media="(min-width: 1024px)" type="image/webp" srcset="/hero-wide.webp" />
  <source media="(min-width: 1024px)" srcset="/hero-wide.jpg" />
  <source type="image/avif" srcset="/hero-narrow.avif" />
  <source type="image/webp" srcset="/hero-narrow.webp" />
  <img src="/hero-narrow.jpg" alt="Product showcase" width="640" height="480" />
</picture>
```

---

## 3. Figure and Figcaption

```html
<!-- Image with caption -->
<figure>
  <img src="/chart.png" alt="Bar chart showing revenue by quarter" width="600" height="400" />
  <figcaption>Figure 1: Revenue by quarter, FY 2025</figcaption>
</figure>

<!-- Code listing with caption -->
<figure>
  <pre><code>const x = 42;</code></pre>
  <figcaption>Example: variable declaration</figcaption>
</figure>

<!-- Blockquote with attribution -->
<figure>
  <blockquote>
    <p>The only way to do great work is to love what you do.</p>
  </blockquote>
  <figcaption>— Steve Jobs</figcaption>
</figure>
```

---

## 4. Video

```html
<!-- Basic video with controls -->
<video src="/demo.mp4" controls width="640" height="360" poster="/demo-poster.jpg" preload="metadata">
  <p>Your browser doesn't support HTML video. <a href="/demo.mp4">Download the video</a>.</p>
</video>

<!-- Multiple sources with captions (WCAG 1.2.2) -->
<video controls width="640" height="360" preload="metadata">
  <source src="/demo.mp4" type="video/mp4" />
  <source src="/demo.webm" type="video/webm" />
  <track kind="captions" src="/demo-en.vtt" srclang="en" label="English" default />
  <track kind="captions" src="/demo-es.vtt" srclang="es" label="Español" />
  <track kind="descriptions" src="/demo-desc.vtt" srclang="en" label="Audio descriptions" />
</video>
```

### Video Attributes

| Attribute        | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `controls`       | Show native play/pause/volume controls      |
| `poster`         | Image shown before video plays              |
| `preload`        | `none`, `metadata` (recommended), or `auto` |
| `autoplay`       | ⚠️ Only with `muted` — never autoplay audio |
| `muted`          | Start muted                                 |
| `loop`           | Loop playback                               |
| `playsinline`    | Play inline on iOS (not fullscreen)         |
| `width`/`height` | Prevent layout shift                        |

### Track Kinds

| Kind           | Purpose                               |
| -------------- | ------------------------------------- |
| `captions`     | Dialogue + sound effects (deaf/HoH)   |
| `subtitles`    | Translated dialogue                   |
| `descriptions` | Audio descriptions of visual content  |
| `chapters`     | Chapter titles for navigation         |
| `metadata`     | Machine-readable data (not displayed) |

---

## 5. Audio

```html
<audio controls preload="metadata">
  <source src="/podcast.mp3" type="audio/mpeg" />
  <source src="/podcast.ogg" type="audio/ogg" />
  <p>Your browser doesn't support HTML audio. <a href="/podcast.mp3">Download the episode</a>.</p>
</audio>
```

- **Always** provide `controls` — no autoplay audio.
- Provide transcript for prerecorded audio (WCAG 1.2.1).

---

## 6. Lazy Loading

```html
<!-- Lazy-load below-the-fold images -->
<img src="/photo.jpg" alt="..." loading="lazy" width="400" height="300" />

<!-- Eager-load above-the-fold (LCP) images -->
<img src="/hero.jpg" alt="..." loading="eager" fetchpriority="high" width="1200" height="600" />

<!-- Lazy-load iframes -->
<iframe src="/widget" loading="lazy" width="600" height="400" title="Interactive widget"></iframe>
```

### Rules

- Use `loading="lazy"` for images/iframes below the fold.
- Never lazy-load the LCP (Largest Contentful Paint) image — use `loading="eager"` + `fetchpriority="high"`.
- Always set `width` and `height` so the browser can reserve space.

---

## 7. SVG Inline

```html
<!-- Decorative SVG -->
<svg aria-hidden="true" focusable="false" width="24" height="24">
  <use href="/icons.svg#check" />
</svg>

<!-- Informational SVG -->
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Sales Chart</title>
  <desc id="chart-desc">Bar chart showing Q1-Q4 sales for 2025</desc>
  <!-- chart paths -->
</svg>
```

---

## 8. Embedded Content

```html
<!-- iframes must have a title (WCAG 4.1.2) -->
<iframe
  src="https://www.youtube.com/embed/abc123"
  title="Product demo video"
  width="560"
  height="315"
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

---

## 9. Anti-Patterns

| Anti-Pattern                            | Fix                                                   |
| --------------------------------------- | ----------------------------------------------------- |
| `<img>` without `alt`                   | Add descriptive `alt` or `alt=""` for decorative      |
| Missing `width`/`height` on images      | Always set to prevent CLS (layout shift)              |
| `loading="lazy"` on hero/LCP image      | Use `loading="eager"` + `fetchpriority="high"`        |
| Video without `<track kind="captions">` | Add captions for accessibility (WCAG 1.2.2)           |
| `autoplay` without `muted`              | Never autoplay audio; use `muted` if video autoplays  |
| `<iframe>` without `title`              | Add descriptive `title` attribute                     |
| Using `<img>` for decorative background | Use CSS `background-image` instead                    |
| SVG icon without `aria-hidden="true"`   | Decorative: `aria-hidden="true"`. Info: `role="img"`  |
| Giant unoptimized images                | Use responsive `srcset` + modern formats (avif, webp) |
