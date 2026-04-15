# Angular Animations

> Source: https://www.w3schools.com/angular/angular_animations.asp

# Angular Animations

Animations in Angular are declarative: define `trigger`/`transition`/`animate` in the component and toggle state from data; enable app-wide with `provideAnimations()`.

## Animations Essentials

- **trigger**: Define a named animation bound in the template (e.g., `[@openClose]`).
- **transition**: Declare when it runs (state changes or wildcards like `* <=> *`).
- **animate**: Set duration/easing and final styles via `style()`.

**Setup:**

- **Install:** `npm install @angular/animations`
- **Enable:** Provide animations app-wide with `provideAnimations()` from `@angular/platform-browser/animations`.
- **Opt-out:** Use `provideNoopAnimations()` to disable motion (e.g., in tests).

```typescript
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";

@Component({
  animations: [
    trigger("openClose", [
      state("open", style({ opacity: 1 })),
      state("closed", style({ opacity: 0 })),
      transition("open <=> closed", [animate("200ms ease-in-out")]),
    ]),
  ],
})
class App {}
```

## Component Animations

Define triggers on the component. Toggle state through data to keep templates simple.

```typescript
<div [@openClose]="open ? 'open' : 'closed'">...</div>
toggle() { this.open = !this.open; }
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { provideAnimations } from "@angular/platform-browser/animations";

@Component({
  selector: "app-root",
  standalone: true,
  animations: [
    trigger("openClose", [
      state("open", style({ height: "80px", opacity: 1 })),
      state("closed", style({ height: "0px", opacity: 0 })),
      transition("open <=> closed", [animate("200ms ease-in-out")]),
    ]),
  ],
  template: `
    <h3>Animations</h3>
    <button (click)="open = !open">Toggle</button>
    <div
      [@openClose]="open ? 'open' : 'closed'"
      style="overflow:hidden;background:#e3f2fd;margin-top:8px"
    >
      Panel
    </div>
  `,
})
class App {
  open = true;
}

bootstrapApplication(App, { providers: [provideAnimations()] });
```

**Performance:** Animate `opacity`/`transform` for smoother motion; layout properties can be more expensive.

**State-driven:** Keep animations declarative and driven by component state. Avoid imperative DOM calls.

**Accessibility:** Respect `prefers-reduced-motion` with shorter or disabled animations when appropriate.

```typescript
import { animation, style, animate, useAnimation } from "@angular/animations";

// Reusable animation definition
export const fadeIn = animation([
  style({ opacity: 0 }),
  animate("{{time}} ease-out", style({ opacity: 1 })),
]);

// In component trigger:
// transition(':enter', [ useAnimation(fadeIn, { params: { time: '200ms' } }) ])
```

## Providing Animations

Use `provideAnimations()` to enable animations across the app. Use `provideNoopAnimations()` in tests or when disabling motion.

```typescript
import {
  provideAnimations,
  provideNoopAnimations,
} from "@angular/platform-browser/animations";

bootstrapApplication(App, { providers: [provideAnimations()] });
// Tests or opt-out:
// bootstrapApplication(App, { providers: [provideNoopAnimations()] });
```

**Notes:**

- **Testing:** Disable animations in tests for stable timing using `provideNoopAnimations()`.
- **Conditional enablement:** Feature-flag or disable heavy animations on low-power devices.
