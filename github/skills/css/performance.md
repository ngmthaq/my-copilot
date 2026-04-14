# Performance Optimization

## Rules

- Only animate `transform` and `opacity` — they skip layout and paint
- Avoid layout thrashing — batch DOM reads before writes
- Use `contain` to isolate components from the rest of the page
- Remove unused CSS before shipping to production
- Minimize selector complexity — browsers match selectors right-to-left

## Reducing Reflows & Repaints

| Trigger reflow (expensive)        | Trigger repaint only (cheaper)      | Composite only (cheapest) |
| --------------------------------- | ----------------------------------- | ------------------------- |
| `width`, `height`, `margin`       | `color`, `background`, `box-shadow` | `transform`, `opacity`    |
| `padding`, `border`, `font-size`  | `border-color`, `outline`           | `filter`, `will-change`   |
| `display`, `position`, `top/left` | `visibility`                        |                           |

## CSS Containment

```css
/* Isolate component — browser skips recalculating its children for external changes */
.card {
  contain: layout style paint;
}

/* Content-visibility — skip rendering off-screen elements */
.section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* estimated height */
}
```

## Critical CSS

- Inline above-the-fold styles in `<head>` to avoid render-blocking
- Load remaining CSS asynchronously:

```html
<link
  rel="preload"
  href="/styles/main.css"
  as="style"
  onload="this.rel='stylesheet'"
/>
<noscript><link rel="stylesheet" href="/styles/main.css" /></noscript>
```

## Selector Performance

```css
/* BAD: universal selector in a descendant chain */
.page * {
  box-sizing: border-box;
}

/* GOOD: apply globally once */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* BAD: deep descendant selectors */
.site .main .content .card .title span {
}

/* GOOD: direct class */
.card__title {
}
```

## Reducing Bundle Size

- Use PurgeCSS / tree-shaking to remove unused CSS
- Avoid importing entire utility frameworks when only a few classes are used
- Split CSS per route/page for code-splitting benefits
- Compress with gzip/brotli

## will-change

```css
/* Apply only to elements about to animate — remove after animation */
.modal--opening {
  will-change: transform, opacity;
}

/* NEVER: blanket will-change */
* {
  will-change: transform;
}
```

## Anti-Patterns

```css
/* BAD: animating layout properties */
.drawer {
  transition:
    width 300ms,
    height 300ms;
}

/* GOOD: use transform */
.drawer {
  transition: transform 300ms;
}

/* BAD: huge box-shadow on scroll elements */
.card {
  box-shadow: 0 0 50px 20px rgba(0, 0, 0, 0.5);
}

/* GOOD: subtle, performant shadows */
.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* BAD: @import in CSS files (blocks parallel loading) */
@import url("fonts.css");

/* GOOD: use <link> tags or SCSS @use */
```
