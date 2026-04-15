# Angular Change Detection

> Source: https://www.w3schools.com/angular/angular_change_detection.asp

# Angular Change Detection & Performance

## Change Detection Essentials

- **OnPush**: Checks only on inputs, events/async tasks, and signal updates.
- **Signals**: Push updates explicitly via state changes for predictable renders.
- **Stable lists**: Use `track`/`trackBy` for identity to avoid DOM churn.

```typescript
import { ChangeDetectionStrategy, signal } from "@angular/core";

@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
class Demo {
  items = signal([{ id: 1, label: "A" }]);
  add() {
    this.items.update((a) => [...a, { id: Date.now(), label: "N" }]);
  }
}
```

## OnPush and Signals

- Combine `OnPush` with signals for predictable updates.
- Keep templates simple and push changes through state updates.

```typescript
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class App {
  count = signal(0);
  inc() {
    this.count.set(this.count() + 1);
  }
}
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <h3>OnPush + Signals</h3>
    <p>Count: {{ count() }}</p>
    <button (click)="inc()">Increment</button>

    <ul>
      @for (it of items(); track it.id) {
        <li>{{ it.label }}</li>
      }
    </ul>
  `,
})
export class App {
  count = signal(0);
  items = signal([
    { id: 1, label: "A" },
    { id: 2, label: "B" },
  ]);
  inc() {
    this.count.set(this.count() + 1);
  }
}

bootstrapApplication(App);
```

### Example explained

- **OnPush + signals**: Updating the `count` signal triggers an update under OnPush.
- **Increment**: `inc()` sets a new value (`this.count.set(...)`), causing the view to refresh.
- **Stable list**: The list uses `@for ... track it.id` to minimize DOM churn.

**Tips:**

- **Immutable updates:** Create new object/array references so `OnPush` detects changes.
- **Avoid deep mutation:** Changing nested fields without replacing the reference may not re-render.
- **When it runs:** `OnPush` checks on input changes, events/async tasks, and signal updates.

## Signals Patterns

- Use `computed()` for derived values; recomputes only when dependencies change.
- Use `effect()` for side effects (logging, syncing); keep effects light and idempotent.
- Read signals in templates by calling them (e.g., `{{ count() }}`).

```typescript
import { signal, computed, effect } from "@angular/core";

const count = signal(0);
const double = computed(() => count() * 2);
effect(() => console.log("double =", double()));
```

## Stable Lists with track

- Use `track` with a unique key to prevent DOM churn (same idea as `trackBy` for `*ngFor`).
- Keeps list rendering fast and predictable.

```
@for (it of items(); track it.id) { <li>{{ it.label }}</li> }
```

**Key selection:** Use stable unique IDs; avoid array index if items can reorder.

**Control flow syntax:** With `@for`, track like `@for (it of items(); track it.id)`.

**State preservation:** Tracking prevents destroying/recreating DOM and component state unnecessarily.
