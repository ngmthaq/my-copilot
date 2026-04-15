# Angular Intro

> Source: https://www.w3schools.com/angular/angular_intro.asp

## What is Angular?

Angular is a full-featured front-end framework for building web applications with the following characteristics:

- Built with TypeScript
- Uses components and templates
- Includes routing, forms, HTTP, and dependency injection
- Supports standalone APIs (no NgModules needed)
- Works great for single-page applications (SPAs)

## How Angular Works

Angular compiles your templates into efficient JavaScript and updates the DOM when your component state changes through these mechanisms:

- Declare UI with HTML-based templates
- Bind data with interpolation and directives
- Handle events and user input
- Fetch data with the HttpClient (Observables)
- Navigate with the Router

## What You Should Already Know

Before starting Angular, you should have foundational knowledge in:

- HTML
- CSS
- JavaScript
- Basic TypeScript (helpful but not required)

## Angular Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<h2>Welcome to Angular!</h2>`,
})
export class App {}

bootstrapApplication(App);
```

```html
<app-root></app-root>
```
