# Attribute Binding

> Source: https://www.w3schools.com/angular/angular_templates_attr_binding.asp

# Angular Templates: Attribute Binding with attr.

## What is Attribute Binding with attr.?

- Use `[attr.name]` to set HTML attributes.
- For attributes that do not map to DOM properties (e.g., ARIA, `colspan`).
- Distinct from property binding.

## When to use Attribute Binding

- When no corresponding DOM property exists.
- Use property binding for normal element properties.
- Common with ARIA attributes and table attr like `colspan`.

```html
<button [attr.aria-label]="label">Click</button>
```

### Code explained

- `[attr.aria-label]`: Sets the HTML `aria-label` attribute using the component value.
- `attr.`: Prefer `attr.` when there is no matching DOM property (e.g., ARIA, `colspan`).
- Property vs attribute: For normal element properties, use property binding (e.g., `[disabled]`), not `attr.`.

## Example

Bind to attributes using `attr.`:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Attribute binding (attr.)</h3>
    <button [attr.aria-label]="label" (click)="toggle()">Toggle label</button>
    <table border="1" style="margin-top:8px">
      <tr>
        <th>A</th>
        <th>B</th>
        <th>C</th>
      </tr>
      <tr>
        <td [attr.colspan]="wide ? 2 : 1">Row 1</td>
        <td>Cell</td>
        <td>Cell</td>
      </tr>
    </table>
  `,
})
export class App {
  wide = true;
  get label() {
    return this.wide ? "Table is wide" : "Table is narrow";
  }
  toggle() {
    this.wide = !this.wide;
  }
}

bootstrapApplication(App);
```

### Example explained

- `[attr.aria-label]="label"`: Binds the `aria-label` HTML attribute to the string returned by the component's `label` getter.
- `[attr.colspan]="wide ? 2 : 1"`: Sets the table cell's `colspan` attribute based on state. Use `attr.` because `colspan` is an attribute, not a plain DOM property.
- `get label()`: Computes a descriptive string from the current `wide` value.
- `toggle()`: Flips `wide` to update both the label and the cell span.
