# Pipes in Templates

> Source: https://www.w3schools.com/angular/angular_templates_pipes.asp

# Angular Templates: Pipes in Templates (|)

## What are Pipes in Templates (|)?

- Transform values for display using the `|` operator
- Accept optional arguments (e.g., formats, locales)
- Multiple pipes can be chained

## When to use Pipes

- Format dates, numbers, and text directly in the template
- Use pure pipes for performance
- Move complex or side-effectful logic to the component

## Example

Transform values using pipes:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>Built-in pipes</h3>
    <p>Today: {{ today | date: "yyyy-MM-dd" }}</p>
    <p>Name: {{ name | uppercase }}</p>
    <p>Chained: {{ ratio | percent: "1.0-2" | uppercase }}</p>
  `,
})
export class App {
  today = new Date();
  name = "Ada Lovelace";
  ratio = 0.756;
}

bootstrapApplication(App);
```

## Example Explained

- `date:'yyyy-MM-dd'`: Formats a Date object using the provided format string (year-month-day)
- `uppercase`: Transforms string values to upper case
- `percent:'1.0-2'`: Formats as a percentage with specified digit configuration (1 integer digit, 0–2 fraction digits)
- **Chaining**: Pipes execute left to right—`ratio | percent:'1.0-2' | uppercase` first formats a percent string, then uppercases it
