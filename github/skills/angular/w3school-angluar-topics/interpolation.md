# Interpolation

> Source: https://www.w3schools.com/angular/angular_templates_interpolation.asp

# Angular Templates: Interpolation

## What is Interpolation?

- Displays component values in the DOM with double curly braces.
- Read it as: "take this value and print it as text".
- One-way only: **data → view**.

## When to use Interpolation

- Show text values and simple, fast expressions (no side effects).
- Use property/attribute binding for dynamic attributes.
- For HTML content, consider `[innerHTML]` with care.

```
{{ expression }}
```

`{{ expression }}`: Evaluates against the component and inserts the result as text (HTML-escaped).

## Example

Use interpolation to display component values in the DOM:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>{{ title }}</h3>
    <p>Hello {{ name }}!</p>
    <p>2 + 3 = {{ 2 + 3 }}</p>
    <p>Upper: {{ name.toUpperCase() }}</p>
  `,
})
export class App {
  title = "Templates & Interpolation";
  name = "Angular";
}

bootstrapApplication(App);
```

```html
<app-root></app-root>
```

### Example explained

- **Interpolation** `{{ expression }}`: Angular evaluates the expression against the component and inserts the result as text (HTML-escaped).
- **Property values**: `{{ title }}` and `{{ name }}` read component fields.
- **Expressions**: `{{ 2 + 3 }}` evaluates arithmetic; `{{ name.toUpperCase() }}` calls a method on the string value.
- **Text vs HTML**: Interpolation escapes HTML. To render HTML, bind with `[innerHTML]` carefully.

**Keep expressions light:** Avoid heavy work in `{{ ... }}`; compute values in the component.

**Text, not HTML:** Interpolation escapes HTML for safety. To insert HTML, use `[innerHTML]` carefully.

**No side effects:** Don't change state inside template expressions. Keep them pure.
