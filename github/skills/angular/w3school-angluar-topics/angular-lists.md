# Angular Lists

> Source: https://www.w3schools.com/angular/angular_lists.asp

# Angular Lists

## List Rendering Essentials

- **Loop**: Use `@for` with `track` for stable identity and `@empty` for empty states.
- **Signals**: Store list state in a signal (e.g., `items = signal([...])`) and update immutably with `set()`/`update()`.
- **Identity**: Track by a stable key (e.g., `it.id`) to avoid unnecessary DOM work.
- **Derived views**: Filter/sort copies of your data for the UI; keep the source list intact (use `computed()` for derived state).

## Basic Lists

- Use `@for` to loop; expose the index with `let i = $index`.
- Update immutably with signals.

```typescript
<ul>
  @for (item of items(); let i = $index; track item) {
    <li>{{ i + 1 }}. {{ item }}</li>
  } @empty {
    <li>No items</li>
  }
</ul>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Lists</h3>
    <ul>
      @for (item of items(); let i = $index; track item) {
        <li>{{ i + 1 }}. {{ item }}</li>
      } @empty {
        <li>No items</li>
      }
    </ul>
    <button (click)="add()">Add Item</button>
    <button (click)="clear()">Clear</button>
    <button (click)="reset()">Reset</button>
  `,
})
export class App {
  items = signal(["Angular", "React", "Vue"]);
  add() {
    this.items.update((arr) => [...arr, "Svelte"]);
  }
  clear() {
    this.items.set([]);
  }
  reset() {
    this.items.set(["Angular", "React", "Vue"]);
  }
}

bootstrapApplication(App);
```

## Lists with track (@for)

- On list changes, Angular reconciles DOM rows with data items.
- `track` provides a stable identity (e.g., an `id`) to minimize DOM churn and preserve focus/inputs.

```typescript
@for (it of items(); track it.id) {
  <li>{{ it.name }}</li>
} @empty {
  <li>No items</li>
}
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";

type Item = { id: number; name: string };

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Lists with track</h3>
    <ul>
      @for (it of items(); let i = $index; track it.id) {
        <li>{{ i + 1 }}. {{ it.name }} (id: {{ it.id }})</li>
      }
    </ul>
    <button (click)="renameFirst()">Rename first</button>
    <button (click)="shuffle()">Shuffle</button>
    <button (click)="add()">Add item</button>
  `,
})
export class App {
  items = signal([
    { id: 1, name: "Angular" },
    { id: 2, name: "React" },
    { id: 3, name: "Vue" },
  ]);
  nextId = 4;

  renameFirst() {
    this.items.update((arr) =>
      arr.map((it, i) => (i === 0 ? { ...it, name: it.name + " *" } : it)),
    );
  }

  shuffle() {
    this.items.update((arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  }

  add() {
    this.items.update((arr) => [
      ...arr,
      { id: this.nextId++, name: "New " + Date.now() },
    ]);
  }
}

bootstrapApplication(App);
```

## Filter & Sort

- Compute a derived `view` with `computed()` based on signals.
- Filter and sort copies of your data; keep the source list intact for easy resets.

```typescript
import { signal, computed } from "@angular/core";

items = signal([
  { name: "Angular", price: 0 },
  { name: "React", price: 0 },
]);
query = signal("");
sortKey = signal<"name" | "price">("name");
sortDir = signal<1 | -1>(1);

view = computed(() => {
  const q = query().toLowerCase();
  const dir = sortDir();
  const key = sortKey();
  return items()
    .filter((it) => it.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const av: any = (a as any)[key];
      const bv: any = (b as any)[key];
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
});
```
