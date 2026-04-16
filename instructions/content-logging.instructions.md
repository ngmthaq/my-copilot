---
applyTo: "**/*"
paths:
  - "**/*"
description: "Use when the page-content-crawler skill saves crawled content to disk. Defines the directory structure, file naming, URL sanitization rules, and logging requirements for crawled content."
---

# Reference Logging Template

---

## 1. Overview

Defines the convention for persisting crawled reference content to disk.

All crawled content MUST be:

- deterministic
- traceable
- reusable across agents

---

## 2. Storage Structure

```
{crawled_contents_directory}/<skill-name>/<reference-file-name>/<sanitized-url>/content.md
```

---

## 3. Path Segments

| Segment             | Description                               |
| ------------------- | ----------------------------------------- |
| skill-name          | Skill triggering the crawl                |
| reference-file-name | Source reference file (without extension) |
| sanitized-url       | Normalized URL                            |
| content.md          | Extracted markdown content                |

---

## 4. URL Sanitization Rules

1. Remove protocol (`http://`, `https://`)
2. Remove trailing slashes
3. Replace `/` with `_`
4. Remove query strings and fragments
5. Remove special characters except `-` and `_`
6. Convert to lowercase

---

## 5. Content Format (MANDATORY)

```markdown
# Content extracted from <original-url>

## Metadata

- source_url:
- sanitized_url:
- crawled_at:
- skill:
- reference_file:
- extraction_method: (crawler | fallback)
- content_hash:

## Title

...

## Description

...

## Main Content

...
```
