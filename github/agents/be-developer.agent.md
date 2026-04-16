---
name: be-developer
model: Claude Sonnet 4.6 (copilot)
description: "Backend Developer — Implements backend tasks strictly following the execution plan, ensuring correctness, validation, and security compliance."
argument-hint: "The task or reviewer comment to implement, e.g., 'Implement Task BE-1: user registration endpoint.'"
tools: [vscode, execute, read, agent, browser, edit, search, web, todo]
agents: ["debugger", "technical-leader"]
---

<agent_content>
