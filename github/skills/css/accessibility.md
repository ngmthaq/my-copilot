# Accessibility

## Rules

- Never remove `outline` on focus without providing a visible alternative
- Use `prefers-reduced-motion: reduce` to disable or minimize animations
- Ensure focus order follows visual order — avoid `tabindex` > 0
- Provide a visually-hidden class for screen-reader-only text
- Test with keyboard navigation — every interactive element must be reachable and operable

## Focus Styles

```css
/* Remove default only if replacing with a custom style */
:focus {
  outline: none;
}

/* Custom visible focus — use :focus-visible for keyboard-only */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Buttons and links */
.btn:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}
```

## Visually Hidden (Screen-Reader Only)

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Allow focus to reveal (e.g., skip links) */
.sr-only:focus,
.sr-only:focus-within {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Skip Link

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 1000;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: #fff;
}

.skip-link:focus {
  top: 0;
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

## High Contrast / Forced Colors

```css
@media (forced-colors: active) {
  .btn {
    border: 1px solid ButtonText;
  }

  .icon {
    forced-color-adjust: auto; /* let the OS recolor */
  }
}

@media (prefers-contrast: more) {
  :root {
    --color-text: #000000;
    --color-bg: #ffffff;
    --color-border: #000000;
  }
}
```

## Interactive Element Rules

```css
/* Minimum touch target size — 44x44px (WCAG 2.5.8) */
button,
a,
[role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Disabled states — reduce opacity AND indicate non-interactive */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## Color Contrast

- Normal text (< 18px / < 14px bold): minimum 4.5:1 ratio (WCAG AA)
- Large text (≥ 18px / ≥ 14px bold): minimum 3:1 ratio (WCAG AA)
- Non-text elements (icons, borders): minimum 3:1 ratio
- Never rely on color alone to convey information — use icons, patterns, or text labels

## Anti-Patterns

```css
/* BAD: removing outline globally without replacement */
* {
  outline: none;
}

/* GOOD: replace with visible :focus-visible */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* BAD: display: none hides from screen readers too */
.hidden-label {
  display: none;
}

/* GOOD: sr-only keeps it accessible */
.hidden-label {
  @extend .sr-only;
}

/* BAD: tiny click targets */
.icon-btn {
  width: 20px;
  height: 20px;
}

/* GOOD: minimum 44px */
.icon-btn {
  min-width: 44px;
  min-height: 44px;
}
```
