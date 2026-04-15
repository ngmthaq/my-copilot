# Angular Security

> Source: https://www.w3schools.com/angular/angular_security.asp

# Angular Security

## Security Essentials

Angular provides built-in protection against XSS (Cross-Site Scripting) by sanitizing template bindings. Key principles include:

- **XSS protection**: Angular sanitizes template bindings to block script injection.
- **Sanitization**: Dangerous values are stripped or transformed before writing to the DOM.
- **Bind properties**: Use property bindings over string concatenation for URLs/HTML.
- **Avoid bypass**: Only use `DomSanitizer` in audited, rare cases.

```typescript
// Angular sanitizes [innerHTML], [href], [src]
@Component({ template: `<div [innerHTML]="html"></div>` })
class C {
  html = "<b>Hello</b> <script>alert(1)</script>";
}
```

**Recommendation**: Bind with `[href]`/`[src]`/`[innerHTML]` and let Angular sanitize. Only use `DomSanitizer` in rare, audited cases.

## Sanitization Basics

Property bindings automatically run the sanitizer:

```typescript
// Property binding runs the sanitizer
<img [src]="photoUrl" alt="...">
<a [href]="profileUrl">Profile</a>
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <h3>Sanitized HTML</h3>
    <div [innerHTML]="html"></div>
  `,
})
class App {
  html = `Hello <script>alert('xss')</script>`;
}

bootstrapApplication(App);
```

### Example Explained

- **[innerHTML]**: Angular sanitizes bound HTML, removing dangerous content like scripts.
- **Property bindings**: Use `[innerHTML]`/`[href]`/`[src]` so the sanitizer runs.
- **Interpolation**: `{{ ... }}` escapes HTML by default; use bindings for safe HTML insertion.

**Key Points:**

- Angular sanitizes values bound to `[innerHTML]`, `[src]`, and `[href]`.
- Avoid string concatenation for HTML/URLs.
- Use property bindings to ensure the sanitizer runs.
- Avoid bypassing sanitizer; use safe data flow and templates.

## Safe DOM APIs

Guidelines for secure DOM interactions:

- Use property bindings for URLs and HTML to ensure the sanitizer runs.
- Audit any use of `DomSanitizer.bypassSecurityTrust*`; document scope and rationale.
- Limit bypass to vetted, static content paths encapsulated in small utilities.

```typescript
import { DomSanitizer } from "@angular/platform-browser";

// Use: [href]="safeUrl" with validated values
// Avoid bypass unless strictly necessary and audited:
// const safe = sanitizer.bypassSecurityTrustUrl(untrusted);
```

**Best Practices:**

- Do not pass untrusted or user input to `bypassSecurityTrust*`.
- Only bypass for vetted, static sources; encapsulate in a small utility with comments.
- Enable Content Security Policy (CSP); consider Trusted Types for stronger XSS defenses.
