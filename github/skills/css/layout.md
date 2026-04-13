# Box Model & Layout

## Box Model Rules

- Always use `box-sizing: border-box` globally — set it on `*, *::before, *::after`
- Prefer `padding` for internal spacing, `margin` for external spacing
- Avoid mixing `margin` directions on a single element — prefer one direction (e.g., `margin-bottom` only)
- Use logical properties (`margin-inline`, `padding-block`) for internationalization-ready layouts

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## Flexbox

```css
/* Common container patterns */
.row {
  display: flex;
  gap: 1rem;
}
.row--wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.row--center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.row--between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Item sizing */
.col-auto {
  flex: 0 0 auto;
} /* content-sized */
.col-fill {
  flex: 1 1 0%;
} /* fill remaining space equally */
.col-half {
  flex: 0 0 50%;
} /* fixed fraction */
```

### Flexbox Quick Reference

| Property          | Values to know                                             |
| ----------------- | ---------------------------------------------------------- |
| `flex-direction`  | `row` (default), `column`, `row-reverse`, `column-reverse` |
| `justify-content` | `flex-start`, `center`, `space-between`, `space-around`    |
| `align-items`     | `stretch` (default), `center`, `flex-start`, `flex-end`    |
| `flex`            | `flex-grow flex-shrink flex-basis` — e.g., `1 1 0%`        |
| `gap`             | Spacing between items — e.g., `1rem`                       |

## CSS Grid

```css
/* Auto-responsive grid — no media queries needed */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Fixed column grid */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Named areas */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
}
```

### Grid vs Flexbox

| Use case                      | Choose  |
| ----------------------------- | ------- |
| One-dimensional row/column    | Flexbox |
| Two-dimensional rows + cols   | Grid    |
| Unknown number of items       | Flexbox |
| Precise cell placement needed | Grid    |
| Equal-height cards in a row   | Grid    |

## Centering Patterns

```css
/* Flex center (most common) */
.center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid center (simplest) */
.center-grid {
  display: grid;
  place-items: center;
}

/* Absolute center */
.center-abs {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}
```

## Positioning & Stacking

- Prefer `relative`/`absolute` for local offsets within a parent
- Use `sticky` for headers/sidebars that stick on scroll
- Set `z-index` only on positioned elements — define a token scale (e.g., 1, 10, 100, 1000)
- Never set `z-index: 9999` — use a managed scale

```css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-tooltip: 400;
}
```

## Anti-Patterns

```css
/* BAD: using float for layout */
.col {
  float: left;
  width: 33.33%;
}

/* GOOD: use Grid or Flexbox */
.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* BAD: negative margin hacks */
.container {
  margin-left: -15px;
  margin-right: -15px;
}

/* GOOD: use gap */
.container {
  display: flex;
  gap: 1rem;
}
```
