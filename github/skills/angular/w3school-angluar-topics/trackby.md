# TrackBy

> Source: https://www.w3schools.com/angular/angular_templates_trackby.asp

# Angular Templates: TrackBy with \*ngFor

## What is TrackBy with \*ngFor?

- Defines how Angular identifies list items.
- Enables DOM node reuse when items move, insert, or remove.
- Typically returns a unique ID for each item.

## When to use TrackBy

- Lists that are frequently reordered, inserted, or removed.
- To avoid unnecessary re-rendering and improve performance.
- When items have stable, unique identifiers.

Details and examples: Lists (`*ngFor`, `trackBy`).

## Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

type Item = { id: number; name: string };

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="shuffle()">Shuffle</button>
    <ul>
      <li *ngFor="let it of items; trackBy: trackById">
        {{ it.id }} - {{ it.name }}
      </li>
    </ul>
  `,
})
export class App {
  items: Item[] = [
    { id: 1, name: "Alpha" },
    { id: 2, name: "Beta" },
    { id: 3, name: "Gamma" },
  ];
  shuffle() {
    this.items = [...this.items].reverse();
  }
  trackById(_i: number, it: Item) {
    return it.id;
  }
}

bootstrapApplication(App);
```

## Example explained

- **\*ngFor ... trackBy: trackById**: Uses `trackById` to assign each item a stable identity so Angular can reuse DOM nodes when the list order changes.
- **trackById(index, item)**: Returns the unique key for an item. In this case, it returns `item.id` regardless of `index`.
- **shuffle()**: Reverses the array to demonstrate that with `trackBy`, Angular moves existing DOM nodes instead of destroying and recreating them.
