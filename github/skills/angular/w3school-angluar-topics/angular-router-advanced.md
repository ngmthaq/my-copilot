# Angular Router Advanced

> Source: https://www.w3schools.com/angular/angular_router_advanced.asp

# Angular Router Advanced

Advanced routing covers functional guards/resolvers with `inject()`, auxiliary outlets for multiple views, and preloading strategies; return a `UrlTree` to redirect.

## Router Advanced Essentials

- **Functional guards/resolvers**: Use functions with `inject()` for type-safe navigation.
- **Aux outlets**: Named `RouterOutlet`s render multiple views (e.g., `/inbox(compose:modal)`).
- **Preloading & data**: Use `data` for static flags and preloading strategies to optimize navigation.

```typescript
import { inject } from "@angular/core";
import {
  Router,
  Routes,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from "@angular/router";

function canActivate() {
  const router = inject(Router);
  return /* condition */ true || router.createUrlTree(["/"]);
}

const routes: Routes = [
  {
    path: "feature",
    loadComponent: () => import("./feature").then((m) => m.Feature),
    data: { title: "Feature" },
    canActivate: [canActivate],
  },
  {
    path: "inbox",
    loadComponent: () => import("./inbox").then((m) => m.Inbox),
  },
  {
    path: "compose",
    outlet: "modal",
    loadComponent: () => import("./compose").then((m) => m.Compose),
  },
];

provideRouter(routes, withPreloading(PreloadAllModules));
```

### Code explained

- **inject(Router)**: Accesses the Router inside a guard function.
- **UrlTree redirect**: Return `router.createUrlTree(['/'])` to redirect instead of navigating imperatively.
- **Aux outlet**: A route with `outlet: 'modal'` targets a named `RouterOutlet`.

**Notes:**

- **Guard types:** `canActivate`, `canDeactivate`, `canMatch` (decide if a route config matches), `canLoad` (block loading lazy content).

```typescript
import { CanDeactivateFn, CanMatchFn } from "@angular/router";

// canDeactivate: confirm navigation away
const canDeactivate: CanDeactivateFn<any> = (
  component,
  curr,
  currState,
  nextState,
) => confirm("Leave this page?");

// canMatch: decide if a route config should match current URL
const canMatch: CanMatchFn = (route, segments) =>
  segments[0]?.path === "secret";
```

## Functional Guards with inject()

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component, signal, inject } from "@angular/core";
import { Routes, provideRouter, Router, RouterOutlet } from "@angular/router";

const isLoggedIn = signal(false);

function canActivate() {
  const router = inject(Router);
  return isLoggedIn() || router.createUrlTree(["/"]);
}

@Component({
  selector: "home-page",
  standalone: true,
  template: `<p>Home</p>
    <button (click)="login()">Login</button>`,
})
class Home {
  login() {
    isLoggedIn.set(true);
  }
}

@Component({
  selector: "secret-page",
  standalone: true,
  template: `<p>Top Secret</p>`,
})
class Secret {}

const routes: Routes = [
  { path: "", component: Home },
  { path: "secret", component: Secret, canActivate: [canActivate] },
];

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<a [routerLink]="['/']">Home</a> |
    <a [routerLink]="['/secret']">Secret</a> <router-outlet></router-outlet>`,
})
class App {}

bootstrapApplication(App, { providers: [provideRouter(routes)] });
```

**Notes:**

- **Use functions:** Write guards as pure functions and use `inject()` to access services.
- **Redirects:** Return a `UrlTree` instead of navigating imperatively.
- **Keep them fast:** Avoid heavy work in guards; delegate to services and cache where possible.

## Preloading and Route Data

- Use route `data` for static flags (titles, permissions).
- Lazy load features and enable preloading to optimize navigation.

```typescript
provideRouter(routes, withPreloading(PreloadAllModules));
// Route with data
{ path: 'feature', loadComponent: () => import('./feature').then(m => m.Feature), data: { title: 'Feature' } }
```

**Notes:**

- **Route data:** Use `data` for static flags (titles, permissions) over hardcoding in components.
- **Preloading:** Use strategies to fetch likely-next modules in the background.
- **Measure:** Profile bundle sizes and navigation timing before/after enabling preloading.
