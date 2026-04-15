# Angular Services & DI

> Source: https://www.w3schools.com/angular/angular_services.asp

# Angular Services & Dependency Injection

## Services & DI Essentials

- **What**: A service holds reusable logic/state. DI (dependency injection) supplies instances where needed.
- **Scope**: Provide in `root` for a shared singleton, or provide in a component for isolated instances.
- **Use cases**: Data fetching, caching, business rules, cross-component state.
- **Mental model**: DI is like a power outlet: you plug in and Angular gives you a ready instance.
- **Decorator**: Use `@Injectable()` on classes that inject other services.

```typescript
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CounterService {
  value = 0;
  inc() {
    this.value++;
  }
}
```

## Service Basics

- Decorate classes with `@Injectable()` (required if they inject other services).
- Inject services into constructors to use them in components.
- Use `providedIn: 'root'` for a shared singleton.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CounterService {
  value = 0;
  inc() {
    this.value++;
  }
  dec() {
    this.value--;
  }
  reset() {
    this.value = 0;
  }
}

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Services</h3>
    <p>Counter: {{ counter.value }}</p>
    <button (click)="counter.inc()">+</button>
    <button (click)="counter.dec()">-</button>
    <button (click)="counter.reset()">Reset</button>
  `,
})
export class App {
  constructor(public counter: CounterService) {}
}

bootstrapApplication(App);
```

## Shared Service Across Components

- `providedIn: 'root'` shares one instance across the app.
- Updating in one component reflects in others using the same service.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CounterService {
  value = 0;
  inc() {
    this.value++;
  }
  dec() {
    this.value--;
  }
}

@Component({
  selector: "counter-a",
  standalone: true,
  template: `
    <h4>Counter A</h4>
    <p>Value: {{ counter.value }}</p>
    <button (click)="counter.inc()">+1</button>
  `,
})
export class CounterA {
  constructor(public counter: CounterService) {}
}

@Component({
  selector: "counter-b",
  standalone: true,
  template: `
    <h4>Counter B</h4>
    <p>Value: {{ counter.value }}</p>
    <button (click)="counter.inc()">+1</button>
  `,
})
export class CounterB {
  constructor(public counter: CounterService) {}
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CounterA, CounterB],
  template: `
    <counter-a></counter-a>
    <counter-b></counter-b>
  `,
})
export class App {}

bootstrapApplication(App);
```

## Component-Provided Service (Hierarchical DI)

- Provide a service in a component's `providers` to create a local instance for its subtree.
- Sibling subtrees receive separate instances.

```typescript
@Component({ providers: [LocalCounterService] })
export class Panel {}
```

### Example

```typescript
import { Component, Injectable } from "@angular/core";

@Injectable()
export class LocalCounterService {
  id = Math.floor(Math.random() * 10000);
  value = 0;
  inc() {
    this.value++;
  }
}

@Component({
  selector: "panel-a",
  standalone: true,
  providers: [LocalCounterService],
  template: `<h4>Panel A (own provider)</h4>`,
})
export class PanelA {}
```

## Service Design Tips

- **Avoid component coupling:** Do not inject components into services; keep services UI-agnostic.
- **Expose clear APIs:** Use small methods returning plain values or Observables; keep internal state private.
- **Configuration via tokens:** Use injection tokens for configurable values to simplify testing and reuse.
- **Scope deliberately:** Use `providedIn: 'root'` for app-wide singletons; provide at a component for isolated instances.
