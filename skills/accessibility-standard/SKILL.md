---
name: accessibility-standard
description: "Comprehensive web accessibility standards based on WCAG 2.2 AA, with anti-patterns, legal enforcement context (EAA, ADA Title II), WAI-ARIA patterns, and framework-specific fixes for modern web frameworks and libraries."
---

# Accessibility Standards (WCAG 2.2 AA)

**Severity levels:** CRITICAL (block merge) · IMPORTANT (fix this sprint) · SUGGESTION (future iteration)

**Legal context:** EAA enforced June 2025 (EU, fines up to €3M). ADA Title II digital rule effective April 2026 (US gov). WCAG 2.2 AA is a superset of all current legal requirements.

**Five ARIA Rules:** (1) Prefer native HTML. (2) Don't override native semantics. (3) ARIA controls must be keyboard operable. (4) Never `aria-hidden="true"` on focusable elements. (5) All interactive elements need an accessible name.

---

## Semantic HTML

| ID  | Severity  | Pattern                               | Fix                                                    |
| --- | --------- | ------------------------------------- | ------------------------------------------------------ |
| S1  | CRITICAL  | `<html>` missing `lang=`              | `<html lang="en">`                                     |
| S3  | IMPORTANT | Heading level gaps (h1→h3)            | Maintain h1>h2>h3 nesting; style with CSS              |
| S4  | IMPORTANT | No landmark elements (div soup)       | Use `<header>`, `<nav>`, `<main>`, `<footer>`          |
| S6  | CRITICAL  | Data table without `<th>`             | Add `<thead>`, `<th scope="col">`, `<caption>`         |
| S7  | IMPORTANT | "Click here" / "Read more" links      | Use descriptive link text                              |
| S8  | CRITICAL  | `<div onClick>` instead of `<button>` | Use native `<button>` — built-in focus, role, keyboard |

## ARIA

| ID  | Severity  | Pattern                                   | Fix                                                                                 |
| --- | --------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| A2  | CRITICAL  | `aria-hidden="true"` on focusable element | Use `disabled`, remove `href`/`tabindex`, or use `inert`                            |
| A3  | CRITICAL  | Role missing required props               | `tab`→`aria-selected`; `slider`→`aria-valuemin/max/now`; `combobox`→`aria-expanded` |
| A5  | IMPORTANT | `role="checkbox"` on `<div>`              | Use `<input type="checkbox">` — native handles state/keyboard                       |
| A6  | CRITICAL  | Icon-only button with no label            | `<button aria-label="Close"><svg aria-hidden="true">`                               |
| A8  | IMPORTANT | Toast/notification with no live region    | `<div role="status" aria-live="polite">` (errors: `role="alert"`)                   |

## Keyboard & Focus

| ID  | Severity  | Pattern                                       | Fix                                                                               |
| --- | --------- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| K1  | CRITICAL  | `onClick` on `<div>` without keyboard handler | Use `<button>`, or add `role="button" tabIndex={0}` + Enter/Space handlers        |
| K2  | CRITICAL  | `tabindex="2"` (positive value)               | Only use `0` (tab order) or `-1` (programmatic focus)                             |
| K3  | CRITICAL  | Modal without focus trap or Escape            | Use native `<dialog showModal()>` — traps focus, handles Escape, restores trigger |
| K4  | IMPORTANT | No skip link                                  | `<a href="#main">Skip to main content</a>` as first focusable element             |
| K5  | CRITICAL  | `outline: none` with no replacement           | `button:focus-visible { outline: 2px solid #005fcc; outline-offset: 2px; }`       |
| K6  | IMPORTANT | `onMouseOver` without keyboard equivalent     | Pair with `onFocus`/`onBlur`                                                      |
| K7  | IMPORTANT | Focus not restored after modal close          | Store trigger ref; call `triggerRef.current.focus()` on close                     |

## Forms

