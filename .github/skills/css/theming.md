# Dark Mode & Theming

## Rules

- Define themes using CSS custom properties — never duplicate style blocks per theme
- Support `prefers-color-scheme` as the default, with an optional manual toggle
- Store theme preference in `localStorage` and apply it before page render to avoid flash
- Keep the semantic color layer separate from the palette layer

## Theme Architecture

```css
/* Palette — fixed, never changes */
:root {
  --blue-500: #3b82f6;
  --blue-700: #1d4ed8;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-800: #1f2937;
  --gray-900: #111827;
}

/* Semantic — changes per theme */
:root,
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-bg-subtle: var(--gray-50);
  --color-text: var(--gray-900);
  --color-text-muted: var(--gray-800);
  --color-primary: var(--blue-500);
  --color-border: var(--gray-100);
}

[data-theme="dark"] {
  --color-bg: var(--gray-900);
  --color-bg-subtle: var(--gray-800);
  --color-text: var(--gray-50);
  --color-text-muted: var(--gray-100);
  --color-primary: var(--blue-500);
  --color-border: var(--gray-800);
}
```

## System Preference Detection

```css
/* Auto dark mode via media query */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: var(--gray-900);
    --color-bg-subtle: var(--gray-800);
    --color-text: var(--gray-50);
    --color-text-muted: var(--gray-100);
    --color-primary: var(--blue-500);
    --color-border: var(--gray-800);
  }
}
```

## Theme Toggle Pattern

```html
<!-- Apply theme before page render to prevent flash -->
<script>
  const theme = localStorage.getItem("theme");
  if (theme) document.documentElement.setAttribute("data-theme", theme);
</script>
```

```js
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}
```

## Component Usage

```css
/* Components reference semantic tokens — no theme-specific logic */
.card {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
}
```

## SCSS Theming with Maps

```scss
$themes: (
  light: (
    bg: #ffffff,
    text: #111827,
    border: #e5e7eb,
  ),
  dark: (
    bg: #111827,
    text: #f9fafb,
    border: #374151,
  ),
);

@each $theme-name, $theme-map in $themes {
  [data-theme="#{$theme-name}"] {
    @each $key, $value in $theme-map {
      --color-#{$key}: #{$value};
    }
  }
}
```

## Anti-Patterns

```css
/* BAD: duplicating styles per theme */
.card {
  background: white;
  color: black;
}
.dark .card {
  background: #1f2937;
  color: white;
}

/* GOOD: single rule with custom properties */
.card {
  background: var(--color-bg);
  color: var(--color-text);
}

/* BAD: hardcoded colors in dark overrides */
[data-theme="dark"] .btn {
  background: #2563eb;
}

/* GOOD: use semantic tokens */
.btn {
  background: var(--color-primary);
}

/* BAD: no flash prevention — theme loads after paint */
/* GOOD: inline script in <head> sets data-theme before render */
```
