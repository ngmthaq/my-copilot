# Workspace Instructions

---

## Workspace Configuration

- **ALWAYS READ** `Project Context` section below to get configuration values
- Use these configured values instead of hardcoded values throughout the session
- All agents and instructions reference config values as placeholders — resolve them from the config

---

## Project Context

- **project_name**: `My Copilot`
- **project_description**: `A curated collection of AI copilot customization files — agents, skills, and document templates.`
- **programming_languages**: `JavaScript`
- **frameworks**: `N/A`
- **package_managers**: `Yarn`
- **key_libraries**: `N/A`
- **database**: `N/A`
- **doc_directory**: `<workspace>/<target>/docs`
- **test_methodology**: `none`

> Resolve `<workspace>` is the current workspace
> Resolve `<target>` is the current AI platform, which could be a .github or .claude folder
> **test_methodology** is either `code-first`, `test-first` or `none`. If `none`, do not generate tests.

---

## DO

- DO: Define a specific, bounded role. Clearly outline the agent’s purpose, responsibilities, and constraints before building.
- DO: Use "least privilege" access. Grant the agent only the absolute minimum permissions (read/write) required for its specific task.
- DO: Implement human-in-the-loop for high-stakes actions. Require human approval for irreversible actions like deleting data, sending emails, or financial transactions.
- DO: Provide structured context. Use clear delimiters (like Markdown or JSON) and prioritize relevant information to guide the agent.
- DO: Log every tool call and action. Keep detailed logs of inputs, outputs, and tool usage to enable debugging and auditability.
- DO: Run evaluation tests (Evals) regularly. Test the agent against a set of "golden examples" to ensure consistent behavior, especially after changing system prompts.

## DON'T

- DON'T: Give vague instructions. Avoid commands like "be helpful." Ambiguous instructions lead to unpredictable and autonomous behavior.
- DON'T: Grant broad or administrative access. Never allow an agent to inherit full system rights, as this expands the potential damage from a compromised agent.
- DON'T: Assume the agent is fully autonomous. Do not allow the agent to operate without oversight, particularly during the first 30 days of deployment.
- DON'T: Dump raw, unchunked data. Avoid overwhelming the agent with excessive information, which can cause context window overloads and "hallucinations".
- DON'T: Allow silent failures. Never treat an agent as a black box that just works. If an agent fails, it must notify a human rather than guessing or continuing in a broken state.
- DON'T: Treat initial deployment settings as permanent. Agent behavior can drift, and models can change. Continuously update boundaries based on performance data.

---

## Agent Conventions

Shared rules referenced by all agents in `agents` folder.

### The `agents` Field

Declares the agent's relationship to other agents:

- **orchestrator** (`technical-leader`): lists agents it _can invoke_
- **all others**: lists the agent they _report to_ upon completion or when blocked

### Protocol Skill-Loading Rule

If the incoming prompt includes `**Author:** technical-leader`, load the protocol skill that matches the assigned task type. Otherwise, infer the relevant skill from task content.

### Escalation Rule

If blocked for any reason — missing context, ambiguous requirements, environment issues, or inability to reproduce a problem — do not make assumptions or proceed with incomplete information. Report back to the agent listed in the `agents` field with a specific, actionable blocker description.

---

## 🤖 Multi-Agent Engineering Workflow

Each agent has a defined role, a set of protocol skills, and a clear place in the delivery pipeline — from raw requirement to validated, production-ready code.

---

### 🔄 Workflow 1 — Feature Implementation

This is the standard path for any new feature or task.

