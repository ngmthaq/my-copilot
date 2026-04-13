# Selectors & Specificity

## Rules

- Prefer class selectors (`.card`) over element selectors (`div`) or ID selectors (`#card`)
- Keep specificity as flat as possible — avoid chaining more than 2 classes
- Never use `!important` in component styles — reserve it only for utility overrides
- Avoid qualifying class selectors with elements: use `.nav` not `ul.nav`
- Use attribute selectors sparingly — they are slower than class selectors

## Specificity Reference

| Selector type        | Specificity   | Example           |
| -------------------- | ------------- | ----------------- |
| Universal            | 0-0-0         | `*`               |
| Element / pseudo-el  | 0-0-1         | `div`, `::before` |
| Class / pseudo-class | 0-1-0         | `.card`, `:hover` |
| ID                   | 1-0-0         | `#header`         |
| Inline style         | 1-0-0-0       | `style="..."`     |
| `!important`         | Overrides all |

## Pseudo-Classes

```css
/* State */
:hover, :focus, :active, :focus-visible, :focus-within

/* Structural */
:first-child, :last-child, :nth-child(2n), :nth-of-type(odd)

/* Form state */
:checked, :disabled, :required, :valid, :invalid, :placeholder-shown

/* Logical */
:is(.a, .b)    /* forgiving, takes highest specificity of list */
:where(.a, .b) /* forgiving, zero specificity */
:not(.hidden)   /* specificity of its argument */
:has(.icon)     /* parent selector — match parent if child exists */
```

## Pseudo-Elements

```css
::before, ::after    /* generated content (requires `content`) */
::placeholder        /* input placeholder text */
::selection          /* user-highlighted text */
::marker             /* list bullet / number */
```

## Anti-Patterns

```css
/* BAD: over-qualified */
div.container ul.nav li.nav-item a.nav-link {
}

/* GOOD: flat, predictable */
.nav-link {
}

/* BAD: ID selector for styling */
#sidebar {
  width: 300px;
}

/* GOOD: class selector */
.sidebar {
  width: 300px;
}

/* BAD: !important for layout */
.card {
  margin: 0 !important;
}

/* GOOD: fix the specificity chain instead */
.card {
  margin: 0;
}
```
