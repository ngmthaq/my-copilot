# Angular First App

> Source: https://www.w3schools.com/angular/angular_first_app.asp

## Step 1: Open `src/main.ts`

Angular 20 apps bootstrap a _standalone_ root component. You can define it inline in `main.ts`.

Open it and replace the code with:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<h1>Hello, World!</h1>`,
})
class App {}

bootstrapApplication(App);
```

**Live reload:** When the Angular App is running (started with `ng serve`), the browser automatically refreshes upon file save.

**Quick primer: components**

- A **component** is a class that controls a view (its template).
- Each component has a **selector** (e.g., `app-root`) that you place in HTML.
- The **root component** renders inside `index.html`'s `<app-root>`.

## Step 2: Host element in `index.html`

Angular renders the root component where its selector appears.

Open `src/index.html` and make sure the root tag is inside `<body>`.

The tag must match your component selector from Step 1 (here it is `app-root`).

### Example: Minimal index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My Angular App</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <!-- Host element -->
    <app-root></app-root>
  </body>
</html>
```

Keep `<base href="/">` in `<head>` so routing works later.

## Step 3: Bind some data

Add a property and show it with interpolation:

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<h1>Hello, {{ name }}!</h1>`,
})
class App {
  name = "Angular 20";
}

bootstrapApplication(App);
```

Interpolation updates the view automatically when the component property changes.

**Tip:** Keep expressions simple. Use properties over calling methods directly in templates for performance.

## Project Structure

Key files in a minimal Angular workspace:

- `src/main.ts` - Boots the app with `bootstrapApplication`.
- `src/app/app.component.ts` - Root component (if used). You can also define the root inline in `main.ts`.
- `src/app/` - Where you add your components and features.
- `src/index.html` - Host page that contains `<app-root>`.
- `src/styles.css` - Global styles for the app.
- `angular.json` - Angular workspace configuration (build, serve, test).
- `package.json` - Scripts and dependencies.
