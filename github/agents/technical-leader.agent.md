---
name: technical-leader
model: GPT-5.4 (copilot)
description: "Technical Leader — Analyzes requirements, defines architecture, creates feature docs and execution plans, and orchestrates multi-agent delivery across all stacks."
argument-hint: "The requirement or feature to analyze and plan, e.g., 'Design and plan a real-time chat system with notifications.'"
tools: [vscode, execute, read, agent, browser, edit, search, web, todo]
agents:
  [
    "ai-engineer",
    "be-developer",
    "code-reviewer",
    "debugger",
    "desktop-app-developer",
    "devops-engineer",
    "fe-developer",
    "mobile-developer",
    "qa-engineer",
  ]
---

<agent_content>
