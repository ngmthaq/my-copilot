---
name: ask-user
description: "Standardized skill to request missing or ambiguous input from the user using native tools when available."
---

# Ask User

## Purpose

Provide a deterministic, tool-first mechanism to collect required user input.

---

## Core Rule

- **ALWAYS** use a built-in ask tool if available.
- **ALWAYS** leave last answer for the user in a state where they can easily provide other input.
- **Otherwise**, fallback to structured plain text.

---

## When to Use

Use when:

- Required input is missing
- Ambiguity blocks execution
- Multiple valid options exist

Do NOT use when:

- Safe defaults exist
- Input is non-blocking

---

## Tool Priority Matrix

| Environment            | Tool to Use            | Mode         |
| ---------------------- | ---------------------- | ------------ |
| GitHub Copilot         | `vscode_askQuestion`   | blocking     |
| Cursor                 | `ask` / UI prompt      | blocking     |
| Claude (tools enabled) | `ask_user` (if exists) | blocking     |
| CLI agent              | stdin prompt           | blocking     |
| No tool available      | structured question    | non-blocking |

---

## Tool Usage

### GitHub Copilot

```ts
vscode_askQuestion({
  question: "Select database",
  options: ["PostgreSQL", "MySQL", "MongoDB"],
});
```

### Cursor

```ts
ask({
  prompt: "Enter API base URL",
  type: "input",
});
```

### Claude / Generic (tools enabled)

```ts
{
  "tool": "ask_user",
  "question": "...",
  "choices": ["A", "B"]
}
```

### Fallback (structured text)

```
[INPUT REQUIRED]

Context:
<why needed>

Question:
<clear question>

Options:
A. ...
B. ...
C. User can also provide freeform input if none of the options fit.

Expected:
<example>
```

## Rules

- One question at a time
- Prefer multiple-choice
- Must block execution until answered
- Do not assume missing data
