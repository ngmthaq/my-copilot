# Angular Control Flow

> Source: https://www.w3schools.com/angular/angular_control_flow.asp

# Angular Control Flow

## Control Flow Essentials

Control flow directives (`@if`, `@for`, `@switch`) render branches, lists, and cases in templates and replace the legacy `*ngIf`/`*ngFor`/`[ngSwitch]` for Angular 17+ code.

Key features include:

- `@if`: Conditional blocks with optional `else if`/`else`
- `@for`: Loops with `track` for stable identity and optional `@empty` for empty states
- `@switch`: Selects and renders a matching case

## Control Flow Basics

Basic syntax examples demonstrate toggling content with `@if ... else` and iterating with `@for` using a `track` expression:

```typescript
@if (show) { <p>Visible</p> } @else { <p>Hidden</p> }

@for (item of items; track item) { <li>{{ item }}</li> }
```

## Example Implementation

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Control Flow</h3>
    <button (click)="show.set(!show())">Toggle</button>
    <button (click)="items.set([])">Clear</button>
    <button (click)="reset()">Reset</button>

    @if (show()) {
      <p>Visible</p>
    } @else {
      <p>Hidden</p>
    }

    <ul>
      @for (item of items(); track item) {
        <li>{{ item }}</li>
      } @empty {
        <li>No items</li>
      }
    </ul>
  `,
})
export class App {
  show = signal(true);
  items = signal(["One", "Two", "Three"]);
  reset() {
    this.items.set(["One", "Two", "Three"]);
  }
}

bootstrapApplication(App);
```

### Key Notes

- Use `track` with a stable key (e.g., `track it.id`) for lists of objects
- Read signals in templates with function syntax: `@if (flag())`, `@for (x of list())`
- Legacy `*ngIf`/`*ngFor`/`[ngSwitch]` remain supported but the new syntax is preferred
- Avoid side effects inside control-flow blocks
