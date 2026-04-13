# Typography & Colors

## Typography Rules

- Set a base `font-size` on `html` (typically `16px`) and use `rem` for all other sizing
- Limit font families to 2–3 per project (heading, body, monospace)
- Set `line-height` between 1.4–1.6 for body text, 1.1–1.3 for headings
- Use a modular type scale for consistent sizing hierarchy

## Type Scale

```css
:root {
  --font-xs: clamp(0.75rem, 1.5vw, 0.875rem);
  --font-sm: clamp(0.875rem, 1.5vw, 1rem);
  --font-base: clamp(1rem, 2vw, 1.125rem);
  --font-lg: clamp(1.125rem, 2.5vw, 1.25rem);
  --font-xl: clamp(1.25rem, 3vw, 1.5rem);
  --font-2xl: clamp(1.5rem, 4vw, 2rem);
  --font-3xl: clamp(2rem, 5vw, 3rem);
}
```

## Font Stack

```css
:root {
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-serif: "Merriweather", Georgia, serif;
  --font-mono: "Fira Code", "Cascadia Code", monospace;
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-base);
  line-height: 1.5;
  color: var(--color-text);
}
```

## Text Utilities

```css
/* Truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Balanced headings (prevent orphans) */
h1,
h2 {
  text-wrap: balance;
}

/* Readable paragraph width */
.prose {
  max-width: 65ch;
}
```

## Color Rules

- Define all colors as CSS custom properties — never hardcode hex values in component styles
- Use a semantic naming layer (`--color-primary`, `--color-danger`) on top of a palette layer (`--blue-500`)
- Ensure minimum 4.5:1 contrast ratio for normal text, 3:1 for large text (WCAG AA)

## Color System

```css
/* Palette layer */
:root {
  --blue-50: #eff6ff;
  --blue-500: #3b82f6;
  --blue-700: #1d4ed8;
  --gray-50: #f9fafb;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-900: #111827;
  --red-500: #ef4444;
  --green-500: #22c55e;
}

/* Semantic layer */
:root {
  --color-primary: var(--blue-500);
  --color-primary-hover: var(--blue-700);
  --color-text: var(--gray-900);
  --color-text-muted: var(--gray-500);
  --color-bg: #ffffff;
  --color-bg-subtle: var(--gray-50);
  --color-border: var(--gray-200);
  --color-danger: var(--red-500);
  --color-success: var(--green-500);
}
```

## Anti-Patterns

```css
/* BAD: hardcoded colors scattered in components */
.btn {
  background: #3b82f6;
}
.link {
  color: #3b82f6;
}

/* GOOD: use tokens */
.btn {
  background: var(--color-primary);
}
.link {
  color: var(--color-primary);
}

/* BAD: px for font sizes */
h1 {
  font-size: 32px;
}

/* GOOD: rem or clamp */
h1 {
  font-size: var(--font-3xl);
}

/* BAD: no line-height set */
p {
  font-size: 1rem;
}

/* GOOD: explicit line-height */
p {
  font-size: 1rem;
  line-height: 1.5;
}
```
