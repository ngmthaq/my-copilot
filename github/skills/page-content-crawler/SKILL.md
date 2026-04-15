---
name: page-content-crawler
description: Unified web page content extraction skill using VSCode built-in page context first, with fallback to external multi-tier crawler (Node, Python, Chrome, curl, LLM fallback).
---

# Page Content Crawler (Unified)

## Purpose

This skill extracts structured content from web pages using a progressive retrieval strategy:

1. VSCode built-in page context tool (PRIMARY)
2. External multi-tier crawler (FALLBACK)
3. LLM-based approximation (LAST RESORT)

It supports both static and SPA pages.

---

## Core Principle

ALWAYS prefer VSCode built-in page content tool first.
ONLY use external crawler if built-in context is incomplete or insufficient.
NEVER directly scrape web pages.

---

## Content Logging

See the [content-logging.instructions.md](../../instructions/content-logging.instructions.md) for the full content logging convention.

---

## Execution Flow

### Step 1 — VSCode Built-in Page Context (Primary)

Use VSCode’s built-in page content retrieval.

Extract from provided context:

- title
- headings
- links
- main content

If content is sufficient → return immediately.

---

### Step 2 — Detect Incomplete or SPA Content

Trigger fallback if ANY condition is true:

- main content is empty or missing
- page appears JS-rendered (SPA)
- content is partial or truncated
- only navigation or layout is present
- article/main section is not available

---

### Step 3 — External Crawler Fallback

If Step 1 fails, call:

./scripts/crawl.sh <url>

This script internally handles:

- Node.js Playwright crawler
- Python Playwright crawler
- Chrome headless DOM dump
- curl fallback
- LLM fallback (last resort)

---

## Output Format

Always return:

{
"title": "",
"summary": "",
"main_content": "",
"headings": [],
"key_points": [],
"links": [],
"source_mode": "vscode | node | python | chrome | curl | fallback"
}

---

## Extraction Rules

### Title

- Prefer VSCode tool result
- fallback to crawler result if needed

---

### Main Content

- Extract the primary readable body of the page
- Prefer in order:
  - `<main>`
  - `<article>`
  - largest text container in DOM
- Must exclude:
  - navigation menus
  - headers/footers
  - sidebars
  - ads
  - scripts/styles
- Should represent the full meaningful readable content of the page

---

### Summary

- 3–6 sentences
- strictly derived from `main_content`
- no external knowledge unless fallback mode is active

---

### Headings

- preserve order
- extract h1, h2, h3 only
- remove duplicates

---

### Key Points

- extract semantic facts from main content
- remove UI/navigation noise
- prioritize informational content

---

### Links

- include only meaningful links
- exclude:
  - "#"
  - javascript:void
  - navigation duplicates

---

## Source Priority Order

1. vscode (highest priority)
2. node crawler (Playwright)
3. python crawler (Playwright)
4. chrome headless DOM
5. curl raw HTML
6. fallback (LLM approximation)

---

## Constraints

- NEVER bypass VSCode built-in tool if available
- NEVER manually fetch web content
- NEVER mix multiple sources without normalization
- NEVER hallucinate missing page content
- ALWAYS preserve source_mode

---

## Fallback Behavior

If crawler returns:

{
"fallback": true
}

Then:

- treat as non-authoritative
- only use for semantic approximation if required
- avoid factual extraction

---

## Best Practices

- Prefer VSCode tool for speed and reliability
- Use crawler only for SPA or incomplete content
- Normalize all outputs into consistent schema
- Keep extraction deterministic
- Always log fetched content to `crawled_contents_directory` following the path convention

---

## Anti-Patterns

- Ignoring VSCode tool when available
- Direct HTTP scraping inside skill
- Mixing raw HTML with structured output
- Overusing fallback crawler unnecessarily
- Fabricating missing content
