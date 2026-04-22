---
name: ask-user
description: "Standardized skill to request missing or ambiguous input from the user using native tools when available."
---

# Ask User

## Purpose

Provide a deterministic, tool-first mechanism to collect required user input.

---

## Core Rules

- **ALWAYS** use a built-in ask tool if available.
- **ALWAYS** leave the last option open for freeform user input (never end with a closed list).
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
  options: ["PostgreSQL", "MySQL", "MongoDB", "Other (describe yours)"],
  //                                            ^ always include a freeform last option
});
```

### Cursor

```ts
ask({
  prompt: "Enter API base URL",
  type: "input", // freeform by nature — satisfies the open-last rule
});
```

### Claude / Generic (tools enabled)

```ts
{
  "tool": "ask_user",
  "question": "...",
  "choices": ["A", "B", "Something else (type your answer)"]
  //                      ^ always include a freeform last choice
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
C. Other — describe your own answer below.
  ^ always end with an open option

Expected:
<example>
```

---

## Rules

- One question at a time
- Prefer multiple-choice, but **always append a freeform last option**
- Must block execution until answered
- Do not assume missing data
