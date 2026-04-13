---
name: html
description: "Unified HTML skill index — covers semantic elements & document structure, forms & validation, media (images, video, audio), data tables, metadata & SEO, text content & typography, ARIA & accessibility patterns, and performance optimization (lazy loading, resource hints). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# HTML Skill Index

## Sub-Skills Reference

| Domain            | File                                         | When to use                                                                                                                 |
| ----------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Semantic Elements | [semantic-elements.md](semantic-elements.md) | Structuring pages with landmarks; choosing the right sectioning element; document outline; headings hierarchy               |
| Forms             | [forms.md](forms.md)                         | Building forms; choosing input types; client-side validation; fieldsets; autocomplete; accessible form patterns             |
| Media             | [media.md](media.md)                         | Embedding images, video, audio; responsive images with srcset/picture; lazy loading media; captions and tracks              |
| Tables            | [tables.md](tables.md)                       | Marking up data tables; associating headers with cells; caption; responsive table patterns; avoiding layout tables          |
| Metadata          | [metadata.md](metadata.md)                   | Writing `<head>` content; meta tags for SEO and social sharing; Open Graph / Twitter Cards; charset; viewport; favicon      |
| Text Content      | [text-content.md](text-content.md)           | Choosing text-level elements; lists; links; emphasis vs. styling; abbreviations; quotations; code and pre-formatted text    |
| Accessibility     | [accessibility.md](accessibility.md)         | ARIA roles, states, and properties; landmark regions; live regions; widget patterns; accessible names; keyboard interaction |
| Performance       | [performance.md](performance.md)             | Resource hints (preload, prefetch, preconnect); lazy loading; async/defer scripts; fetchpriority; critical rendering path   |

---

## Quick Decision Guide

```
What is your goal?
│
├─ I need to structure a page with header, nav, main, aside, footer
│   └─▶ semantic-elements.md
│
├─ I need to build a form (login, registration, search, checkout)
│   └─▶ forms.md
│
├─ I need to embed images, video, or audio
│   └─▶ media.md
│
├─ I need to display tabular data
│   └─▶ tables.md
│
├─ I need to set up <head>, meta tags, or SEO
│   └─▶ metadata.md
│
├─ I need to pick the right element for text (links, lists, quotes, code)
│   └─▶ text-content.md
│
├─ I need to add ARIA attributes or make a widget accessible
│   └─▶ accessibility.md
│
└─ I need to optimize page load (preload, lazy load, defer scripts)
    └─▶ performance.md
```

---

## How to Use

1. **Identify your goal** — use the Quick Decision Guide above or the Sub-Skills table to find the right domain.
2. **Load the sub-skill file** — read the relevant `.md` file in full before generating code or explanations.
3. **Follow its patterns** — apply the conventions, examples, and anti-patterns shown in the sub-skill.
4. **Load multiple sub-skills** when the task spans domains — for example, building an accessible form requires both `forms.md` and `accessibility.md`.

> Sub-skill files are co-located in this folder. Always reference them by their relative path (e.g. `forms.md`).
