# Angular Components

> Source: https://www.w3schools.com/angular/angular_components.asp

# Angular Components

Components are the building blocks of Angular apps. Each component controls a view (its template).

## Component Essentials

- Build reusable UI blocks with components.
- `@Component` ties together selector, template, styles, and logic; use the selector (e.g., `<hello-comp>`) in templates.
- Communicate with parents via `@Input()` and `@Output()`.
- Project parent content with `<ng-content>`.

```typescript
@Component({ selector: 'hello-comp' })
<hello-comp></hello-comp>
```

## Anatomy of a Component

- **Selector**: the tag you place in templates (e.g., `<app-root>`).
- **Template** and **styles**: inline or external files.
- **Standalone**: set `standalone: true` and import dependencies in `imports`.

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "hello-comp",
  standalone: true,
  imports: [],
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  template: `<p>Hello!</p>`,
})
export class HelloComponent {}
```

## Component Input

- Pass data from parent to child with `@Input()`.
- Bind from the parent template with `[prop]` (e.g., `[name]="parentValue"`).
- One-way flow: `parent → child`.
- Provide defaults and clear types for predictable templates.

```typescript
@Input() name: string;
<hello-comp [name]="parentValue"></hello-comp>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, Input } from "@angular/core";

@Component({
  selector: "hello-comp",
  standalone: true,
  template: `<p>Hello {{ name }} from child!</p>`,
})
export class HelloComponent {
  @Input() name = "";
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [HelloComponent],
  template: `
    <h3>Parent Component</h3>
    <hello-comp [name]="user"></hello-comp>
  `,
})
export class App {
  user = "Angular";
}

bootstrapApplication(App);
```

### Example explained

- `@Input() name`: Declares an input property on the child component.
- `[name]="user"`: Binds the parent's `user` value to the child's `name` input.
- One-way flow: Data flows `parent → child`. To update parent state, emit an output from the child.

## Component Output

- Notify the parent of events with `@Output()`.
- Emit via `EventEmitter<T>`; the parent listens with `(event)="handler($event)"`.
- Send simple, well-typed payloads.

```typescript
@Output() saved = new EventEmitter<number>();
<child-comp (saved)="onSaved($event)"></child-comp>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "counter-button",
  standalone: true,
  template: ` <button (click)="inc()">Clicked {{ count }} times</button> `,
})
export class CounterButton {
  @Input() step = 1;
  @Output()
  clicked = new EventEmitter();
  count = 0;
  inc() {
    this.count += this.step;
    this.clicked.emit(this.count);
  }
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CounterButton],
  template: `
    <h3>Component Output</h3>
    <counter-button
      [step]="2"
      (clicked)="onChildClicked($event)"
    ></counter-button>
    <p>Parent received: {{ lastCount }}</p>
  `,
})
export class App {
  lastCount = 0;
  onChildClicked(n) {
    this.lastCount = n;
  }
}

bootstrapApplication(App);
```

### Example explained

- `@Output() clicked = new EventEmitter<number>()`: Declares output emitting a number to the parent.
- `(clicked)="onChildClicked($event)"`: The parent listens for the `clicked` event; `$event` carries the emitted number.
- `count/step`: The child increments `count` by `step` and emits the updated total.

## Content Projection

- Render parent-provided content inside a child component.
- Mark insertion points with `<ng-content>`.
- Use `select` to target specific slots (e.g., title vs body).

```typescript
<ng-content></ng-content>
<ng-content select="[card-title]"></ng-content>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "w3-card",
  standalone: true,
  styles: [
    `
      .card {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px;
        max-width: 360px;
      }
      .card-header {
        font-weight: 600;
        margin-bottom: 6px;
      }
      .card-body {
        color: #333;
      }
    `,
  ],
  template: `
    <div class="card">
      <div class="card-header">
        <ng-content select="[card-title]"></ng-content>
      </div>
      <div class="card-body"><ng-content></ng-content></div>
    </div>
  `,
})
export class CardComponent {}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CardComponent],
  template: `
    <h3>Content Projection (ng-content)</h3>

    <w3-card>
      <span card-title>Welcome</span>
      <p>Project any markup into a reusable shell component.</p>
    </w3-card>

    <br />

    <w3-card>
      <span card-title>Another Card</span>
      <ul>
        <li>Works with lists</li>
        <li>Images, buttons, etc.</li>
      </ul>
    </w3-card>
  `,
})
export class App {}

bootstrapApplication(App);
```

### Example explained

- `<ng-content>`: Projects parent content into the child component's template.
- `select="[card-title]"`: Defines a named slot; only elements with the `card-title` attribute are projected there.
- Default slot: Unqualified `<ng-content>` renders all remaining projected content.

## Lifecycle Hooks

- **Initialization**: Use `ngOnInit` for setup that needs bindings to be resolved.
- **Teardown**: Use `ngOnDestroy` to clean up timers/subscriptions.
- Other hooks include `ngOnChanges`, `ngAfterViewInit`, etc.

```typescript
import { Component, OnInit, OnDestroy } from "@angular/core";

@Component({ selector: "demo", standalone: true, template: `<p>Lifecycle</p>` })
export class Demo implements OnInit, OnDestroy {
  intervalId: any;
  ngOnInit() {
    this.intervalId = setInterval(() => {
      /* ... */
    }, 1000);
  }
  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
```
