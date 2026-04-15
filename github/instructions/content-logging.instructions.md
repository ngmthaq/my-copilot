---
description: "Use when the page-content-crawler skill saves crawled content to disk. Defines the directory structure, file naming, URL sanitization rules, and logging requirements for crawled content."
---

# Reference Logging Template

## Overview

Defines the convention for persisting crawled reference content to disk. After the page-content-crawler skill extracts markdown from a URL, the output must be saved in a deterministic directory structure so every agent can locate and re-use cached reference material.

## Architecture

After extraction, ALWAYS save the markdown output to:

```
{crawled_contents_directory}/<skill-name>/<reference-file-name>/<sanitized-url>/content.md
```

### Path Segments

| Segment               | Description                                                                 | Example                            |
| --------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| `skill-name`          | The skill that triggered the crawl                                          | `react`, `angular`, `nodejs`       |
| `reference-file-name` | The reference markdown file name (without extension) that contained the URL | `w3school-react-references`        |
| `sanitized-url`       | The URL with protocol stripped, `/` replaced by `_`, special chars removed  | `reactjs_org_docs_getting-started` |
| `content.md`          | Fixed filename                                                              | `content.md`                       |

### URL Sanitization Rules

| Step | Rule                                         |
| ---- | -------------------------------------------- |
| 1    | Remove protocol (`https://`, `http://`)      |
| 2    | Remove trailing slashes                      |
| 3    | Replace `/` with `_`                         |
| 4    | Remove query strings and fragments           |
| 5    | Remove special characters except `-` and `_` |
| 6    | Lowercase everything                         |

### Usage Examples

**Input:**

- URL: `https://www.w3schools.com/react/react_intro.asp`
- Skill: `react`
- Reference file: `w3school-react-references.md`

**Output path:**

```
{crawled_contents_directory}/react/w3school-react-references/www_w3schools_com_react_react_intro_asp/content.md
```

**Output content:**

```markdown
# Content extracted from https://www.w3schools.com/react/react_intro.asp

Title: "",
Description: "",
Main Content: ""
```

## Known Limitations

- ALWAYS create directories if they don't exist
- ALWAYS overwrite existing `content.md` if re-crawled
- NEVER skip logging even if content is from fallback mode
- Content saved must match the exact markdown output schema defined in the page-content-crawler skill Output Format
