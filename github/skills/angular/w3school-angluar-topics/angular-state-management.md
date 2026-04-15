# Angular State Management

> Source: https://www.w3schools.com/angular/angular_state_management.asp

# Angular State Management

## State Management Essentials

Angular state management organizes how data changes over time. The recommended approach prioritizes simplicity:

- **Local first**: Begin with component signals; elevate to a service (store) only when data sharing becomes necessary.
- **Signals**: Employ `signal()` for both local and service-backed state; derive computed values with `computed()`.
- **Interop**: Integrate RxJS only when stream semantics are required; maintain minimal global state.

```typescript
import { Injectable, signal, computed, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
class CounterStore {
  count = signal(0);
  double = computed(() => this.count() * 2);
  inc() {
    this.count.update((n) => n + 1);
  }
}

// Component: const store = inject(CounterStore);
```

## Service-backed Signals (Store)

Elevate state into a service to enable sharing across multiple components, improving reusability.

```typescript
import { Injectable, signal, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
class CounterStore {
  count = signal(0);
  inc() {
    this.count.update((n) => n + 1);
  }
}

// Component usage
class App {
  store = inject(CounterStore);
}
```

### Full Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, Injectable, signal, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
class CounterStore {
  count = signal(0);
  inc() {
    this.count.update((n) => n + 1);
  }
}

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Service with Signals</h3>
    <p>Count: {{ store.count() }}</p>
    <button (click)="store.inc()">Increment</button>
  `,
})
class App {
  store = inject(CounterStore);
}

bootstrapApplication(App);
```

### Implementation Notes

- `CounterStore` serves as a service holding a `signal` and an update method (`inc()`).
- `inject(CounterStore)` retrieves the store in the component without requiring constructor injection.
- `store.count()` reads the current value in templates; the button invokes `store.inc()`.

**Design guidelines:**

- Maintain a single source of truth per feature within a service; inject where necessary.
- Expose methods for updates; prevent direct state mutation from components.
- Use computed signals for derived values; keep side effects (like persistence) within the service.
- Bridge to streams only when needed for interoperability with RxJS-based APIs.

## Local vs Global State

- Preserve most state locally within components to minimize coupling.
- Promote to a shared service only when multiple features require access.
- Scope providers at the feature or route level when isolation is beneficial.

```typescript
import { provideRouter, Routes } from "@angular/router";

const routes: Routes = [
  { path: "", component: Home, providers: [CounterStore] },
];

bootstrapApplication(App, { providers: [provideRouter(routes)] });
```

**Guidelines:**

- Escalate state when multiple routes or components need identical data or when caching improves user experience.
- Differentiate between UI state (filters, dialogs) and server/cache state; manage them separately.
- Initialize lazily upon first use and establish reset points (e.g., during logout).