```
User
 │
 ▼
┌─────────────────────────────────────────────────────────┐
│                   technical-leader                      │
│                                                         │
│  1. Receives requirement from user                      │
│  2. Asks clarifying questions                           │
│  3. Creates implementation plan                         │
│  4. Awaits user approval                                │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             ▼                        ▼
      developer                devops-engineer
      (implements tasks)       (implements infra)
             │                        │
             └──────────┬─────────────┘
                        │ reports back to technical-leader
                        ▼
┌───────────────────────────────────────────────────────┐
│                  technical-leader                     │
│  Assigns review & QA in parallel                      │
└──────────────┬────────────────────┬───────────────────┘
               │                    │
               ▼                    ▼
        code-reviewer           qa-engineer
        (quality & security)   (tests & validation)
               │                    │
               └──────────┬─────────┘
                          │ reports status
                          ▼
              ┌─────────────────────┐
              │  technical-leader   │
              │                     │
              │  Issues? → loop     │
              │  All pass? → done   │
              └──────────┬──────────┘
                         │
                         ▼
                        User ✅
```

#### Step-by-step

1. **Start a conversation with `@technical-leader`**, describing the feature you want.

   > _Example: "Implement a user authentication system with JWT and refresh tokens."_

2. **Answer clarifying questions.** The technical-leader will ask about stack, constraints, acceptance criteria, and edge cases.

3. **Review and approve the plan.** The technical-leader produces a structured plan with task breakdowns (e.g., `BE-1`, `FE-1`, `DEVOPS-1`). Approve or request changes.

4. **Agents execute.** The technical-leader assigns tasks to `@developer` and/or `@devops-engineer` with full context prompts.

5. **Review loop.** Once implementation is complete, `@code-reviewer` and `@qa-engineer` are assigned automatically. If issues are found, the technical-leader loops back to the implementers.

6. **Delivery.** When all gates pass, the technical-leader summarises results back to you.

---

### 🐛 Workflow 2 — Bug Fix

When a bug is reported, a diagnosis phase is inserted before implementation.

```
User (reports bug)
        │
        ▼
technical-leader
        │
        ▼
    debugger
    (root cause analysis — does NOT fix)
        │ reports root cause
        ▼
technical-leader
        │
        └── then follows Workflow 1 (implement → review → QA)
```

#### Step-by-step

1. **Report the bug to `@technical-leader`** with reproduction steps and observed vs. expected behavior.

   > _Example: "Login API returns 500 when email contains a + character."_

2. **Debugger diagnoses.** The `@debugger` investigates logs, traces, and code paths to establish a **verified root cause** — it does not fix anything.

3. **Implementation loop.** Armed with the root cause, the technical-leader creates a fix plan and follows the standard Workflow 1 from step 4 onward.

---

### 🧭 Workflow 3 — Codebase Onboarding

Run this once when setting up the agent system on a new project, or after major structural changes. It generates the SKILL.md files that all other agents rely on.

```
User
  │
  ▼
@codebase-analyst "Analyze /src"
  │
  ▼
Generates skills/
  ├── backend/SKILL.md
  ├── frontend/SKILL.md
  ├── infra/SKILL.md
  └── ...
```

#### Step-by-step

1. **Invoke `@codebase-analyst`** with the path or description of the codebase.

   > _Example: "Analyze the /src directory of our NestJS + React monorepo."_

2. **Review generated SKILL.md files.** Each file captures: directory structure, tech stack, coding conventions, patterns, and agent-specific guidance for that folder type.

3. **Commit the skills to the repo.** All other agents load these files as context when working in the relevant directories — this is what makes agent outputs consistent with your actual codebase.

4. **Re-run when needed.** After major refactors, dependency upgrades, or architectural changes, run the analyst again to keep skills current.

---

### 🚦 Quality Gates

No work ships without passing both review stages:

| Gate        | Agent           | Checks                                                                    |
| ----------- | --------------- | ------------------------------------------------------------------------- |
| Code Review | `code-reviewer` | Correctness, security, performance, plan adherence, engineering standards |
| QA          | `qa-engineer`   | Acceptance criteria coverage, edge cases, regression safety               |

If either gate fails, the technical-leader loops back to the implementer with specific feedback. The cycle repeats until all gates pass.
