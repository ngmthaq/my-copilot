# Angular SSR & Hydration

> Source: https://www.w3schools.com/angular/angular_ssr_hydration.asp

# Angular SSR & Hydration

## SSR & Hydration Essentials

- **SSR**: Pre-renders HTML on the server for faster first paint and SEO.
- **Hydration**: Reuses server HTML on the client by wiring up state and listeners (no full re-render).
- **Determinism**: Keep render output predictable; make effects idempotent.

```typescript
// Deterministic render (no random IDs during render)
@Component({ template: `<div>Hello</div>` })
class App {}
```

Tip: Keep effects idempotent and avoid non-deterministic rendering to ensure smooth hydration.

## Hydration-safe Checks

Only call browser-only APIs when running in the browser. Guard with feature detection or platform checks.

```typescript
// Simple feature detection
const isBrowser = typeof window !== "undefined";

// Angular platform check
import { PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

const platformId = inject(PLATFORM_ID);
const onBrowser = isPlatformBrowser(platformId);
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>SSR & Hydration</h3>
    <p>Is Browser: {{ isBrowser }}</p>
  `,
})
class App {
  isBrowser = typeof window !== "undefined";
}

bootstrapApplication(App);
```

### Example Explained

- **isBrowser**: Uses `typeof window !== 'undefined'` to check if code runs in the browser.
- **Hydration-safe**: Avoids accessing browser-only APIs during server render; reads them only after hydration on the client.
- **SSR → Hydration**: Server renders initial HTML; the client attaches listeners/state without re-rendering the whole view.

**Guidelines:**

- Avoid accessing `window`/`document` during SSR.
- Check availability first.
- Defer side effects (e.g., event listeners, measurements) until after hydration.
- Use feature detection over user-agent checks.

## SSR Tips

- Use pure, deterministic templates (avoid random values during render).
- Defer heavy work to effects that run post-hydration.
- Use TransferState to reuse SSR-fetched data on the client.

```typescript
import { TransferState, makeStateKey } from "@angular/platform-browser";

const DATA_KEY = makeStateKey("initial-data");
// Server: state.set(DATA_KEY, data)
// Client: const cached = state.get(DATA_KEY, null);
```

**Best practices:**

- Stabilize IDs across server and client to avoid mismatch.
- Avoid time-based randomness during render; compute after hydration where needed.
- Cache SSR-fetched data via TransferState to prevent double-fetch.
