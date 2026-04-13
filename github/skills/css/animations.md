# Animations & Transitions

## Rules

- Only animate `transform` and `opacity` — they are GPU-composited and skip layout/paint
- Always set `transition-property` explicitly — avoid `transition: all`
- Add `prefers-reduced-motion` overrides for accessibility
- Keep durations short: 150–300ms for UI feedback, 300–500ms for larger movements
- Use `will-change` sparingly and only when animation jank is measured

## Transitions

```css
/* Explicit property — always preferred */
.btn {
  transition:
    background-color 200ms ease,
    transform 200ms ease;
}
.btn:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* BAD: transition all */
.btn {
  transition: all 300ms;
}
```

### Timing Functions

| Function                       | Use case                  |
| ------------------------------ | ------------------------- |
| `ease`                         | General purpose           |
| `ease-in-out`                  | Enter + leave             |
| `ease-out`                     | Enter (element appearing) |
| `ease-in`                      | Leave (element exiting)   |
| `cubic-bezier(0.4, 0, 0.2, 1)` | Material-style smooth     |

## Keyframe Animations

```css
@keyframes fade-in {
  from {
    opacity: 0;
    translate: 0 1rem;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

.card-enter {
  animation: fade-in 300ms ease-out forwards;
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

## Transform

```css
/* Modern individual transforms (preferred when supported) */
.card:hover {
  scale: 1.02;
  translate: 0 -2px;
}

/* Legacy shorthand */
.card:hover {
  transform: scale(1.02) translateY(-2px);
}
```

## Common Patterns

```css
/* Skeleton loading shimmer */
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
.skeleton {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Collapse/expand */
.collapsible {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms ease;
}
.collapsible.open {
  grid-template-rows: 1fr;
}
.collapsible__inner {
  overflow: hidden;
}
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Anti-Patterns

```css
/* BAD: animating width/height (triggers layout) */
.drawer {
  transition: width 300ms;
}

/* GOOD: animate transform instead */
.drawer {
  transition: transform 300ms;
}

/* BAD: will-change on every element */
* {
  will-change: transform;
}

/* GOOD: apply only to elements that will animate */
.card:hover {
  will-change: transform;
}

/* BAD: long durations feel sluggish */
.btn {
  transition: background-color 800ms;
}

/* GOOD: fast, responsive feedback */
.btn {
  transition: background-color 200ms;
}
```
