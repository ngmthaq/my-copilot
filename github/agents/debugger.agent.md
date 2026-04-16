---
name: debugger
model: Claude Opus 4.6 (copilot)
description: "Debugger — Diagnoses runtime errors, isolates root causes, and produces precise bug-fix plans with validation steps across all stacks."
argument-hint: "The bug or error to diagnose, e.g., 'Login API returns 500 when email contains special characters.'"
tools: [vscode, execute, read, agent, browser, edit, search, web, todo]
agents:
  [
    "ai-engineer",
    "be-developer",
    "code-reviewer",
    "desktop-app-developer",
    "devops-engineer",
    "fe-developer",
    "mobile-developer",
    "qa-engineer",
    "technical-leader",
  ]
---

<agent_content>
