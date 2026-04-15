# Structural Directives

> Source: https://www.w3schools.com/angular/angular_templates_microsyntax.asp

# Angular Templates: Structural Directives Micro-syntax

## What is the Structural Directives micro-syntax?

- `*` is shorthand that expands to an underlying `<ng-template>`
- Provides context variables (e.g., `index as i`, `else`)
- Angular rewrites `*ngIf`, `*ngFor`, etc., using this syntax

**Important:** In Angular 17+, prefer the new control flow syntax (`@if`, `@for`, `@switch`).

The micro-syntax for `*ngIf`/`*ngFor` remains supported for existing code.

## When to use the micro-syntax

- With structural directives to add/remove DOM based on state
- To iterate lists concisely with `*ngFor`
- Use shorthand for readability; use explicit `<ng-template>` when needed

## Example

Use the `*` micro-syntax to expand structural directives and expose context variables:

```html
<div *ngIf="ok; else other">OK</div>
<ng-template #other>Not OK</ng-template>
<li *ngFor="let item of items; index as i">{{ i }} {{ item }}</li>
```

### Code explained

- `*ngIf="ok; else other"`: Renders the block when `ok` is truthy; otherwise renders the `#other` template
- `*ngFor="...; index as i"`: Loops over `items` and exposes the zero-based index as `i`
- `*` shorthand: Angular rewrites `*...` into an underlying `<ng-template>`

## Full Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="ok = !ok">Toggle</button>
    <div *ngIf="ok; else other">OK</div>
    <ng-template #other>Not OK</ng-template>
    <ul>
      <li *ngFor="let item of items; index as i">{{ i }} - {{ item }}</li>
    </ul>
  `,
})
export class App {
  ok = true;
  items = ["A", "B", "C"];
}

bootstrapApplication(App);
```

### Example explained

- `*` shorthand: `*ngIf` and `*ngFor` are shorthand that Angular rewrites to an underlying `<ng-template>`
- `*ngIf="ok; else other"`: Renders the block when `ok` is true; otherwise renders the template referenced by `#other`
- `*ngFor="let item of items; index as i"`: Iterates the array `items`; `item` is the current element and `i` is the zero-based index
