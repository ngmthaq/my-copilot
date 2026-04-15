# Angular Data Binding

> Source: https://www.w3schools.com/angular/angular_data_binding.asp

# Angular Data Binding

## Data Binding Essentials

Data binding connects your component's state to the template.

- Connect component state and template markup.
- Use **interpolation** for text, **property binding** for DOM properties, and **event binding** for user actions.
- Use **two-way binding** for form inputs that both display and update state.
- Bind attributes with `[attr.*]`, and classes/styles with `[class.*]`/`[style.*]`.

```
{{ value }}
[prop]="value"
(event)="handler($event)"
[(ngModel)]="value"
```

## Basic Data Binding

- `Interpolation:` `{{ value }}` prints text.
- `Property binding:` `[prop]="value"` sets element/DOM properties.
- `Event binding:` `(event)="handler($event)"` listens to user actions.

```
{{ name }}
[value]="name"
(input)="name = $any($event.target).value"
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Data Binding</h3>
    <input
      [value]="name"
      (input)="name = $any($event.target).value"
      placeholder="Type your name"
    />
    <p>Hello {{ name }}!</p>
    <button (click)="count = count + 1">Clicked {{ count }} times</button>
    <button [disabled]="isDisabled">Can't click me</button>
  `,
})
export class App {
  name = "Angular";
  count = 0;
  isDisabled = true;
}

bootstrapApplication(App);
```

### Example Explained

- `{{ name }}`: Interpolation prints the current `name` value as text.
- `[value]="name"`: Property binding sets the input's value from the component state.
- `(input)="name = $any($event.target).value"`: Event binding updates `name` from the input's current text.
- `(click)="count = count + 1"`: Increments the `count` field when the button is clicked.
- `[disabled]="isDisabled"`: Disables the button when `isDisabled` is true.

## Two-way Binding

- Sync template and component: page ↔ component.
- Use `[(ngModel)]` for form controls.
- Conceptually equals `[value]` + `(input)`.
- Requires `FormsModule`.

```
<input [(ngModel)]="name">
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3>Two-way Binding (ngModel)</h3>

    <label>
      Name: <input [(ngModel)]="name" placeholder="Type your name" />
    </label>

    <label style="margin-left:12px">
      Favorite:
      <select [(ngModel)]="favorite">
        <option value="Angular">Angular</option>
        <option value="TypeScript">TypeScript</option>
        <option value="JavaScript">JavaScript</option>
      </select>
    </label>

    <p>Hello {{ name || "friend" }}!</p>
    <p>Favorite: {{ favorite }}</p>
  `,
})
export class App {
  name = "Angular";
  favorite = "Angular";
}

bootstrapApplication(App);
```

### Example Explained

- `[(ngModel)]="name"`: Two-way binds the input to the `name` field (requires `FormsModule`).
- `[(ngModel)]="favorite"`: Keeps the `select` and the `favorite` field in sync.
- Concept: Equivalent to `[value]` plus `(input)` wiring under the hood.

## Attribute Binding

- Some values are attributes, not DOM properties (e.g., `colspan`).
- Use `[attr.*]` when no property exists.
- Use `[class.*]` and `[style.*]` for classes and styles.

```
[attr.colspan]="span"
[class.active]="isActive"
[style.color]="color"
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
  styles: [
    `
      table {
        border-collapse: collapse;
        margin-top: 10px;
      }
      th,
      td {
        border: 1px solid #ccc;
        padding: 8px 10px;
      }
      .toolbar {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    `,
  ],
  template: `
    <h3>Attribute Binding (attr.*)</h3>

    <div class="toolbar">
      <label
        >Colspan:
        <input
          type="range"
          min="1"
          max="3"
          [value]="span"
          (input)="span = +$any($event.target).value"
        />
        {{ span }}</label
      >
      <label
        >Title:
        <input [value]="title" (input)="title = $any($event.target).value"
      /></label>
    </div>

    <table [attr.title]="title">
      <thead>
        <tr>
          <th>A</th>
          <th>B</th>
          <th>C</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td [attr.colspan]="span" style="background:#f9fbff">
            colspan={{ span }}
          </td>
          <td *ngIf="span < 2">B</td>
          <td *ngIf="span < 3">C</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class App {
  span = 1;
  title = "Data table";
}

bootstrapApplication(App);
```

### Example Explained

- `[attr.title]="title"`: Sets the table's `title` attribute from the `title` field.
- `[attr.colspan]="span"`: Binds the cell's `colspan` attribute to the number in `span`.
- Range input: Adjusts `span` by reading `$event.target.value`; the template reflects the change.
- Conditional cells: `*ngIf` shows/hides extra columns based on the current `span`.
