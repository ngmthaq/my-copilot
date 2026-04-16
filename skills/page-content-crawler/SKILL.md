---
name: page-content-crawler
description: Web page content extraction skill using node-crawler.cjs (Node.js Playwright) as the sole crawler.
---

# Page Content Crawler

## Purpose

This skill extracts structured content from web pages by always invoking `node-crawler.cjs` directly. It supports both static and SPA pages.

---

## Core Principle

ALWAYS use `node-crawler.cjs` to crawl web pages.
NEVER use VSCode built-in page context tool.
NEVER use any other crawler (Python, Chrome, curl).
NEVER use LLM approximation as a substitute for crawled content.

---

## Requirements

The following must be set up on the system before using this skill:

- **Node.js** installed and available in `PATH`
- **Playwright** installed globally: `npm install -g playwright`
- **Playwright browsers** installed: `npx playwright install`

If any of these are missing, the crawler will fail. Do not attempt to fall back to another method — report the missing dependency to the user instead.

---

## Content Logging

See the [content-logging.instructions.md](../../instructions/content-logging.instructions.md) for the full content logging convention.

---

## Execution Flow

### Step 1 — Run node-crawler.cjs

Always call:

```
node <path-to-skills>/skills/page-content-crawler/node-crawler.cjs <url>
```

This uses Node.js with Playwright (Chromium, headless) to:

- navigate to the URL and wait for `networkidle`
- extract `title` from `document.head`
- extract `description` from meta tags (`name="description"`, `property="description"`, `name="og:description"`, `property="og:description"`, `name="twitter:description"`, `property="twitter:description"`)
- extract `main` text content from `<main>` element, falling back to `document.body`

---

### Step 2 — Parse Output

The crawler outputs JSON:

```json
{
  "title": "<page title>",
  "description": "<meta description or null>",
  "main": "<main element or full body text, line-trimmed>"
}
```

Use this output to populate the response.

---

## Output Format

Always return:

```json
{
  "title": "",
  "description": "",
  "main_content": ""
}
```

---

## Extraction Rules

### Title

- Use the `title` field from `node-crawler.cjs` output

---

### Description

- Use the `description` field from `node-crawler.cjs` output
- Sourced from the first available meta tag in this priority order:
  1. `meta[name="description"]`
  2. `meta[property="description"]`
  3. `meta[name="og:description"]`
  4. `meta[property="og:description"]`
  5. `meta[name="twitter:description"]`
  6. `meta[property="twitter:description"]`
- May be `null` if no meta description is present

---

### Main Content

- Extract the primary readable body of the page
- The crawler already prefers `<main>` over `document.body`
- Prefer in order:
  - `<main>` (selected by crawler)
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

## Source

- Always: `node-crawler.cjs` (Node.js + Playwright Chromium, headless)

---

## Constraints

- ALWAYS use `node-crawler.cjs` — no exceptions
- NEVER use VSCode built-in page context tool
- NEVER use Python, Chrome, curl, or any other crawler
- NEVER hallucinate missing page content

---

## Error Handling

If `node-crawler.cjs` exits with a non-zero code or outputs an error:

- report the error to the user
- do not fabricate or approximate content
- do not fall back to any other source

---

## Best Practices

- Always invoke `node-crawler.cjs` directly for every crawl request
- Normalize output into the consistent schema before returning
- Keep extraction deterministic
- Always log fetched content to `crawled_contents_directory` following the path convention

---

## Anti-Patterns

- Using VSCode built-in page context tool instead of `node-crawler.cjs`
- Falling back to Python, Chrome, curl, or LLM approximation
- Mixing raw HTML with structured output
- Fabricating missing content
