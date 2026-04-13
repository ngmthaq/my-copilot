---
name: github-mcp
description: "GitHub MCP tool gotchas and best practices — covers known pitfalls when using GitHub MCP server tools (create_pull_request, update_pull_request, create_issue, push_files, etc.) from AI agents. Use when: calling any GitHub MCP tool to create or update issues, PRs, branches, or files. DO NOT USE FOR: Git CLI commands (use git SKILL.md); general GitHub Actions or CI/CD."
---

# GitHub MCP Tools Skill

## Overview

This file documents known issues, gotchas, and best practices when using **GitHub MCP server tools** (e.g., `mcp_io_github_git_create_pull_request`, `mcp_io_github_git_update_pull_request`, `mcp_io_github_git_push_files`) from AI agents inside VS Code.

---

## Known Issues

### 1. Literal `\n` in PR / Issue Body

**Problem:** When passing multi-line content to `body` parameters of GitHub MCP tools (e.g., `create_pull_request`, `update_pull_request`, `create_issue`), using escaped `\n` characters results in literal `\n` text rendered on GitHub instead of actual line breaks.

**Wrong:**

```
body: "## Summary\n\nThis PR updates the README."
```

Renders on GitHub as:

> ## Summary\n\nThis PR updates the README.

**Correct:**

Pass actual newlines in the parameter value — not escaped `\n` sequences.

```
body: "## Summary

This PR updates the README."
```

Renders on GitHub as:

> ## Summary
>
> This PR updates the README.

**Rule:** Never use literal `\n` or `\n\n` in `body`, `title`, or `message` parameters of GitHub MCP tools. Always use real newlines.
