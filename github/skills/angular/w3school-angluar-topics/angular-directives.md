# Angular Directives

> Source: https://www.w3schools.com/angular/angular_directives.asp

# Angular Directives

## Directive Essentials

Directives add behavior to existing elements and components. Key concepts include:

- Add behavior to elements with `@Directive` and a selector
- **Structural directives** (`*ngIf`, `*ngFor`) add/remove DOM elements
- **Attribute directives** (`[ngClass]`, custom `[w3X]`) change look/behavior without creating/removing nodes
- Star syntax (`*`) is sugar that expands to `<ng-template>`
- Expose directive inputs with `@Input()`; alias with `@Input('alias')` to bind via `[alias]`

```typescript
*ngIf="condition"
*ngFor="let item of items"
@Directive({ selector: '[w3Highlight]' })
<div w3Highlight></div>
```

## Basic Directives

- `*ngIf` shows/hides content based on a condition
- `*ngFor` repeats a block for each list item
- Toggle a flag to add/remove the list; render items with `*ngFor`

```typescript
<p *ngIf="items.length > 0">We have {{ items.length }} items</p>
<li *ngFor="let item of items">{{ item }}</li>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>Directives</h3>
    <p *ngIf="items.length > 0">We have {{ items.length }} items</p>
    <ul>
      <li *ngFor="let item of items">{{ item }}</li>
    </ul>
    <button (click)="toggle()">Toggle Items</button>
  `,
})
export class App {
  show = true;
  get items() {
    return this.show ? ["Angular", "Components", "Directives"] : [];
  }
  toggle() {
    this.show = !this.show;
  }
}

bootstrapApplication(App);
```

### Example Explained

- **`*ngIf`**: Adds/removes the paragraph from the DOM when the condition is truthy/falsy
- **`*ngFor`**: Repeats the `<li>` block for each item in `items`
- **Toggle**: The button flips `show`, which changes the computed `items` getter

**Key Notes:**

- CommonModule required: Import `CommonModule` when using built-in directives in standalone components
- Star syntax is sugar: `*ngIf`/`*ngFor` expand to `<ng-template>`; DOM nodes truly appear/disappear
- Avoid heavy work in templates: Don't call expensive functions in `*ngFor`. Compute in the component instead
- One structural per host: Don't put two `*` directives on the same element. Wrap one in `<ng-container>` if needed

## ngIf with else

- Point `*ngIf` to a fallback template with `else`
- Use `then/else` syntax to make both branches explicit
- Angular adds/removes DOM blocks entirely

```typescript
<ng-container *ngIf="loggedIn; else loggedOut"></ng-container>
<ng-template #loggedOut>...</ng-template>

<ng-container *ngIf="hasAccess; then accessTpl; else noAccessTpl"></ng-container>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>ngIf with else</h3>

    <button (click)="loggedIn = !loggedIn">
      {{ loggedIn ? "Log out" : "Log in" }}
    </button>

    <ng-container *ngIf="loggedIn; else loggedOut">
      <p>Welcome back, {{ user }}!</p>
    </ng-container>

    <ng-template #loggedOut>
      <p>Please log in to continue.</p>
    </ng-template>

    <hr />

    <h4>ngIf then/else syntax</h4>
    <button (click)="hasAccess = !hasAccess">
      Toggle Access ({{ hasAccess ? "granted" : "denied" }})
    </button>

    <ng-container
      *ngIf="hasAccess; then accessTpl; else noAccessTpl"
    ></ng-container>

    <ng-template #accessTpl>
      <p style="color: seagreen">Access granted.</p>
    </ng-template>
    <ng-template #noAccessTpl>
      <p style="color: crimson">Access denied.</p>
    </ng-template>
  `,
})
export class App {
  loggedIn = false;
  user = "Angular User";
  hasAccess = true;
}

bootstrapApplication(App);
```

## Attribute Directive (hover highlight)

- Runs on an existing element (no DOM created/destroyed)
- Changes appearance or behavior (e.g., add styles, classes, attributes)
- Example uses `@HostBinding` and `@HostListener` to set background on hover

```typescript
@Directive({ selector: '[w3Highlight]' })
<div [w3Highlight]="'lightyellow'">Hover me</div>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import {
  Component,
  Directive,
  Input,
  HostBinding,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Directive({
  selector: "[w3Highlight]",
  standalone: true,
})
export class HighlightDirective {
  @Input("w3Highlight") highlightColor = "lightyellow";
  @HostBinding("style.transition") transition =
    "background-color 150ms ease-in-out";
  @HostBinding("style.backgroundColor") bg = "";

  @HostListener("mouseenter") onEnter() {
    this.bg = this.highlightColor;
  }
  @HostListener("mouseleave") onLeave() {
    this.bg = "";
  }
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, HighlightDirective],
  styles: [
    `
      .box {
        padding: 10px;
        border: 1px dashed #bbb;
        border-radius: 6px;
      }
    `,
  ],
  template: `
    <h3>Attribute Directive (highlight)</h3>
    <p>Hover the first box to see the effect:</p>
    <div class="box" [w3Highlight]="'lightyellow'">
      I get highlighted on hover
    </div>
    <div class="box" style="margin-top:8px">I do not</div>
  `,
})
export class App {}

bootstrapApplication(App);
```

### Example Explained

- **`[w3Highlight]="'lightyellow'"`**: Passes a color into the directive via its input alias
- **`@HostBinding`**: Binds the element's `style.backgroundColor` and transition properties from directive fields
- **`@HostListener`**: Reacts to `mouseenter`/`mouseleave` to set/clear the background color
