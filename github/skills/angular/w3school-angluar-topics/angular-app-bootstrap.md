# Angular App Bootstrap

> Source: https://www.w3schools.com/angular/angular_app_bootstrap.asp

# Angular App Bootstrap & Providers

## Bootstrap Starts Your App with a Standalone Root Component

Angular's bootstrap process initializes a standalone root component and registers providers (Router, HttpClient, etc.) at appropriate scopes for performance and testability.

## App Bootstrap Essentials

- **Start**: Use `bootstrapApplication()` to launch a standalone root component.
- **Provide features**: Add `provideRouter()`, `provideHttpClient()`, etc. at bootstrap.
- **DI**: A provider tells dependency injection how to create or supply a value for a token.
- **Scope**: Register at the smallest useful scope (feature/route) for performance and testability.

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient()],
});
```

## Basic Bootstrap and Global Providers

Bootstrap with Router and HttpClient for app-wide availability. Keep the root component minimal; configure providers at bootstrap.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { Routes, provideRouter, RouterOutlet } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

@Component({
  selector: "home-page",
  standalone: true,
  template: `<p>Home works</p>`,
})
class Home {}

const routes: Routes = [{ path: "", component: Home }];

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
class App {}

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient()],
});
```

### Example Explained

- **bootstrapApplication(App)**: Starts the app with a standalone root component.
- **provideRouter(routes)**: Registers the Router and routes.
- **provideHttpClient()**: Enables HttpClient app-wide.
- **RouterOutlet**: Renders the active route's component.

**Notes:**

- Root stays light: Keep the root component minimal; configure providers in `bootstrapApplication()`.
- Use functions: Use `provideRouter()` and `provideHttpClient()` instead of legacy modules.
- Lazy first: Favor lazy routes to reduce initial bundle and speed up startup.

## Feature-Scoped Providers

Provide services only where needed to avoid unnecessary globals. Feature/route providers can improve startup and testability.

```typescript
const routes = [
  {
    path: "admin",
    providers: [provideHttpClient()],
    loadComponent: () => import("./admin").then((m) => m.Admin),
  },
];
bootstrapApplication(App, { providers: [provideRouter(routes)] });
```

### Example

```typescript
import { Routes, provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

const routes: Routes = [
  {
    path: "admin",
    providers: [provideHttpClient()],
    loadComponent: () =>
      import("./admin.component").then((m) => m.AdminComponent),
  },
];

bootstrapApplication(App, { providers: [provideRouter(routes)] });
```

Only the admin area gets the extra providers. The rest of the app stays lean.

**Notes:**

- Scope carefully: Add providers only to features that need them to avoid unnecessary global singletons.
- Avoid duplication: Be aware that scoping providers can create new instances; ensure this is intended.

## HttpClient Setup

Add `provideHttpClient()` once at the desired scope. This enables HttpClient for that scope; add interceptors as needed.

```typescript
bootstrapApplication(App, { providers: [provideHttpClient()] });
```

**Notes:**

- Standalone-friendly: In standalone apps, use `provideHttpClient()` over importing HttpClientModule.
- Cross-cutting: Use interceptors for auth/logging; register them once at the appropriate scope.
