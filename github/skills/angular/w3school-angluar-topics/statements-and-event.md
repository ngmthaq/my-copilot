# Statements and $event

> Source: https://www.w3schools.com/angular/angular_templates_statements.asp

# Angular Template Statements and $event

## What are Template Statements and $event?

- Run in response to events bound with `(click)`, `(input)`, etc.
- Use `$event` for the native event object.
- Use `$any(...)` to help with types like `target.value`.

## When to use Template Statements

- Simple UI interactions and state updates from events.
- Keep template logic minimal; move complex logic to the component class.
- Pair with template reference variables for straightforward interactions.

```typescript
<button (click)="count = count + 1">Add</button>
<input (input)="text = $any($event.target).value">
```

### Code explained

- `(click)`: Binds a click handler that updates component state.
- `$event`: The native event object; `$any($event.target).value` reads the input text.

## Example

Handle events in the template and use `$event` to access native values:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <button (click)="count = count + 1">Increment</button>
    <input
      placeholder="Type"
      (input)="text = $any($event.target).value"
      [value]="text"
    />
    <p>Count: {{ count }}</p>
    <p>Text: {{ text || "(empty)" }}</p>
  `,
})
export class App {
  count = 0;
  text = "";
}

bootstrapApplication(App);
```

```html
<app-root></app-root>
```

### Example explained

- `(click)="count = count + 1"`: Executes the statement in the component's context when the button is clicked, updating the `count` field.
- `$event`: The native event object. `$any($event.target).value` reads the current input text (casted to satisfy TypeScript).
- `[value]="text"`: One-way property binding that reflects the current component state back to the input element.
- **Keep logic small**: Do simple assignments in the template; move multi-step logic into component methods.
