---
name: css
description: "Unified CSS/SCSS skill index — covers selectors & specificity, box model & layout (Flexbox, Grid), responsive design & media queries, SCSS features (variables, nesting, mixins, functions, partials), animations & transitions, typography & colors, architecture & naming (BEM, ITCSS), performance optimization, dark mode & theming, and accessibility (focus styles, prefers-reduced-motion). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# CSS / SCSS Skill Index

## Sub-Skills Reference

| Domain                | File                                         | When to use                                                                                             |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Selectors             | [selectors.md](selectors.md)                 | Choosing selectors; managing specificity; pseudo-classes; pseudo-elements; attribute selectors          |
| Layout                | [layout.md](layout.md)                       | Box model; Flexbox; CSS Grid; positioning; stacking context; centering patterns                         |
| Responsive Design     | [responsive.md](responsive.md)               | Media queries; mobile-first approach; container queries; fluid typography; responsive images            |
| SCSS                  | [scss.md](scss.md)                           | Variables; nesting; mixins; functions; partials; @use/@forward; placeholder selectors; loops            |
| Animations            | [animations.md](animations.md)               | Transitions; keyframe animations; transform; performance-safe animation; motion preferences             |
| Typography & Colors   | [typography-colors.md](typography-colors.md) | Font stacks; sizing; line-height; color systems; custom properties for design tokens                    |
| Architecture & Naming | [architecture.md](architecture.md)           | BEM naming; ITCSS layering; file organization; component-scoped styles; avoiding specificity wars       |
| Performance           | [performance.md](performance.md)             | Reducing reflows/repaints; will-change; contain; critical CSS; selector performance; unused CSS removal |
| Theming               | [theming.md](theming.md)                     | Dark mode; prefers-color-scheme; CSS custom properties for themes; theme switching patterns             |
| Accessibility         | [accessibility.md](accessibility.md)         | Focus styles; prefers-reduced-motion; prefers-contrast; visually-hidden; skip links; forced-colors      |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need to pick the right selector or manage specificity
│   └─▶ selectors.md
│
├─ I need to lay out elements (Flexbox, Grid, centering)
│   └─▶ layout.md
│
├─ I need to make a design responsive across screen sizes
│   └─▶ responsive.md
│
├─ I need to use SCSS features (variables, mixins, nesting, partials)
│   └─▶ scss.md
│
├─ I need to add animations or transitions
│   └─▶ animations.md
│
├─ I need to set up fonts, text sizing, or color systems
│   └─▶ typography-colors.md
│
├─ I need to organize CSS files or choose a naming convention
│   └─▶ architecture.md
│
├─ I need to optimize CSS for performance
│   └─▶ performance.md
│
├─ I need to implement dark mode or theme switching
│   └─▶ theming.md
│
└─ I need to handle focus styles, motion preferences, or contrast
    └─▶ accessibility.md
```
