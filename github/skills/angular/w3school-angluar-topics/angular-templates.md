# Angular Templates

> Source: https://www.w3schools.com/angular/angular_templates.asp

## Components, Templates, and Selectors

- A **component** is a class that controls a view (its **template**)
- Each component has a **selector** (e.g., `app-root`) that you place in HTML
- The **root component** renders inside `index.html`'s `<app-root>`

## How Templates Work

1. **Initial render**: Angular creates the component and processes the template, wiring bindings between the DOM and component fields
2. **Change detection**: On user events, timers, or async work, Angular re-evaluates template expressions and updates only what changed
3. **Directives**: Create/destroy embedded views (DOM fragments) based on state
4. **Binding flow**: Interpolation/Property binding push data to the view. Event binding captures browser events back to the component

**Note**: Interpolation escapes HTML. Use property/attribute bindings for dynamic attributes. Use `?.` to avoid null errors.

## Syntax Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Hello {{ name }}</h3>
    <button (click)="name = 'Angular'">Reset</button>
  `,
})
export class App {
  name = "World";
}

bootstrapApplication(App);
```

HTML:

```html
<app-root></app-root>
```

### Example Explained

- `{{ name }}`: Interpolation reads the `name` field and inserts it as text
- `(click)`: Event binding updates the component state when the button is clicked

**Note**: Template expressions run in the component context. Keep them fast and side-effect free; do work in the class, not inline in the template.

## Template Essentials

Key concepts:

- **Templates** are the HTML that Angular renders for a component
- **Bindings**: interpolation `{{ ... }}`, property `[prop]`, and event `(event)`
- **Template refs**: local names like `#box` to reference elements or directives
- **Structural directives** (`*ngIf`, `*ngFor`) change the DOM layout

```html
<p>Hello {{ name }}</p>
<img [src]="url" (error)="onMissing()" />
<input #box (input)="save(box.value)" />
<li *ngFor="let item of items; index as i">{{ i }}. {{ item }}</li>
```

### Code Explained

- `{{ name }}`: Interpolation for text
- `[src]`: Property binding to set an element property
- `(error)`: Event binding to react to the image error event
- `#box`: Template reference variable; `box.value` reads the current input value
- `*ngFor ... index as i`: Structural directive to loop with the zero-based index

## Templates Overview

Upcoming topics include:

- Interpolation - show values with `{{ ... }}`
- Template Reference Variables - use `#var` to reference elements
- Null-Safe Navigation (`?.`) - read optional values safely
- Structural Directives: Micro-syntax - the `*` shorthand
- ngTemplateOutlet - render a template by reference
- Template Statements and $event - handle events and inputs
- Alias with as in `*ngIf` - create local aliases
- Pipes in Templates (`|`) - format and transform values
- Attribute Binding with attr. - bind to HTML attributes
- TrackBy with `*ngFor` - keep lists fast and stable
