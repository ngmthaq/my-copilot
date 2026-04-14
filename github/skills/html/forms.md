---
name: html-forms
description: "HTML forms — input types, client-side validation, fieldsets, autocomplete, accessibility patterns, form submission. Use when: building forms; choosing input types; adding validation; grouping form controls; making forms accessible. DO NOT USE FOR: JavaScript form libraries (use framework skill); server-side validation."
---

# HTML Forms

## 1. Form Structure

```html
<form action="/register" method="post" novalidate>
  <!-- novalidate when using JS validation; remove for native -->
  <fieldset>
    <legend>Personal Information</legend>

    <label for="full-name">Full name</label>
    <input
      id="full-name"
      name="fullName"
      type="text"
      required
      autocomplete="name"
    />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autocomplete="email" />
  </fieldset>

  <button type="submit">Register</button>
</form>
```

### Key Attributes

| Attribute      | Purpose                                           |
| -------------- | ------------------------------------------------- |
| `action`       | URL to submit to                                  |
| `method`       | `get` (query string) or `post` (request body)     |
| `novalidate`   | Disable native validation (use when JS validates) |
| `enctype`      | `multipart/form-data` for file uploads            |
| `autocomplete` | `on` / `off` on the form level                    |

---

## 2. Input Types Reference

| Type             | Use Case                  | Native UI / Behavior                |
| ---------------- | ------------------------- | ----------------------------------- |
| `text`           | Generic single-line text  | Plain text field                    |
| `email`          | Email addresses           | Validates format, `@` keyboard hint |
| `password`       | Passwords                 | Obscured text                       |
| `url`            | URLs                      | Validates URL format                |
| `tel`            | Phone numbers             | Numeric keyboard on mobile          |
| `number`         | Numeric values            | Spinner; `min`, `max`, `step`       |
| `range`          | Slider between values     | Slider; `min`, `max`, `step`        |
| `date`           | Date (YYYY-MM-DD)         | Date picker                         |
| `time`           | Time (HH:MM)              | Time picker                         |
| `datetime-local` | Date + time (no timezone) | Combined date/time picker           |
| `month`          | Month + year              | Month picker                        |
| `week`           | Week + year               | Week picker                         |
| `color`          | Color (#rrggbb)           | Color picker                        |
| `search`         | Search queries            | Clearable field, search keyboard    |
| `file`           | File upload               | File dialog; `accept`, `multiple`   |
| `checkbox`       | Boolean / multi-select    | Checked/unchecked                   |
| `radio`          | Single choice from group  | Grouped by `name`                   |
| `hidden`         | Hidden data               | Not rendered                        |

---

## 3. Labels — Always Required

```html
<!-- Explicit association (preferred, most robust) -->
<label for="username">Username</label>
<input id="username" name="username" type="text" />

<!-- Implicit wrapping (also valid) -->
<label>
  Username
  <input name="username" type="text" />
</label>
```

### Rules

- Every `<input>`, `<select>`, and `<textarea>` MUST have a label.
- Use `for`/`id` pairing — it works with all assistive tech.
- Never use `placeholder` as the only label (it disappears on input).
- If a visible label is not possible, use `aria-label` or `aria-labelledby`.

---

## 4. Native Validation Attributes

```html
<!-- Required -->
<input type="text" required />

<!-- Pattern (regex) -->
<input type="text" pattern="[A-Za-z]{3,}" title="At least 3 letters" />

<!-- Length constraints -->
<input type="text" minlength="2" maxlength="100" />

<!-- Numeric constraints -->
<input type="number" min="1" max="100" step="1" />

<!-- Email with required domain -->
<input type="email" pattern=".+@company\.com" title="Must be a company email" />
```

### Validation Pseudo-Classes

```css
input:valid {
  border-color: green;
}
input:invalid {
  border-color: red;
}
input:required::after {
  content: " *";
}

/* Only show invalid styles after user interaction */
input:not(:placeholder-shown):invalid {
  border-color: red;
}
```

### Custom Validation Messages

```javascript
const input = document.getElementById("email");
input.addEventListener("invalid", () => {
  input.setCustomValidity("Please enter a valid company email.");
});
input.addEventListener("input", () => {
  input.setCustomValidity(""); // Reset on change
});
```

---

## 5. Fieldset & Legend

```html
<!-- Group related controls -->
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input id="street" name="street" type="text" autocomplete="street-address" />

  <label for="city">City</label>
  <input id="city" name="city" type="text" autocomplete="address-level2" />
</fieldset>

<!-- Radio group (fieldset is essential for screen readers) -->
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
  <label><input type="radio" name="contact" value="sms" /> SMS</label>
</fieldset>
```

---

## 6. Autocomplete Attribute (WCAG 1.3.5)

```html
<input type="text" autocomplete="name" />
<!-- Full name -->
<input type="text" autocomplete="given-name" />
<!-- First name -->
<input type="text" autocomplete="family-name" />
<!-- Last name -->
<input type="email" autocomplete="email" />
<!-- Email -->
<input type="tel" autocomplete="tel" />
<!-- Phone -->
<input type="text" autocomplete="street-address" />
<!-- Street -->
<input type="text" autocomplete="postal-code" />
<!-- ZIP/postal -->
<input type="text" autocomplete="country-name" />
<!-- Country -->
<input type="text" autocomplete="cc-number" />
<!-- Credit card -->
<input type="text" autocomplete="cc-exp" />
<!-- Expiry -->
<input type="password" autocomplete="new-password" />
<!-- New password -->
<input type="password" autocomplete="current-password" />
<!-- Login -->
```

---

## 7. Select, Textarea & Output

```html
<!-- Select -->
<label for="country">Country</label>
<select id="country" name="country" required>
  <option value="">— Select —</option>
  <optgroup label="North America">
    <option value="us">United States</option>
    <option value="ca">Canada</option>
  </optgroup>
  <optgroup label="Europe">
    <option value="uk">United Kingdom</option>
    <option value="de">Germany</option>
  </optgroup>
</select>

<!-- Textarea -->
<label for="message">Message</label>
<textarea
  id="message"
  name="message"
  rows="5"
  maxlength="500"
  required
></textarea>

<!-- Output (result of a calculation) -->
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
  <input type="number" id="a" name="a" value="0" /> +
  <input type="number" id="b" name="b" value="0" /> =
  <output name="result" for="a b">0</output>
</form>
```

---

## 8. File Upload

```html
<label for="avatar">Profile picture</label>
<input
  id="avatar"
  name="avatar"
  type="file"
  accept="image/png, image/jpeg"
  aria-describedby="avatar-hint"
/>
<p id="avatar-hint">Max 5 MB. PNG or JPEG only.</p>

<!-- Multiple files -->
<input type="file" multiple accept=".pdf,.doc,.docx" />
```

**Form must use** `enctype="multipart/form-data"` for file uploads:

```html
<form action="/upload" method="post" enctype="multipart/form-data"></form>
```

---

## 9. Accessible Error Handling

```html
<label for="email">Email</label>
<input
  id="email"
  name="email"
  type="email"
  required
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" class="error" role="alert">
  Please enter a valid email address.
</span>
```

### Error Summary Pattern

```html
<div role="alert" aria-labelledby="error-heading">
  <h2 id="error-heading">There were 2 errors with your submission</h2>
  <ul>
    <li><a href="#email">Email is required</a></li>
    <li><a href="#password">Password must be at least 8 characters</a></li>
  </ul>
</div>
```

---

## 10. Anti-Patterns

| Anti-Pattern                                    | Fix                                                  |
| ----------------------------------------------- | ---------------------------------------------------- |
| Input without `<label>`                         | Add explicit `<label for="...">`                     |
| Placeholder used as label                       | Add a visible `<label>`, keep placeholder as hint    |
| Radio buttons without `<fieldset>` + `<legend>` | Wrap in `<fieldset>` with `<legend>`                 |
| `<select>` without empty default option         | Add `<option value="">— Select —</option>`           |
| No `autocomplete` on personal data fields       | Add appropriate `autocomplete` value (WCAG 1.3.5)    |
| Error shown only by red border                  | Add text error + `aria-invalid` + `aria-describedby` |
| `type="text"` for emails, phones, URLs          | Use specific type (`email`, `tel`, `url`)            |
| Form submits with no feedback on error          | Show error summary and/or focus first invalid field  |
| `autocomplete="off"` on password fields         | Never block autofill on passwords (WCAG 3.3.8)       |
| Missing `enctype` for file upload forms         | Add `enctype="multipart/form-data"`                  |
