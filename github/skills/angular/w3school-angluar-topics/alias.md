# Alias

> Source: https://www.w3schools.com/angular/angular_templates_ngif_as.asp

# Angular Templates: Alias with as in \*ngIf

## What is alias with `as` in `*ngIf`?

- Create a local alias for the truthy value of the condition.
- Example: `*ngIf="user as u"` then use `u` inside.
- Makes templates cleaner by not repeating expressions.

## When to use alias with `as`

- When the same expression is referenced several times.
- When using an `else` template that also needs the value.
- To improve readability and reduce duplication.

Examples live under Conditional Rendering (`*ngIf` with `as` and `else`).

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
    <button (click)="toggle()">Toggle user</button>
    <p *ngIf="user as u; else empty">Hello {{ u.name }}!</p>
    <ng-template #empty>No user</ng-template>
  `,
})
export class App {
  user: { name: string } | null = { name: "Ada" };
  toggle() {
    this.user = this.user ? null : { name: "Ada" };
  }
}

bootstrapApplication(App);
```

## Example explained

- `*ngIf="user as u"`: When `user` is truthy, create a local alias `u` that holds the value of `user`.
- **Alias use**: Inside the block, use `u.name` instead of repeating `user.name`.
- `else empty`: When `user` is falsy, render the template referenced by `#empty`.
- `toggle()`: The button switches `user` between `null` and an object to demonstrate both paths.