| ID  | Severity  | Pattern                                     | Fix                                                                      |
| --- | --------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| F1  | CRITICAL  | `<input>` without associated label          | `<label for="x">` + `<input id="x">`, or `aria-label`                    |
| F2  | CRITICAL  | Error message not linked to input           | `<input aria-describedby="err" aria-invalid="true">` + `<span id="err">` |
| F3  | IMPORTANT | Required field by color/`*` only            | Add HTML `required` attr; `<span aria-hidden="true">*</span>` + note     |
| F5  | IMPORTANT | Puzzle CAPTCHA / paste blocked on passwords | Use reCAPTCHA v3 or hCaptcha; never block paste/autofill (WCAG 3.3.8)    |
| F6  | IMPORTANT | Placeholder used as label                   | Always pair placeholder with a visible `<label>`                         |

## Visual & Media

| ID  | Severity  | Pattern                                          | Fix                                                               |
| --- | --------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| V1  | CRITICAL  | Text contrast below 4.5:1 (normal) / 3:1 (large) | Use contrast checker; `#595959` on `#fff` = 7:1 ✓                 |
| V2  | CRITICAL  | Error/success state by color alone               | Add icon, text label, or border as secondary indicator            |
| V3  | IMPORTANT | `font-size: 14px` on content text                | Use `rem`/`em` so text scales with user preferences               |
| D1  | CRITICAL  | `<img>` without `alt=`                           | Descriptive alt for informational images; `alt=""` for decorative |
| D3  | CRITICAL  | `<video>` without captions                       | `<track kind="captions" src="en.vtt" default>`                    |

## Framework-Specific

**React/Next.js:** Use `htmlFor` (not `for`) on labels. After SPA route change, ensure page has unique `<title>` (Next.js v13+ announces it automatically). Restore focus after conditional renders with `useRef` + `useEffect`.

**Angular:** Use `<button>` over `(click)` on divs. Use `cdkTrapFocus` for custom modals (or prefer CDK `Dialog`). Announce route changes via `LiveAnnouncer`. Bind `[attr.aria-invalid]` and `[attr.aria-describedby]` to form control state.

**Vue:** Use `<button>` over `@click` on divs. After `v-if` toggles, restore focus with `nextTick`. Sanitize and validate `v-html` content for heading hierarchy and alt text.

---

## Keyboard Interaction Reference

| Key              | Behavior                            |
| ---------------- | ----------------------------------- |
| Tab / Shift+Tab  | Next / previous focusable element   |
| Enter            | Activate button or link             |
| Space            | Activate button, toggle checkbox    |
| Escape           | Close modal, dialog, dropdown       |
| Arrow Up/Down    | Navigate menu, listbox, radio group |
| Arrow Left/Right | Navigate tabs, slider, radio group  |
| Home / End       | First / last item in list or menu   |

---

## Accessibility Checklist

**Perceivable**

- [ ] Images have alt text (descriptive or `alt=""` for decorative)
- [ ] Videos have synchronized captions
- [ ] Semantic landmarks used (`header`, `nav`, `main`, `footer`)
- [ ] Headings follow logical hierarchy, no gaps
- [ ] Text contrast ≥ 4.5:1 normal / 3:1 large; UI components ≥ 3:1
- [ ] Information not conveyed by color alone
- [ ] `<html lang="...">` set correctly

**Operable**

- [ ] All functionality accessible via keyboard
- [ ] No keyboard traps; Escape closes overlays
- [ ] Skip link is first focusable element
- [ ] Focus indicator visible on all interactive elements
- [ ] Focus order matches visual order; not obscured by sticky UI
- [ ] Focus returned to trigger after modal close
- [ ] Touch targets ≥ 24×24 CSS px
- [ ] Animations respect `prefers-reduced-motion`

**Understandable**

- [ ] All inputs have associated label or `aria-label`
- [ ] Error messages linked via `aria-describedby`
- [ ] Required fields use HTML `required` or `aria-required`
- [ ] On submit failure: focus first error or show error summary

**Robust**

- [ ] Interactive elements have accessible name, role, and state
- [ ] No `aria-hidden="true"` on focusable elements
- [ ] Dynamic content announced via live regions
- [ ] SPA route changes announced to screen readers
