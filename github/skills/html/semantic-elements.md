---
name: html-semantic-elements
description: "HTML semantic elements & document structure — sectioning elements, landmarks, headings hierarchy, document outline, content sectioning vs. grouping. Use when: structuring pages; choosing between div/section/article; building document outline; adding landmarks. DO NOT USE FOR: ARIA roles (use html-accessibility); text-level elements (use html-text-content)."
---

# HTML Semantic Elements & Document Structure

## 1. Document Skeleton

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title</title>
  </head>
  <body>
    <header>...</header>
    <nav aria-label="Main">...</nav>
    <main>...</main>
    <footer>...</footer>
  </body>
</html>
```

- `<!DOCTYPE html>` — triggers standards mode.
- `<html lang="en">` — always set language (WCAG 3.1.1).
- One `<main>` per page — represents the dominant content.

---

## 2. Sectioning Elements

| Element     | Purpose                                     | Creates landmark?            |
| ----------- | ------------------------------------------- | ---------------------------- |
| `<header>`  | Introductory content or navigational aids   | `banner` (if top-level)      |
| `<nav>`     | Major navigation blocks                     | `navigation`                 |
| `<main>`    | Dominant content of the `<body>`            | `main`                       |
| `<section>` | Thematic grouping of content with a heading | `region` (if labelled)       |
| `<article>` | Self-contained, independently distributable | `article`                    |
| `<aside>`   | Content tangentially related to surrounding | `complementary`              |
| `<footer>`  | Footer for nearest sectioning ancestor      | `contentinfo` (if top-level) |

### When to Use `<section>` vs `<article>` vs `<div>`

```
Is the content a self-contained composition?
│
├─ Yes → <article>
│   (blog post, comment, product card, news story)
│
├─ No → Does it represent a thematic grouping with a heading?
│   ├─ Yes → <section>
│   │   (chapter, tab panel, feature area)
│   └─ No → <div>
│       (styling wrapper, layout container)
```

### Usage Examples

```html
<!-- Article: self-contained, could be syndicated -->
<article>
  <h2>Understanding Flexbox</h2>
  <p>Flexbox is a one-dimensional layout method...</p>
  <footer>
    <p>Published by <a href="/authors/jane">Jane</a></p>
  </footer>
</article>

<!-- Section: thematic grouping, MUST have a heading -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
  <ul>
    <li>Fast</li>
    <li>Secure</li>
  </ul>
</section>

<!-- Nested articles (e.g., comments) -->
<article>
  <h2>Blog Post Title</h2>
  <p>Post content...</p>
  <section aria-label="Comments">
    <h3>Comments</h3>
    <article>
      <h4>Comment by Alice</h4>
      <p>Great post!</p>
    </article>
  </section>
</article>
```

---

## 3. Heading Hierarchy

```html
<!-- GOOD: logical hierarchy, no gaps -->
<h1>Page Title</h1>
<h2>Section A</h2>
<h3>Sub-section A.1</h3>
<h3>Sub-section A.2</h3>
<h2>Section B</h2>

<!-- BAD: skipped h2, visual styling should use CSS instead -->
<h1>Page Title</h1>
<h3>Section A</h3>
<!-- ❌ skipped h2 -->
```

### Rules

- One `<h1>` per page — the main topic/title.
- Never skip levels (h1 → h3). Style with CSS, not heading level.
- Headings inside `<section>` or `<article>` should continue the parent's hierarchy.

---

## 4. Navigation Patterns

```html
<!-- Primary navigation -->
<nav aria-label="Main">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/shoes" aria-current="page">Shoes</a></li>
  </ol>
</nav>

<!-- Multiple navs on same page: use aria-label to distinguish -->
<nav aria-label="Main">...</nav>
<nav aria-label="Footer">...</nav>
```

---

## 5. Grouping Elements

| Element        | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `<div>`        | Generic flow container (no semantic meaning)        |
| `<span>`       | Generic inline container (no semantic meaning)      |
| `<figure>`     | Self-contained content with optional caption        |
| `<figcaption>` | Caption for `<figure>`                              |
| `<details>`    | Expandable/collapsible disclosure widget            |
| `<summary>`    | Visible label for `<details>`                       |
| `<dialog>`     | Modal or non-modal dialog                           |
| `<hgroup>`     | Group heading with subtitle/tagline                 |
| `<search>`     | Container for search functionality (new in HTML5.2) |

### Figure with Caption

```html
<figure>
  <img src="/chart.png" alt="Sales grew 40% in Q4 2025" />
  <figcaption>Figure 1: Quarterly sales growth</figcaption>
</figure>
```

### Details/Summary (Native Disclosure)

```html
<details>
  <summary>Show advanced options</summary>
  <p>Advanced configuration goes here.</p>
</details>

<!-- Open by default -->
<details open>
  <summary>FAQ: How do I reset my password?</summary>
  <p>Click "Forgot Password" on the login page...</p>
</details>
```

### Dialog (Native Modal)

```html
<dialog id="confirm-dialog">
  <form method="dialog">
    <h2>Confirm Action</h2>
    <p>Are you sure you want to proceed?</p>
    <button value="cancel">Cancel</button>
    <button value="confirm">Confirm</button>
  </form>
</dialog>

<script>
  // showModal() provides focus trap and Escape-to-close
  document.getElementById("confirm-dialog").showModal();
</script>
```

### Search Element

```html
<search>
  <form action="/search" method="get">
    <label for="q">Search</label>
    <input id="q" name="q" type="search" />
    <button type="submit">Go</button>
  </form>
</search>
```

---

## 6. Anti-Patterns

| Anti-Pattern                               | Fix                                                      |
| ------------------------------------------ | -------------------------------------------------------- |
| `<div class="header">`                     | Use `<header>`                                           |
| `<div class="nav">`                        | Use `<nav aria-label="...">`                             |
| `<section>` without a heading              | Add a heading or use `<div>` instead                     |
| `<article>` for non-self-contained         | Use `<section>` or `<div>` instead                       |
| Multiple `<main>` elements                 | One `<main>` per page                                    |
| `<header>` / `<footer>` only at page level | They can be nested inside `<article>` or `<section>` too |
| Heading chosen for visual size             | Use correct level, style with CSS                        |
| `<br>` for spacing                         | Use CSS margin/padding                                   |
| `<div onclick="...">`                      | Use `<button>` or `<a>` for interactive elements         |
