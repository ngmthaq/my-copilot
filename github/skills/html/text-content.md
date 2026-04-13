---
name: html-text-content
description: "HTML text content & typography — headings, paragraphs, lists, links, emphasis, abbreviations, quotations, code, time, address, inline elements. Use when: choosing the right text-level element; creating lists; writing accessible links; marking up quotes or code. DO NOT USE FOR: page structure (use html-semantic-elements); forms (use html-forms)."
---

# HTML Text Content & Typography

## 1. Headings and Paragraphs

```html
<h1>Main Page Title</h1>
<p>Introductory paragraph explaining the page topic.</p>

<h2>Section Heading</h2>
<p>Section content goes here.</p>

<h3>Sub-section</h3>
<p>More detailed content under the sub-section.</p>
```

- One `<h1>` per page. Never skip heading levels.
- Use `<p>` for paragraphs, not `<br><br>` for spacing.

---

## 2. Lists

### Unordered List (no specific order)

```html
<ul>
  <li>Apples</li>
  <li>Bananas</li>
  <li>Cherries</li>
</ul>
```

### Ordered List (sequence matters)

```html
<ol>
  <li>Preheat oven to 350°F</li>
  <li>Mix dry ingredients</li>
  <li>Add wet ingredients</li>
</ol>

<!-- Start from a different number -->
<ol start="5">
  <li>Step 5</li>
  <li>Step 6</li>
</ol>

<!-- Reversed -->
<ol reversed>
  <li>Third place</li>
  <li>Second place</li>
  <li>First place</li>
</ol>
```

### Description List (key-value pairs)

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language — the standard markup language for web pages.</dd>

  <dt>CSS</dt>
  <dd>Cascading Style Sheets — used for styling and layout.</dd>

  <!-- Multiple descriptions for one term -->
  <dt>JS</dt>
  <dd>JavaScript — a programming language.</dd>
  <dd>Also refers to JSON Schema in some contexts.</dd>
</dl>
```

### Nested Lists

```html
<ul>
  <li>
    Fruits
    <ul>
      <li>Apples</li>
      <li>Bananas</li>
    </ul>
  </li>
  <li>
    Vegetables
    <ul>
      <li>Carrots</li>
      <li>Peas</li>
    </ul>
  </li>
</ul>
```

---

## 3. Links

```html
<!-- Internal link -->
<a href="/about">About us</a>

<!-- External link (open in new tab) -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer"> Visit Example.com </a>

<!-- Skip link (accessibility, WCAG 2.4.1) -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Email link -->
<a href="mailto:info@example.com">Email us</a>

<!-- Phone link -->
<a href="tel:+15551234567">Call us: (555) 123-4567</a>

<!-- Download link -->
<a href="/files/report.pdf" download="annual-report-2025.pdf"> Download annual report (PDF, 2.3 MB) </a>

<!-- Fragment/anchor link -->
<a href="#section-2">Jump to Section 2</a>
<h2 id="section-2">Section 2</h2>

<!-- Current page indicator -->
<a href="/products" aria-current="page">Products</a>
```

### Link Best Practices

- Link text must describe the destination (WCAG 2.4.4). Avoid "click here", "read more", "here".
- Use `rel="noopener noreferrer"` with `target="_blank"`.
- Include file type and size for downloads.
- Never use `javascript:` in `href`.

---

## 4. Emphasis and Importance

```html
<!-- Emphasis (stress emphasis, screen readers may change intonation) -->
<p>You <em>must</em> submit the form before Friday.</p>

<!-- Strong importance -->
<p><strong>Warning:</strong> This action cannot be undone.</p>

<!-- Nested emphasis -->
<p>
  <strong>Do <em>not</em> delete this file.</strong>
</p>
```

### Emphasis vs. Styling

| Element    | Semantic Meaning                                       | Visual Default   |
| ---------- | ------------------------------------------------------ | ---------------- |
| `<em>`     | Stress emphasis                                        | Italic           |
| `<strong>` | Strong importance                                      | Bold             |
| `<i>`      | Alternate voice (technical term, thought, ship name)   | Italic           |
| `<b>`      | Attention without importance (keywords, lead sentence) | Bold             |
| `<mark>`   | Highlighted/relevant text                              | Yellow highlight |
| `<small>`  | Side comments, legal text                              | Smaller text     |

```html
<!-- <i>: technical term, not emphasis -->
<p>The <i>harmonic series</i> diverges.</p>

<!-- <b>: stylistic offset, no extra importance -->
<p>The recipe calls for <b>2 cups</b> of flour.</p>

