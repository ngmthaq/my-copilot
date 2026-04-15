# Angular Styling

> Source: https://www.w3schools.com/angular/angular_css_styling.asp

# Angular Styling

## Styling Essentials

Styling in Angular leverages class/style bindings in templates and component-scoped CSS to create maintainable, theme-friendly user interfaces.

Key approaches include:

- **Bindings**: Use `[class.foo]`/`[ngClass]` for classes and `[style.prop]`/`[ngStyle]` for styles
- **Themes**: Toggle CSS variables to switch light/dark modes or accent colors
- **Encapsulation**: Component styles are scoped by default; use `:host` and `:host-context()` for host and theme styling

**Best practices:**

- Use class bindings over inline styles for maintainability
- Import `CommonModule` for `ngClass`/`ngStyle` in standalone components
- Use CSS variables to implement theme toggles efficiently
- Component styles are scoped by default

## Basic Styling

```typescript
<div class="box"
  [class.highlight]="highlight"
  [ngClass]="{ big: big }"
  [style.color]="color"
  [style.borderColor]="color">...</div>
```

Use `[class.foo]` for single boolean toggles and `[ngClass]` when applying multiple classes. Keep complex styling in CSS classes rather than inline styles.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .box {
        padding: 12px;
        border: 2px solid #ccc;
        margin-top: 8px;
        border-radius: 6px;
      }
      .highlight {
        background: #fffa8b;
      }
      .big {
        font-size: 24px;
      }
      .toolbar button {
        margin-right: 6px;
      }
    `,
  ],
  template: `
    <h3>Styling</h3>
    <div class="toolbar">
      <button (click)="toggleHighlight()">Toggle Highlight</button>
      <button (click)="toggleBig()">Toggle Big</button>
      <button (click)="setColor('crimson')">Crimson</button>
      <button (click)="setColor('seagreen')">Green</button>
      <button (click)="setColor('royalblue')">Blue</button>
    </div>

    <div
      class="box"
      [class.highlight]="highlight"
      [ngClass]="{ big: big }"
      [style.color]="color"
      [style.borderColor]="color"
    >
      Styled box
    </div>
  `,
})
export class App {
  highlight = false;
  big = false;
  color = "royalblue";

  toggleHighlight() {
    this.highlight = !this.highlight;
  }
  toggleBig() {
    this.big = !this.big;
  }
  setColor(c: string) {
    this.color = c;
  }
}

bootstrapApplication(App);
```

## Dynamic Styling

```typescript
<div [ngClass]="{ fancy: fancy, rounded: rounded }"
     [ngStyle]="{ color: color, padding: pad + 'px' }">...</div>
```

Two-way binding with controls enables live style changes. `[ngClass]` toggles classes based on booleans, and `[ngStyle]` sets multiple style properties simultaneously.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3>Dynamic Styling</h3>

    <div class="toolbar">
      <label><input type="checkbox" [(ngModel)]="fancy" /> Fancy</label>
      <label><input type="checkbox" [(ngModel)]="rounded" /> Rounded</label>
      <label>Color <input type="color" [(ngModel)]="color" /></label>
    </div>

    <div
      class="box"
      [ngClass]="{ fancy: fancy, rounded: rounded }"
      [ngStyle]="{
        color: color,
        borderColor: color,
        padding: padding + 'px',
        fontSize: fontSize + 'px',
      }"
    >
      Styled box
    </div>
  `,
})
export class App {
  fancy = true;
  rounded = false;
  color = "#4169e1";
  padding = 12;
  fontSize = 18;
}

bootstrapApplication(App);
```

## Encapsulation

```css
:host {
  display: block;
}
:host(.dense) {
  padding: 8px;
}
:host-context(.theme-dark) {
  color: #eee;
}
```

Component styles are scoped by default to their host element. Use `:host` and `:host-context()` for host and theme-aware styling.

**Important considerations:**

- **Modes**: Default is `Emulated`; use `None` sparingly for global styles; `ShadowDom` isolates styles fully
- **Host styling**: Use `:host` over selecting wrapper tags; combine with classes on the host for variants
- **Theme context**: Use `:host-context(.theme-dark)` to adapt to parent themes without leaking global CSS
- **Avoid deep selectors**: Don't rely on `.parent .child` chains; expose tokens via CSS variables instead

## Theme with CSS Variables

CSS variables function as named paint buckets you can swap at runtime. Toggle a class to switch buckets (light/dark) and bind the accent variable for instant theme changes.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        --bg: #ffffff;
        --fg: #222;
        --accent: #4169e1;
      }
      .theme-dark {
        --bg: #121212;
        --fg: #eaeaea;
        --accent: #4f8cff;
      }
      .box {
        margin-top: 10px;
        padding: 14px;
        border-radius: 8px;
        border: 2px solid var(--accent);
        background: var(--bg);
        color: var(--fg);
      }
    `,
  ],
  template: `
    <h3>Theme with CSS Variables</h3>
    <div [class.theme-dark]="dark" class="toolbar">
      <button (click)="dark = !dark">
        Toggle {{ dark ? "Light" : "Dark" }}
      </button>
      <button (click)="setAccent('#e91e63')">Pink</button>
    </div>

    <div class="box" [style.--accent]="accent">
      This box follows the current theme and accent color.
    </div>
  `,
})
export class App {
  dark = false;
  accent = "#4169e1";

  setAccent(c: string) {
    this.accent = c;
  }
}

bootstrapApplication(App);
```

**Guidelines:**

- Don't hard-code colors — binding literal colors fights theming; use CSS variables and classes instead
- Keep theme variables at the component host or a top-level theme wrapper to avoid conflicts
- Respect user preference using `@media (prefers-color-scheme: dark)` to set a sensible default
- Define semantic design tokens (e.g., `--surface`, `--text`, `--accent`) for consistent theming
