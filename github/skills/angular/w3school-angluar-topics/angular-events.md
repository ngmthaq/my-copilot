# Angular Events

> Source: https://www.w3schools.com/angular/angular_events.asp

# Angular Events

## Event Binding Essentials

- Bind with `(event)` to run a component method; `$event` is the native Event.
- Use common DOM events like `(click)`, `(input)`, and key filters like `(keyup.enter)`.
- Debounce handlers to limit work during fast input.
- **Bubbling:** Child events bubble up; call `$event.stopPropagation()` when needed.

```typescript
<button (click)="onClick()">Click</button>
<input (input)="onInput($event)" (keyup.enter)="submit()">
<div (click)="onParentClick()">
  <button (click)="onChildClick($event)">Child</button>
</div>
```

## Basic Events

- Handle `(click)` to update component state.
- Read input values from `$event.target` (cast or use `$any` when needed).
- Track the last key pressed via `(keyup)`.

```typescript
<button (click)="increment()">Click me</button>
<input (input)="onInput($event)" (keyup)="lastKey = $any($event).key">
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Events</h3>
    <p>Count: {{ count }}</p>
    <button (click)="increment()">Click me</button>

    <div style="margin-top:12px">
      <input
        placeholder="Type..."
        (input)="onInput($event)"
        (keyup)="lastKey = $any($event).key"
      />
      <p>Value: {{ value }}</p>
      <p>Last key: {{ lastKey }}</p>
    </div>
  `,
})
export class App {
  count = 0;
  value = "";
  lastKey = "";

  increment() {
    this.count++;
  }
  onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value;
  }
}

bootstrapApplication(App);
```

## Event Filtering (keyup.enter)

- Use key aliases to run handlers only on specific keys (e.g., Enter).
- Keep UI reactive by updating state on filtered events.

```typescript
<input (keyup.enter)="add()" (keyup)="lastKey = $any($event).key">
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
    <h3>Event Filtering (keyup.enter)</h3>

    <div class="toolbar">
      <input
        type="text"
        placeholder="Add item and press Enter"
        [value]="draft"
        (input)="draft = $any($event.target).value"
        (keyup)="lastKey = $any($event).key"
        (keyup.enter)="add()"
      />
      <button (click)="add()">Add</button>
      <button (click)="clear()" [disabled]="items.length === 0">Clear</button>
      <span style="margin-left:8px;color:#666">Last key: {{ lastKey }}</span>
    </div>

    <ul>
      <li *ngFor="let it of items; let i = index">{{ i + 1 }}. {{ it }}</li>
    </ul>
  `,
})
export class App {
  draft = "";
  lastKey = "";
  items = ["Buy milk", "Learn Angular"];

  add() {
    const v = (this.draft || "").trim();
    if (!v) return;
    this.items = [...this.items, v];
    this.draft = "";
  }
  clear() {
    this.items = [];
  }
}

bootstrapApplication(App);
```

## Debounced Input

- Delay updates until typing pauses to avoid excessive work.
- Use `setTimeout` or RxJS to debounce input changes.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Debounced Input</h3>
    <input type="text" placeholder="Type here" (input)="onInput($event)" />
    <p>Immediate: {{ immediate }}</p>
    <p>Debounced (400ms): {{ debounced }}</p>
  `,
})
export class App {
  immediate = "";
  debounced = "";
  private handle: any;

  onInput(e: Event) {
    const v = (e.target as HTMLInputElement)?.value ?? "";
    this.immediate = v;
    clearTimeout(this.handle);
    this.handle = setTimeout(() => (this.debounced = v), 400);
  }
}

bootstrapApplication(App);
```

### Example Explained

- Immediate vs debounced: `immediate` updates on every input; `debounced` updates after 400ms of no typing.
- `onInput(e)`: Reads `e.target.value`, sets `immediate`, clears any pending timer, and schedules a new timeout to set `debounced`.
- Timer handle: `handle` stores the timeout ID so it can be cleared on the next keystroke.
