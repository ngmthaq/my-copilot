# Angular Advanced DI

> Source: https://www.w3schools.com/angular/angular_di_advanced.asp

# Angular Advanced DI

## Advanced DI Essentials

Advanced DI uses hierarchical injectors, custom `InjectionToken`, optional and multi providers, and function-style `inject()` to compose flexible configurations.

**Key concepts:**

- **Scope**: Hierarchical injectors mean providers at app/route/component levels define where instances live.
- **Tokens**: Use `InjectionToken` for non-class values and configuration.
- **Function inject**: Use `inject()` in constructors or utility functions.
- **Optional & Multi**: Optional dependencies and multi providers enable flexible composition.

```typescript
import { InjectionToken, inject, Optional } from "@angular/core";

// Tokens
export const CONFIG = new InjectionToken<{ api: string }>("CONFIG");
export const FEATURES = new InjectionToken<string[]>("FEATURES");

// Optional inject
const cfg = inject(CONFIG, { optional: true });

// Multi providers
bootstrapApplication(App, {
  providers: [
    { provide: CONFIG, useValue: { api: "/api" } },
    { provide: FEATURES, useValue: "search", multi: true },
    { provide: FEATURES, useValue: "share", multi: true },
  ],
});
```

### Code Explained

- **InjectionToken**: Defines a typed token for non-class values and configuration.
- **inject(TOKEN, { optional: true })**: Retrieves a dependency and returns `null`/`undefined` when missing.
- **multi: true**: Collects multiple provider values into an array for the same token.

## Advanced DI Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, InjectionToken, inject } from "@angular/core";

const FEATURES = new InjectionToken<string[]>("FEATURES");

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>DI: Multi Providers</h3>
    <p>Features: {{ features.join(", ") }}</p>
  `,
})
class App {
  features = inject(FEATURES);
}

bootstrapApplication(App, {
  providers: [
    { provide: FEATURES, useValue: "search", multi: true },
    { provide: FEATURES, useValue: "share", multi: true },
    { provide: FEATURES, useValue: "ai", multi: true },
  ],
});
```

**Key points:**

- Use `InjectionToken` for values and interfaces, not classes
- Add `multi: true` to collect many contributions under one token
- Use providers at routes/components instead of root when isolation is needed

## Optional and Multi Providers

Use `@Optional()` or `inject(TOKEN, { optional: true })` when a dependency is not required. Multi providers let many values contribute to the same token.

```typescript
import { InjectionToken, inject, Optional } from '@angular/core';

export const USER_NAME = new InjectionToken<string>('USER_NAME');

// Constructor optional
constructor(@Optional() public maybeName?: string) {}

// Function optional
const name = inject(USER_NAME, { optional: true });
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, InjectionToken, inject } from "@angular/core";

const USER_NAME = new InjectionToken<string>("USER_NAME");
const FEATURES = new InjectionToken<string[]>("FEATURES");

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Optional & Multi</h3>
    <p>Hello: {{ name || "Anonymous" }}</p>
    <p>Features: {{ features?.join(", ") || "∅" }}</p>
  `,
})
class App {
  name = inject(USER_NAME, { optional: true });
  features = inject(FEATURES, { optional: true });
}

bootstrapApplication(App, {
  providers: [
    { provide: USER_NAME, useValue: "Dana" },
    { provide: FEATURES, useValue: "search", multi: true },
    { provide: FEATURES, useValue: "share", multi: true },
  ],
});
```

**Important notes:**

- Always handle `null` when a dependency is optional
- Name tokens clearly to prevent accidental reuse across features
- Model global settings with tokens and override per route/component as needed
