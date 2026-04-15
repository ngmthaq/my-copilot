# Null-Safe Navigation

> Source: https://www.w3schools.com/angular/angular_templates_nullsafe.asp

# Angular Templates: Null-Safe Navigation (?.)

## What is Null-Safe Navigation (?.)?

- `?.` reads values that might be missing without throwing errors.
- If any segment is `null` or `undefined`, the result is `undefined`.
- Improves safety for deep property paths in templates.

## When to use Null-Safe Navigation

- Async or optional data where properties may be absent.
- Use `?.` (and optional chaining in code) over verbose checks.
- Combine with `??` to provide default values.

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <button (click)="toggle()">Toggle user</button>
    <p>Email: {{ user?.profile?.email || "(none)" }}</p>
  `,
})
export class App {
  user: { profile?: { email?: string } } | undefined = undefined;
  toggle() {
    this.user = this.user ? undefined : { profile: { email: "a@example.com" } };
  }
}

bootstrapApplication(App);
```

### Example explained

- **Optional chaining (?.)**: `user?.profile?.email` accesses email only when user and profile are defined; otherwise yields `undefined` without errors.
- **Fallback**: `|| '(none)'` displays placeholder text when falsy; favor `??` to preserve falsy values like `0` or empty strings.
- **Toggle**: Clicking toggles user between `undefined` and an object demonstrating safe access patterns.

**Nullish coalescing (??):** Use `a ?? b` instead of `a || b` when you want to retain falsy values like `0` or `''`.
