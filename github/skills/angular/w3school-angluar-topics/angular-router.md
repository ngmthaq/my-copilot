# Angular Router

> Source: https://www.w3schools.com/angular/angular_router.asp

# Angular Router

## Router Essentials

- **URL-driven UI**: The Router swaps views based on the URL.
- `RouterOutlet`: Placeholder where the active route's component renders.
- `routerLink`: Navigate without full page reloads.
- `RouterLinkActive`: Adds classes to active links (use `{ exact: true }` for root).
- **Performance & control**: Lazy load feature areas; use guards to allow/block navigation.

```typescript
import {
  provideRouter,
  withHashLocation,
  RouterOutlet,
  RouterLink,
} from "@angular/router";

const routes = [
  { path: "", component: Home },
  { path: "about", component: About },
];

bootstrapApplication(App, {
  providers: [provideRouter(routes, withHashLocation())],
});

// Template
// <a routerLink="/about">About</a>
// <router-outlet></router-outlet>
```

## Router Basics

Define a `routes` array that maps paths to components. Provide routes with `provideRouter()` (use `withHashLocation()` for sandboxes). Use `routerLink` for navigation and `RouterOutlet` to render views.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import {
  provideRouter,
  RouterOutlet,
  RouterLink,
  withHashLocation,
} from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <h3>Router</h3>
    <nav>
      <a routerLink="/">Home</a> |
      <a routerLink="/about">About</a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class App {}

@Component({
  standalone: true,
  template: `<p>Home works!</p>`,
})
export class Home {}

@Component({
  standalone: true,
  template: `<p>About works!</p>`,
})
export class About {}

const routes = [
  { path: "", component: Home },
  { path: "about", component: About },
];

bootstrapApplication(App, {
  providers: [provideRouter(routes, withHashLocation())],
});
```

## Router Params

Capture variables in paths with `:id` (e.g., `/product/42`). Read them via `ActivatedRoute` (`snapshot` or `paramMap` observable).

```typescript
{ path: 'product/:id', component: Product }
```

### Example

```typescript
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "product-cmp",
  standalone: true,
  template: `<p>Product ID: {{ id }}</p>`,
})
export class Product implements OnInit {
  id = "";
  private route = inject(ActivatedRoute);
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id") ?? "";
  }
}
```

## Active Links

Use `routerLinkActive` to toggle classes when a link matches. Set `{ exact: true }` for root links like `/`.

```typescript
<a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
<a routerLink="/about" routerLinkActive="active">About</a>
```

## Lazy-loaded Component

Defer loading code until navigation with `loadComponent` or `loadChildren`. Improves initial load time by splitting bundles.

```typescript
{ path: 'about', loadComponent: () => import('./about').then(m => m.About) }
```

## Route Guard (canActivate)

Guards decide if navigation is allowed. Return `true` (allow), `false`/`UrlTree` (block/redirect), or async equivalents.

```typescript
export const authGuard = () => isLoggedIn ? true : inject(Router).createUrlTree(['/']);
{ path: 'protected', component: Protected, canActivate: [authGuard] }
```

### Example

```typescript
import { inject } from "@angular/core";
import { Router } from "@angular/router";

let loggedIn = false;

export const authGuard = () => {
  if (loggedIn) return true;
  const router = inject(Router);
  return router.createUrlTree(["/"]);
};
```

**Guard return types:** Return `boolean`, `UrlTree`, or an observable/promise of those.
