# Angular Dynamic Components

> Source: https://www.w3schools.com/angular/angular_dynamic_components.asp

# Angular Dynamic Components

## Dynamic Components Essentials

- **createComponent()**: Create components at runtime and pass `inputs`, `outputs`, and `directives` directly.
- **Selectorless components**: Standalone components can be used without a selector via `*ngComponentOutlet`.
- **Signals**: Drive dynamic state from `signal()` and read in templates by calling the signal.

## createComponent() with inputs & outputs

- Provide `inputs`/`outputs` and an optional `hostElement` to attach into the DOM.
- Use `EnvironmentInjector` (or `inject()`) so the component can resolve providers.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import {
  Component,
  EventEmitter,
  Output,
  Input,
  ElementRef,
  ViewChild,
  inject,
  EnvironmentInjector,
  ComponentRef,
} from "@angular/core";
import { createComponent } from "@angular/core";

@Component({
  standalone: true,
  template: `
    <div style="padding:8px;border:1px solid #ddd;border-radius:6px;">
      <h4 style="margin:0 0 8px 0;">{{ title }}</h4>
      <button (click)="clicked.emit()">Click</button>
    </div>
  `,
})
export class Card {
  @Input() title = "Card";
  @Output() clicked = new EventEmitter<void>();
}

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Dynamic createComponent()</h3>
    <div
      #host
      style="min-height:60px;border:1px dashed #aaa;padding:8px;border-radius:6px;"
    ></div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
      <button (click)="mount()">Mount</button>
      <button (click)="update()">Update input</button>
      <button (click)="unmount()">Unmount</button>
    </div>
  `,
})
export class App {
  @ViewChild("host", { read: ElementRef }) host!: ElementRef<HTMLElement>;
  env: EnvironmentInjector = inject(EnvironmentInjector);
  ref: ComponentRef<Card> | null = null;

  mount() {
    if (this.ref) return;
    this.ref = createComponent(Card, {
      environmentInjector: this.env,
      hostElement: this.host.nativeElement,
    });
    this.ref.setInput?.("title", "Hello from Dynamic");
    this.ref.instance.clicked.subscribe(() => alert("Card clicked"));
  }
  update() {
    if (!this.ref) return;
    this.ref.setInput?.(
      "title",
      "Updated Title " + new Date().toLocaleTimeString(),
    );
  }
  unmount() {
    this.ref?.destroy();
    this.ref = null;
  }
}

bootstrapApplication(App);
```

### Example explained

- **createComponent(Card, ...)**: Creates the `Card` component at runtime and returns a component ref.
- **environmentInjector**: Supplies DI so the dynamic component can resolve providers.
- **hostElement**: Attaches the component's host into the given DOM element (`#host`).
- **inputs/outputs**: Sets initial inputs and wires output callbacks (e.g., `clicked`).
- **setInput / destroy**: Update inputs later with `ref.setInput(...)` and clean up via `ref.destroy()`.

**Notes:**

- **Cleanup:** Always call `destroy()` on the component ref when removing it.
- **Updating inputs:** Use `setInput(name, value)` on the component ref to push new input values.

## Selectorless via \*ngComponentOutlet

- Render a standalone component without a selector using `*ngComponentOutlet`.
- Pass `inputs` and `outputs` inline in the outlet micro-syntax.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, EventEmitter, Output, Input, signal } from "@angular/core";
import { NgComponentOutlet } from "@angular/common";

@Component({
  standalone: true,
  template: `<button (click)="clicked.emit()">{{ label }}</button>`,
})
export class ActionButton {
  @Input() label = "Do it";
  @Output() clicked = new EventEmitter<void>();
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <h3>Selectorless via *ngComponentOutlet</h3>
    <p>Clicks: {{ clicks() }}</p>
    <ng-container
      *ngComponentOutlet="
        ActionButton;
        inputs: { label: 'Launch' };
        outputs: { clicked: onClick }
      "
    ></ng-container>
  `,
})
export class App {
  ActionButton = ActionButton;
  clicks = signal(0);
  onClick = () => this.clicks.update((n) => n + 1);
}

bootstrapApplication(App);
```

**Notes:**

- **Inputs/Outputs:** The outlet micro-syntax supports `inputs` and `outputs` bags for easy wiring.
- **Composition:** Use outlets inside `@if`/`@for` for conditional or repeated dynamic UIs.