<!-- <mark>: highlighted search result -->
<p>Results for "html": Learn <mark>HTML</mark> in 30 days.</p>
```

---

## 5. Quotations

```html
<!-- Inline quote -->
<p>As Einstein said, <q>Imagination is more important than knowledge.</q></p>

<!-- Block quote -->
<blockquote cite="https://example.com/source">
  <p>The Web is not just a technology; it is a social creation.</p>
</blockquote>

<!-- With attribution using figure -->
<figure>
  <blockquote cite="https://example.com/source">
    <p>The Web is for everyone.</p>
  </blockquote>
  <figcaption>— Tim Berners-Lee</figcaption>
</figure>
```

---

## 6. Code and Preformatted Text

```html
<!-- Inline code -->
<p>Use the <code>Array.map()</code> method to transform arrays.</p>

<!-- Code block -->
<pre><code class="language-javascript">function greet(name) {
  return `Hello, ${name}!`;
}</code></pre>

<!-- Keyboard input -->
<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>

<!-- Sample output -->
<p>The console shows: <samp>Error: file not found</samp></p>

<!-- Variable -->
<p>The variable <var>x</var> represents the horizontal position.</p>
```

---

## 7. Time and Machine-Readable Data

```html
<!-- Date -->
<time datetime="2025-06-15">June 15, 2025</time>

<!-- Date and time -->
<time datetime="2025-06-15T14:30:00Z">June 15, 2025 at 2:30 PM UTC</time>

<!-- Duration -->
<time datetime="PT2H30M">2 hours and 30 minutes</time>

<!-- Relative time -->
<p>Published <time datetime="2025-06-15">3 days ago</time></p>
```

---

## 8. Address

```html
<!-- Contact information for the nearest article or body -->
<address>
  <p>Written by <a href="/authors/jane">Jane Doe</a></p>
  <p>Email: <a href="mailto:jane@example.com">jane@example.com</a></p>
</address>
```

- `<address>` is for contact info related to the content, not physical addresses.
- Typically used in `<footer>` of an `<article>` or page.

---

## 9. Abbreviations and Definitions

```html
<!-- Abbreviation with expansion -->
<p>The <abbr title="World Wide Web Consortium">W3C</abbr> maintains web standards.</p>

<!-- Definition -->
<p>An <dfn>API</dfn> (Application Programming Interface) is a set of protocols for building software.</p>
```

---

## 10. Miscellaneous Inline Elements

```html
<!-- Superscript and subscript -->
<p>E = mc<sup>2</sup></p>
<p>H<sub>2</sub>O is water.</p>

<!-- Inserted and deleted text -->
<p>Price: <del>$49.99</del> <ins>$29.99</ins></p>

<!-- Strikethrough (no longer relevant) -->
<p><s>Out of stock</s></p>

<!-- Ruby annotation (CJK characters) -->
<ruby>漢 <rp>(</rp><rt>Kan</rt><rp>)</rp></ruby>

<!-- Bidirectional text -->
<p>The word <bdo dir="rtl">hello</bdo> reversed is "olleh".</p>
<p>This text contains <bdi>مرحبا</bdi> which is Arabic.</p>

<!-- Line break opportunity (for URLs, long strings) -->
<p>https://example.com/<wbr />very/<wbr />long/<wbr />path</p>

<!-- Horizontal rule (thematic break, not styling) -->
<h2>Chapter 1</h2>
<p>Content...</p>
<hr />
<h2>Chapter 2</h2>
```

---

## 11. Anti-Patterns

| Anti-Pattern                               | Fix                                                  |
| ------------------------------------------ | ---------------------------------------------------- |
| `<div>` for paragraph text                 | Use `<p>` for paragraphs                             |
| `<br>` for spacing between blocks          | Use CSS margin/padding                               |
| "Click here" or "Read more" as link text   | Descriptive link text: "View pricing plans"          |
| `<b>` for semantic importance              | Use `<strong>` (importance) or `<em>` (emphasis)     |
| List items without `<ul>` / `<ol>` wrapper | Always wrap `<li>` in a list element                 |
| `<a href="javascript:void(0)">`            | Use `<button>` for actions, `<a>` for navigation     |
| Heading for visual styling only            | Use CSS for styling, headings for document structure |
| No `datetime` on `<time>`                  | Always include machine-readable `datetime` attribute |
| `target="_blank"` without `rel="noopener"` | Always add `rel="noopener noreferrer"`               |
| Empty `<a href="#">` for buttons           | Use `<button>` element instead                       |
