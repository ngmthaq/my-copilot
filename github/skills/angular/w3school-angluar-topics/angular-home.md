# Angular Home

> Source: https://www.w3schools.com/angular/default.asp

# Angular Tutorial

## Learn Angular

Angular is a framework for building client applications in HTML and TypeScript.

## Overview & Prerequisites

Learn Angular step-by-step with easy-to-follow pages and runnable JS-only examples.

The tutorial uses standalone components, modern control flow, and the built-in Router and HttpClient in examples.

**Prerequisites:**

- Basic HTML, CSS, and JavaScript
- Some TypeScript knowledge helps but is not required

## Learning by Examples

The "Show Angular" tool demonstrates Angular by displaying both code and results.

### Example:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<h1>Hello Angular!</h1>`,
})
export class App {}

bootstrapApplication(App);
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Angular App</title>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```
