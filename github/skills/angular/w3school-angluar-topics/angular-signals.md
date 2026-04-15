# Angular Signals

> Source: https://www.w3schools.com/angular/angular_signals.asp

# Angular Signals

Signals are reactive state: read by calling (e.g., `count()`), update with `set()`/`update()`, derive with `computed()`, and run side effects with `effect()`.

## Signals Essentials

- **Signal**: A value you read by calling it (e.g., `count()`). Updating it notifies dependents.
- **State**: Use `signal()` for local component state.
- **Derived**: Use `computed()` for read-only formulas.
- **Effects**: Use `effect()` to run side effects when dependencies change.

```typescript
import { signal, computed, effect } from "@angular/core";

const count = signal(0);
const double = computed(() => count() * 2);
effect(() => console.log("count =", count()));

count.update((n) => n + 1);
```

## Working with Signals

Update a signal with `.set()` or `.update()`. Read a signal by calling it like a function.

```typescript
const count = signal(0);
count.set(1);
count.update((n) => n + 1);
console.log(count());
```

## Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal, computed, effect } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Signals</h3>
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="inc()">Increment</button>
  `,
})
export class App {
  count = signal(0);
  double = computed(() => this.count() * 2);
  constructor() {
    effect(() => console.log("count changed", this.count()));
  }
  inc() {
    this.count.update((n) => n + 1);
  }
}

bootstrapApplication(App);
```

### Example Explained

- `signal(0)`: Creates reactive state you read by calling (e.g., `count()`).
- `computed(() => ...)`: Derives a read-only value (`double()`) from other signals.
- `effect(() => ...)`: Runs whenever dependencies change (logs on `count()` updates).
- `update(n => n + 1)`: Writes to the signal and notifies dependents.

## Derived Values and Effects

- Wrap read-only formulas in `computed()`; it recalculates when dependencies change.
- Use `effect()` for side effects such as logging or syncing.
- Keep effects idempotent and light.

```typescript
const a = signal(2);
const b = signal(3);
const sum = computed(() => a() + b());
effect(() => console.log("sum =", sum()));
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal, computed, effect } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Derived & Effects</h3>
    <p>a: {{ a() }} | b: {{ b() }} | sum: {{ sum() }}</p>
    <button (click)="incA()">inc a</button>
    <button (click)="incB()">inc b</button>
  `,
})
export class App {
  a = signal(2);
  b = signal(3);
  sum = computed(() => this.a() + this.b());
  constructor() {
    effect(() => console.log("sum =", this.sum()));
  }
  incA() {
    this.a.update((n) => n + 1);
  }
  incB() {
    this.b.update((n) => n + 1);
  }
}

bootstrapApplication(App);
```

## RxJS Interop

Convert an Observable to a signal with `toSignal()` for template-friendly reads. Convert a signal to an Observable with `toObservable()` to integrate with stream APIs.

```typescript
import {
  signal,
  computed,
  effect,
  toSignal,
  toObservable,
} from "@angular/core";
import { interval, map } from "rxjs";

// Observable -> Signal
const seconds$ = interval(1000).pipe(map((n) => n + 1));
const seconds = toSignal(seconds$, { initialValue: 0 });

// Signal -> Observable
const count = signal(0);
const count$ = toObservable(count);
```

**Notes:**

- Always provide `initialValue` to `toSignal()` for SSR and first render.
- Manage subscriptions on the Observable side; `toSignal()` handles teardown automatically.

## Signals Quick Reference

- **Create**: `signal(initial)`
- **Read**: call the signal (e.g., `count()`)
- **Write**: `set(value)`, `update(fn)`
- **Derived**: `computed(fn)`
- **Effects**: `effect(fn)`
- **RxJS interop**: `toSignal(observable, { initialValue })`, `toObservable(signal)`
