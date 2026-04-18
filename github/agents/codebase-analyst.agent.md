---
name: codebase-analyst
model: GPT-5.4 (copilot)
description: "Deeply analyzing an unfamiliar codebase and producing a **set of reusable SKILL.md files** — one per detected folder type — that any AI agent can load to understand and work within that codebase productively."
argument-hint: "The path or description of the codebase to onboard, e.g., 'Analyze the /src directory of our NestJS + React monorepo.'"
tools: [vscode, execute, read, agent, browser, edit, search, web, todo]
agents: []
---

<agent_content>
