# Angular Pipes

> Source: https://www.w3schools.com/angular/angular_pipes.asp

# Angular Pipes

## Pipes Essentials

Pipes format values in templates using the `|` syntax (e.g., date, currency, percent).

- **What**: Format values in templates with `|` operator
- **Async**: The `async` pipe subscribes to Observables and renders the latest value, automatically unsubscribing
- **Presentation-only**: Pipes change display format, not underlying data
- **Pure by default**: Pure pipes run when input references change; avoid mutating arrays/objects in place

```typescript
{{ title | uppercase }}
{{ price | currency:'USD' }}
{{ today | date:'short' }}
```

## Basic Pipes

Format strings, numbers, dates, and other values with built-in pipes.

```typescript
{{ title | uppercase }}
{{ price | currency:'USD' }}
{{ today | date:'mediumDate' }}
{{ percent | percent:'1.0-2' }}
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
    <h3>Pipes</h3>
    <p>{{ title | uppercase }}</p>
    <p>{{ price | currency: "USD" }}</p>
    <p>{{ today | date: "mediumDate" }}</p>
    <p>{{ percent | percent: "1.0-2" }}</p>
  `,
})
export class App {
  title = "Angular";
  price = 1234.5;
  today = new Date();
  percent = 0.3495;
}

bootstrapApplication(App);
```

## Async Pipe

Render the latest value from an Observable and automatically unsubscribe when the view is destroyed.

```typescript
<ng-container *ngIf="users$ | async as users; else loading">
  <li *ngFor="let u of users">{{ u.name }}</li>
</ng-container>
<ng-template #loading>Loading...</ng-template>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { interval, of } from "rxjs";
import { map, delay } from "rxjs/operators";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>Async Pipe</h3>
    <p>Time: {{ time$ | async | date: "mediumTime" }}</p>

    <h4>Users (delayed)</h4>
    <ng-container *ngIf="users$ | async as users; else loading">
      <ul>
        <li *ngFor="let u of users">{{ u.name }}</li>
      </ul>
    </ng-container>
    <ng-template #loading>Loading...</ng-template>
  `,
})
export class App {
  time$ = interval(1000).pipe(map(() => new Date()));
  users$ = of([{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }]).pipe(
    delay(1200),
  );
}

bootstrapApplication(App);
```

## Custom Pipe

Create small, reusable formatters with the `@Pipe` decorator.

```typescript
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "titlecase2", standalone: true })
export class TitleCase2Pipe implements PipeTransform {
  transform(v: string): string {
    /* ...format... */ return v;
  }
}
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, Pipe, PipeTransform } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Pipe({ name: "titlecase2", standalone: true })
export class TitleCase2Pipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return "";
    return value
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCase2Pipe],
  template: `
    <h3>Custom Pipe</h3>
    <label> Text: <input [(ngModel)]="text" placeholder="type here" /> </label>
    <p>Original: {{ text }}</p>
    <p>TitleCase2: {{ text | titlecase2 }}</p>
  `,
})
export class App {
  text = "hello angular pipes";
}

bootstrapApplication(App);
```

**Important guidelines:**

- Avoid impure pipes; they run on every change detection and hurt performance
- Keep pipes deterministic and free of side effects (no logging, no service calls)
- Handle `null`/`undefined` inputs gracefully to prevent template errors
