# ngTemplateOutlet

> Source: https://www.w3schools.com/angular/angular_templates_ngtemplateoutlet.asp

# Angular Templates: ngTemplateOutlet

## What is ngTemplateOutlet?

- `<ng-template>` defines a reusable chunk of template (a "recipe").
- Render it with `[ngTemplateOutlet]`.
- Pass values via `[ngTemplateOutletContext]` and read with `let-` variables.

## When to use ngTemplateOutlet

- Reuse UI patterns with different data or rendering variations.
- Use components for complex, reusable logic.
- Use templates for lightweight, view-only reuse.

Tip: Use `<ng-container>` as a logical wrapper that does not add extra DOM elements.

Related: see Components for content projection with `<ng-content>`.

## Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>Templates with ngTemplateOutlet</h3>

    <label>
      Type:
      <select (change)="type = $any($event.target).value">
        <option value="info">info</option>
        <option value="warning">warning</option>
        <option value="success">success</option>
      </select>
    </label>

    <label>
      Message: <input (input)="msg = $any($event.target).value" [value]="msg" />
    </label>

    <ng-container
      [ngTemplateOutlet]="
        type === 'info' ? infoTpl : type === 'warning' ? warnTpl : successTpl
      "
      [ngTemplateOutletContext]="{ $implicit: msg }"
    >
    </ng-container>

    <ng-template #infoTpl let-text>
      <p style="color:royalblue">Info: {{ text }}</p>
    </ng-template>

    <ng-template #warnTpl let-text>
      <p style="color:darkorange">Warning: {{ text }}</p>
    </ng-template>

    <ng-template #successTpl let-text>
      <p style="color:seagreen">Success: {{ text }}</p>
    </ng-template>
  `,
})
export class App {
  type: "info" | "warning" | "success" = "info";
  msg = "Hello";
}

bootstrapApplication(App);
```

```html
<app-root></app-root>
```

## Example Explained

- `<ng-template>`: Defines a reusable template block (not rendered until referenced).
- `[ngTemplateOutlet]`: Chooses which template to render (here via a ternary expression based on `type`).
- `[ngTemplateOutletContext]`: Passes values into the template. The `$implicit` key is read by a matching `let-` variable.
- `let-text`: Declares a local variable inside the template that reads the `$implicit` value from the context.
- `<ng-container>`: A logical wrapper that does not create extra DOM elements.
