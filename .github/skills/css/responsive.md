# Responsive Design & Media Queries

## Rules

- Use **mobile-first** approach — write base styles for small screens, then add `min-width` breakpoints
- Prefer relative units (`rem`, `em`, `%`, `vw/vh`) over fixed `px` for sizing
- Use `clamp()` for fluid sizing that adapts without breakpoints
- Avoid hard-coding widths — let content determine size where possible
- Set `max-width` on containers to prevent content stretching on ultra-wide screens

## Breakpoint Strategy (Mobile-First)

```scss
// Breakpoint tokens
$bp-sm: 576px;
$bp-md: 768px;
$bp-lg: 992px;
$bp-xl: 1200px;
$bp-xxl: 1400px;

// Usage — always min-width for mobile-first
@media (min-width: $bp-md) {
  /* tablet and up */
}
@media (min-width: $bp-lg) {
  /* desktop and up */
}
```

```css
/* CSS custom properties alternative */
/* Base: mobile styles */
.card {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 992px) {
  .card {
    padding: 2rem;
  }
}
```

## Container Queries

```css
/* Parent defines a query container */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Children respond to parent size, not viewport */
@container card (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

## Fluid Typography

```css
/* clamp(min, preferred, max) */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
p {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem);
}
```

## Fluid Spacing

```css
.section {
  padding: clamp(1rem, 5vw, 4rem);
}

.container {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 2rem);
}
```

## Responsive Images

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

## Common Responsive Patterns

```css
/* Stack on mobile, side-by-side on desktop */
.split {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 768px) {
  .split {
    flex-direction: row;
  }
}

/* Auto-responsive grid — no breakpoints needed */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
  gap: 1rem;
}
```

## Anti-Patterns

```css
/* BAD: desktop-first with max-width */
@media (max-width: 768px) {
  .nav {
    display: none;
  }
}

/* GOOD: mobile-first with min-width */
.nav {
  display: none;
}
@media (min-width: 768px) {
  .nav {
    display: flex;
  }
}

/* BAD: fixed pixel widths */
.container {
  width: 1200px;
}

/* GOOD: fluid with max-width */
.container {
  max-width: 1200px;
  width: 100%;
}

/* BAD: too many breakpoints targeting specific devices */
@media (min-width: 375px) {
}
@media (min-width: 414px) {
}

/* GOOD: content-driven breakpoints */
@media (min-width: 768px) {
}
```
