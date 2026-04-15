# Angular Conditional

> Source: https://www.w3schools.com/angular/angular_conditional_rendering.asp

# Angular Conditional Rendering

## Conditional Rendering Essentials

- Use `@if` / `@else if` / `@else` for conditional logic
- Use `@switch` to select one view among many
- **Signals**: Drive conditions from signals and read them with `sig()` in templates
- **Hide vs remove:** `@if` removes from the DOM; use `[hidden]` or CSS to hide without destroying
- **Legacy**: `*ngIf` and `[ngSwitch]` remain supported but are not shown here

```typescript
@if (condition) { <p>Shown</p> } @else { <p>Hidden</p> }

@switch (value) {
  @case ('x') { <p>X</p> }
  @default { <p>Other</p> }
}

<div [hidden]="!isVisible">Hidden but in DOM</div>
```

## Basic Conditional Rendering

Render content with `@if` / `@else`. Drive booleans from signals; keep template expressions simple.

```typescript
@if (show()) { <p>Now you see me!</p> } @else { <p>Now I'm hidden.</p> }
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Conditional Rendering</h3>
    <button (click)="show.set(!show())">Toggle</button>
    @if (show()) {
      <p>Now you see me!</p>
    } @else {
      <p>Now I'm hidden.</p>
    }
  `,
})
export class App {
  show = signal(true);
}

bootstrapApplication(App);
```

## @switch

Switch on a single value with `@switch` and render the matching case. Always provide an explicit default for unexpected values with `@default`.

```typescript
@switch (status) {
  @case ('loading') { <p>Loading...</p> }
  @case ('success') { <p>Success!</p> }
  @case ('error') { <p style="color:crimson">Error!</p> }
  @default { <p>Unknown status</p> }
}
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Conditional Rendering with @switch</h3>
    <label>
      Status:
      <select (change)="status.set($any($event.target).value)">
        <option value="loading">loading</option>
        <option value="success">success</option>
        <option value="error">error</option>
      </select>
    </label>

    @switch (status()) {
      @case ('loading') { <p>Loading...</p> }
      @case ('success') { <p>Success!</p> }
      @case ('error') { <p style="color:crimson">Error!</p> }
      @default { <p>Unknown status</p> }
    }
  `,
})
export class App {
  status = signal<"loading" | "success" | "error" | string>("loading");
}

bootstrapApplication(App);
```

## Multi-state with @if

Use `@if` / `@else if` / `@else` for readable multi-state flows.

```typescript
@if (!loading() && !error()) {
  <p>Content loaded successfully.</p>
} @else if (loading()) {
  <p>Loading...</p>
} @else {
  <p style="color:crimson">Something went wrong.</p>
}
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Multi-state with @if</h3>

    <div class="toolbar">
      <button (click)="startLoading()">Start Loading</button>
      <button (click)="showError()">Set Error</button>
      <button (click)="reset()">Reset</button>
    </div>

    @if (!loading() && !error()) {
      <p>Content loaded successfully.</p>
    } @else if (loading()) {
      <p>Loading...</p>
    } @else {
      <p style="color:crimson">Something went wrong.</p>
    }
  `,
})
export class App {
  loading = signal(false);
  error = signal(false);
  private _timer: any;

  startLoading() {
    this.loading.set(true);
    this.error.set(false);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.loading.set(false);
    }, 800);
  }
  showError() {
    this.error.set(true);
    this.loading.set(false);
  }
  reset() {
    this.loading.set(false);
    this.error.set(false);
  }
}

bootstrapApplication(App);
```
