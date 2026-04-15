# Angular Forms

> Source: https://www.w3schools.com/angular/angular_forms.asp

# Angular Forms

## Forms Essentials

Angular provides two approaches for handling forms:

- **Template-driven**: HTML-first approach using `[(ngModel)]` for simple forms
- **Reactive**: Code-first approach using `FormGroup` and `FormControl` for complex scenarios

Template-driven forms are quick to implement, while reactive forms excel with complex validation, dynamic fields, and testability.

Key concepts include:

- `FormControl` tracks a single input's value and state
- `FormGroup` groups multiple controls by name
- Import `FormsModule` for template-driven; `ReactiveFormsModule` for reactive

## Template-driven Forms

Template-driven forms feel like standard HTML and are quick to start. They use two-way binding with `[(ngModel)]` and require unique `name` attributes for each control.

Access form state through an exported `ngForm` reference (e.g., `valid`, `touched`, `invalid`). Import `FormsModule` in standalone components.

### Basic Example

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
    <h3>Forms</h3>
    <form #f="ngForm" (ngSubmit)="onSubmit()">
      <label>
        Name:
        <input name="name" [(ngModel)]="name" placeholder="Enter your name" />
      </label>
      <button type="submit">Submit</button>
    </form>
    <p>Value: {{ name }}</p>
    <p *ngIf="submitted">Submitted!</p>
  `,
})
export class App {
  name = "";
  submitted = false;
  onSubmit() {
    this.submitted = true;
  }
}

bootstrapApplication(App);
```

**Key points:**

- `[(ngModel)]="name"` creates two-way binding to the component property
- `#f="ngForm"` exports the form for access to its state properties
- `(ngSubmit)="onSubmit()"` handles form submission
- Each control must have a unique `name` attribute to register with `ngForm`

## HTML Form Elements in Angular

### Text, Email, and Number Inputs

```html
<input name="email" type="email" [(ngModel)]="model.email" />
```

### Textareas

```html
<textarea name="bio" [(ngModel)]="model.bio"></textarea>
```

### Checkboxes

```html
<label
  ><input type="checkbox" name="agree" [(ngModel)]="model.agree" /> Agree</label
>
```

### Radio Buttons

```html
<label
  ><input type="radio" name="color" [value]="'red'" [(ngModel)]="model.color" />
  Red</label
>
<label
  ><input
    type="radio"
    name="color"
    [value]="'blue'"
    [(ngModel)]="model.color"
  />
  Blue</label
>
```

For non-string values, use `[ngValue]`:

```html
<label
  ><input type="radio" name="size" [ngValue]="1" [(ngModel)]="model.size" />
  Small</label
>
<label
  ><input type="radio" name="size" [ngValue]="2" [(ngModel)]="model.size" />
  Medium</label
>
```

### Select Elements

```html
<select name="pet" [(ngModel)]="model.pet">
  <option [ngValue]="{ id: 1, name: 'Cat' }">Cat</option>
  <option [ngValue]="{ id: 2, name: 'Dog' }">Dog</option>
</select>
```

### Select Multiple

```html
<select name="tags" [(ngModel)]="model.tags" multiple>
  <option [ngValue]="'news'">News</option>
  <option [ngValue]="'tech'">Tech</option>
</select>
```

### File Input

```html
<input type="file" multiple (change)="onFiles($event)" />
```

### compareWith for Object Options

```html
<select name="pet" [(ngModel)]="model.pet" [compareWith]="byId">
  <option [ngValue]="{ id: 1, name: 'Cat' }">Cat</option>
</select>
```

```typescript
byId = (a: any, b: any) => a?.id === b?.id;
```

## Validation

Add validation attributes like `required`, `minlength`, and `email`. Display errors when the control is invalid and `dirty || touched` or after submission.

```html
<input name="email" [(ngModel)]="email" email required #e="ngModel" />
<div *ngIf="e.invalid && (e.dirty || e.touched)">
  <small *ngIf="e.errors && e.errors['required']">Required</small>
  <small *ngIf="e.errors && e.errors['email']">Invalid email</small>
</div>
```

### Validation Example

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
    <h3>Forms Validation</h3>
    <form #f="ngForm" (ngSubmit)="onSubmit()" novalidate>
      <label>
        Name:
        <input
          name="name"
          [(ngModel)]="model.name"
          required
          minlength="3"
          #name="ngModel"
        />
      </label>
      <div
        *ngIf="name.invalid && (name.dirty || name.touched || submitted)"
        style="color:crimson"
      >
        <small *ngIf="name.errors && name.errors['required']"
          >Name is required.</small
        >
        <small *ngIf="name.errors && name.errors['minlength']"
          >Name must be at least 3 characters.</small
        >
      </div>

      <label>
        Email:
        <input
          name="email"
          [(ngModel)]="model.email"
          email
          required
          #email="ngModel"
        />
      </label>

      <button type="submit" [disabled]="f.invalid">Submit</button>
    </form>
  `,
})
export class App {
  model = { name: "", email: "" };
  submitted = false;
  onSubmit() {
    this.submitted = true;
  }
}

bootstrapApplication(App);
```

## Reactive Forms

Build a tree of `FormGroup` and `FormControl` instances in code, then bind the template with `[formGroup]` and `formControlName`. This approach excels for complex validation, conditional fields, and dynamic forms.

```typescript
form = this.fb.group({
  name: ["", [Validators.required, Validators.minLength(3)]],
  email: ["", [Validators.required, Validators.email]],
});
```

```html
<form [formGroup]="form">
  <input formControlName="name" />
  <input formControlName="email" />
</form>
```

### Reactive Forms Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h3>Reactive Forms</h3>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>
        Name
        <input formControlName="name" placeholder="Your name" />
      </label>
      <label>
        Email
        <input formControlName="email" placeholder="you@example.com" />
      </label>
      <label>
        <input type="checkbox" formControlName="newsletter" />
        Subscribe to newsletter
      </label>
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>

    <p>Status: {{ form.status }}</p>
    <p>Value: {{ form.value | json }}</p>
  `,
})
export class App {
  fb = new FormBuilder();
  submitted = false;
  form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(3)]],
    email: ["", [Validators.required, Validators.email]],
    newsletter: [false],
  });

  onSubmit() {
    this.submitted = true;
  }
}

bootstrapApplication(App);
```

**Important notes:**

- Avoid mixing `[(ngModel)]` with `formControlName` on the same control
- Use `setValue` or `patchValue` to update forms programmatically
- Reactive forms require importing `ReactiveFormsModule`
