# Angular Forms Advanced

> Source: https://www.w3schools.com/angular/angular_forms_reactive_advanced.asp

# Angular Reactive Forms Advanced

Advanced reactive forms model complex data with `FormGroup`/`FormArray`, combine sync/async validators, and update efficiently with `patchValue` and `updateOn`; observe `valueChanges`/`statusChanges` for reactive logic.

## Reactive Forms Advanced Essentials

- **Structure**: Use `FormGroup` and `FormArray` to model complex forms.
- **Validation**: Combine sync and async validators at control and group levels.
- **Updates**: Use `patchValue` for partial updates; `setValue` requires the full shape.

```typescript
import { FormBuilder, Validators, FormArray } from "@angular/forms";

fb.group({
  name: ["", Validators.required],
  tags: fb.array([fb.group({ label: ["Angular"] })]),
});

// Add row
(form.get("tags") as FormArray).push(fb.group({ label: [""] }));
```

## Nested Groups and Arrays

Group related controls for structure and reuse.

Use `FormArray` for dynamic lists like tags or items. A **FormArray** is an ordered list of controls whose length can change at runtime.

```typescript
const tags = fb.array([fb.group({ label: ["Angular"] })]);
tags.push(fb.group({ label: [""] }));
```

### Example

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
} from "@angular/forms";
import { JsonPipe, CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JsonPipe],
  template: `
    <h3>Advanced Reactive Form</h3>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input placeholder="Name" formControlName="name" />
      <div formArrayName="tags">
        <div *ngFor="let t of tags.controls; let i = index" [formGroupName]="i">
          <input placeholder="Tag" formControlName="label" />
        </div>
      </div>
      <button type="button" (click)="addTag()">Add Tag</button>
      <button type="submit">Submit</button>
    </form>
    <pre>{{ form.value | json }}</pre>
  `,
})
class App {
  fb = new FormBuilder();
  form = this.fb.group({
    name: ["", Validators.required],
    tags: this.fb.array([this.fb.group({ label: ["Angular"] })]),
  });
  get tags(): FormArray {
    return this.form.get("tags") as FormArray;
  }
  addTag() {
    this.tags.push(this.fb.group({ label: [""] }));
  }
  submit() {
    alert(JSON.stringify(this.form.value));
  }
}

bootstrapApplication(App);
```

**Binding tips:** Use `formArrayName` and `[formGroupName]` for each row to keep bindings aligned.

**Consistent shapes:** Push groups with the same control shape to a `FormArray`; avoid mixing primitives and groups.

**Dynamic lists:** When rendering with `*ngFor`, use `trackBy` to keep inputs stable while adding/removing rows.

## Validation Strategies

- Use synchronous validators for most rules; they are fast and simple.
- Use async validators for server checks/uniqueness; they run after sync validators.
- Keep validation lean and debounce inputs before async checks.

```typescript
import { AbstractControl, ValidationErrors } from "@angular/forms";

function banned(value: string[]) {
  return (c: AbstractControl): ValidationErrors | null =>
    value.includes(c.value) ? { banned: true } : null;
}

fb.control("", [Validators.required, banned(["admin"])]);
```

```typescript
// Group-level validator and updateOn: 'blur'
import { AbstractControl, ValidationErrors } from "@angular/forms";

function samePassword(group: AbstractControl): ValidationErrors | null {
  const pass = group.get("pass")?.value;
  const confirm = group.get("confirm")?.value;
  return pass === confirm ? null : { mismatch: true };
}

const form = fb.group(
  { pass: [""], confirm: [""] },
  { validators: samePassword, updateOn: "blur" },
);
```

**Guidelines:**

- Use group-level validators for cross-field rules (e.g., password match).
- Reduce churn with `updateOn: 'blur' | 'submit'` (delay validation/value changes until that event) when appropriate.
- Show errors based on `touched`/`dirty` to avoid noisy UX.
- Async validators should be fast and cancelable; debounce inputs before triggering server checks.
