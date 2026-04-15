# Reference Variables

> Source: https://www.w3schools.com/angular/angular_templates_refvars.asp

# Angular Template Reference Variables

## What is a Template Reference Variable?

- Gives a local name (e.g., `#box`) to an element or directive instance.
- Lets you read values or call methods directly in the template.
- Scoped to the template where it is declared.

## When to use Template Reference Variables

- Simple interactions (read input value, focus an element).
- Access directive/component API in the view without extra bindings.
- For complex logic, use component methods and state.

## Example

Use template reference variables to read values or call methods directly in the template:

```
<input #box (input)="val = box.value">
<button (click)="box.focus()">Focus</button>
```

### Code explained

- `#box`: Declares a local template reference to the input element instance.
- **Read value**: `box.value` gets the current text of the input.
- **Call method**: `box.focus()` calls the native `focus()` on the input.

## Full Example

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
      .toolbar {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      input {
        padding: 6px 8px;
      }
    `,
  ],
  template: `
    <h3>Template Reference Variables (#var)</h3>
    <div class="toolbar">
      <input
        #box
        type="text"
        placeholder="Type something"
        (input)="current = box.value"
      />
      <button (click)="read(box.value)">Read value</button>
      <button (click)="box.focus()">Focus input</button>
      <span style="margin-left:8px;color:#666"
        >length={{ box.value?.length || 0 }}</span
      >
    </div>
    <p>Current: {{ current || "(empty)" }}</p>
  `,
})
export class App {
  current = "";
  read(val: string) {
    this.current = val ?? "";
  }
}

bootstrapApplication(App);
```

### Example explained

- `#box`: A template reference variable bound to the input element instance.
- **Read a value**: `box.value` reads the input's current text.
- **Call a method**: `box.focus()` calls the input's focus method.
- **Update state**: `(input)="current = box.value"` copies the current input text into the component's `current` field.
- **Scope**: The variable exists only in the template where it is declared.
