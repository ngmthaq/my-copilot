# Architecture & Naming

## Rules

- Choose one naming convention per project and enforce it consistently
- Organize stylesheets by responsibility, not by page
- Keep component styles co-located with their component when using a framework (CSS Modules, scoped styles)
- Avoid global styles beyond resets, tokens, and base element styles
- Never write styles that depend on DOM structure or nesting depth

## BEM (Block Element Modifier)

```css
/* Block */
.card {
}

/* Element — part of the block (double underscore) */
.card__title {
}
.card__body {
}
.card__footer {
}

/* Modifier — variation of block or element (double dash) */
.card--featured {
}
.card__title--large {
}
```

### BEM Rules

- One block per component
- Elements belong to a block — never nest elements: `.card__footer__btn` is wrong
- Use `.card__btn` or a new block `.action-btn` instead
- Modifiers never stand alone — always combine: `class="card card--featured"`

## ITCSS (Inverted Triangle CSS)

Layer styles from generic to specific:

```
styles/
├── 1-settings/     # Variables, tokens (no CSS output)
│   ├── _colors.scss
│   └── _spacing.scss
├── 2-tools/        # Mixins, functions (no CSS output)
│   ├── _mixins.scss
│   └── _functions.scss
├── 3-generic/      # Reset, normalize, box-sizing
│   └── _reset.scss
├── 4-elements/     # Bare HTML elements (h1, a, ul)
│   └── _base.scss
├── 5-objects/       # Layout patterns (grid, container)
│   └── _container.scss
├── 6-components/   # UI components (card, button, modal)
│   ├── _button.scss
│   └── _card.scss
├── 7-utilities/    # Helper classes (mt-1, text-center, sr-only)
│   └── _utilities.scss
└── main.scss       # Import all layers in order
```

## Component-Scoped Styles

```
/* CSS Modules (React, Vue) */
Button.module.scss
Card.module.scss

/* Vue scoped */
<style scoped lang="scss">
.card { }
</style>

/* Angular component styles */
card.component.scss
```

### When to Use Global vs Scoped

| Style type        | Approach           |
| ----------------- | ------------------ |
| Reset / normalize | Global             |
| Design tokens     | Global (variables) |
| Base elements     | Global             |
| Layout objects    | Global             |
| Component styles  | Scoped / Module    |
| Utility classes   | Global             |

## File Naming Conventions

```
_button.scss         # Partial (starts with underscore)
Button.module.scss   # CSS Module (PascalCase matches component)
_card.scss           # Partial component
_index.scss          # Barrel file for @forward
```

## Anti-Patterns

```css
/* BAD: location-dependent styles */
.sidebar .card {
  padding: 0.5rem;
}
.main .card {
  padding: 1rem;
}

/* GOOD: modifier on the component */
.card {
  padding: 1rem;
}
.card--compact {
  padding: 0.5rem;
}

/* BAD: deeply nested BEM */
.card__header__title__icon {
}

/* GOOD: flat BEM or separate block */
.card__icon {
}

/* BAD: undescriptive class names */
.wrapper .inner .box {
}

/* GOOD: semantic BEM names */
.feature-section {
}
.feature-section__content {
}
```
