# SCSS Features

## Rules

- Use `@use` and `@forward` instead of `@import` (deprecated)
- Keep nesting to **3 levels max** — deeper nesting creates specificity issues and hard-to-read code
- Extract repeated values into variables or custom properties
- Use mixins for reusable blocks of declarations, functions for computed values
- Organize partials by responsibility — don't put everything in one file

## Variables

```scss
// _tokens.scss
$color-primary: #2563eb;
$color-text: #1f2937;
$font-family-base: "Inter", sans-serif;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 2rem;
$radius-md: 0.5rem;

// Prefer CSS custom properties for runtime theming
:root {
  --color-primary: #{$color-primary};
  --color-text: #{$color-text};
}
```

## Nesting

```scss
// GOOD: shallow nesting with purpose
.card {
  padding: $spacing-md;
  border-radius: $radius-md;

  &__title {
    font-size: 1.25rem;
  }
  &__body {
    margin-top: $spacing-sm;
  }

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  &--featured {
    border: 2px solid $color-primary;
  }
}

// BAD: too deep
.page {
  .container {
    .card {
      .card-header {
        .title {
          /* 5 levels — stop */
        }
      }
    }
  }
}
```

## Mixins

```scss
// Responsive breakpoint mixin
@mixin breakpoint($min) {
  @media (min-width: $min) {
    @content;
  }
}

// Usage
.sidebar {
  display: none;
  @include breakpoint(768px) {
    display: block;
  }
}

// Truncate text
@mixin truncate($lines: 1) {
  overflow: hidden;
  text-overflow: ellipsis;
  @if $lines == 1 {
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
  }
}
```

## Functions

```scss
// Convert px to rem
@function to-rem($px, $base: 16) {
  @return calc($px / $base) * 1rem;
}

// Shade a color
@function shade($color, $amount: 10%) {
  @return mix(black, $color, $amount);
}

// Usage
.heading {
  font-size: to-rem(24);
}
.btn-dark {
  background: shade($color-primary, 20%);
}
```

## Partials & Module System

```
styles/
├── _tokens.scss        # Variables, design tokens
├── _reset.scss         # CSS reset / normalize
├── _mixins.scss        # Shared mixins
├── _functions.scss     # Shared functions
├── _base.scss          # Base element styles
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _index.scss     # @forward all components
├── layouts/
│   ├── _header.scss
│   ├── _footer.scss
│   └── _index.scss
└── main.scss           # Entry point
```

```scss
// components/_index.scss
@forward "button";
@forward "card";

// main.scss
@use "tokens";
@use "reset";
@use "mixins";
@use "base";
@use "components";
@use "layouts";
```

## Placeholder Selectors

```scss
// Use %placeholder for shared styles that should NOT output unless extended
%flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  @extend %flex-center;
}
.hero {
  @extend %flex-center;
}
```

## Loops & Conditionals

```scss
// Generate spacing utilities
$spacings: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  3: 1rem,
  4: 2rem,
);

@each $key, $value in $spacings {
  .mt-#{$key} {
    margin-top: $value;
  }
  .mb-#{$key} {
    margin-bottom: $value;
  }
  .p-#{$key} {
    padding: $value;
  }
}
```

## Anti-Patterns

```scss
// BAD: @import (deprecated, causes duplication)
@import "tokens";

// GOOD: @use with namespace
@use "tokens";
.btn {
  color: tokens.$color-primary;
}

// BAD: nesting to mirror HTML structure
.page .container .row .col .card .title {
}

// GOOD: flat selectors with BEM
.card__title {
}

// BAD: hardcoded values scattered everywhere
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  color: #2563eb;
}

// GOOD: use variables/tokens
.btn {
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-md;
  color: $color-primary;
}
```
