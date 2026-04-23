# @ngmthaq20/my-copilot

A curated, ready-to-use collection of AI copilot customization files — **agents**, **skills**, and **document templates** — designed to power an AI-assisted software development workflow across backend, frontend, mobile, desktop, and AI/ML teams.

---

# Initialization

Run in your project directory:

```bash
npx @ngmthaq20/my-copilot@latest init github
```

---

# 🤖 Multi-Agent Engineering Workflow

A structured, AI-powered engineering team built on GitHub Copilot agents. Each agent has a defined role, a set of protocol skills, and a clear place in the delivery pipeline — from raw requirement to validated, production-ready code.

---

## 🔄 Workflow 1 — Feature Implementation

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

### Step-by-step

1. **Start a conversation with `@technical-leader`**, describing the feature you want.

   > _Example: "Implement a user authentication system with JWT and refresh tokens."_

2. **Answer clarifying questions.** The technical-leader will ask about stack, constraints, acceptance criteria, and edge cases.

3. **Review and approve the plan.** The technical-leader produces a structured plan with task breakdowns (e.g., `BE-1`, `FE-1`, `DEVOPS-1`). Approve or request changes.

4. **Agents execute.** The technical-leader assigns tasks to `@developer` and/or `@devops-engineer` with full context prompts.

5. **Review loop.** Once implementation is complete, `@code-reviewer` and `@qa-engineer` are assigned automatically. If issues are found, the technical-leader loops back to the implementers.

6. **Delivery.** When all gates pass, the technical-leader summarises results back to you.

---

## 🐛 Workflow 2 — Bug Fix

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

### Step-by-step

1. **Report the bug to `@technical-leader`** with reproduction steps and observed vs. expected behavior.

   > _Example: "Login API returns 500 when email contains a + character."_

2. **Debugger diagnoses.** The `@debugger` investigates logs, traces, and code paths to establish a **verified root cause** — it does not fix anything.

3. **Implementation loop.** Armed with the root cause, the technical-leader creates a fix plan and follows the standard Workflow 1 from step 4 onward.

---

## 🧭 Workflow 3 — Codebase Onboarding

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

### Step-by-step

1. **Invoke `@codebase-analyst`** with the path or description of the codebase.

   > _Example: "Analyze the /src directory of our NestJS + React monorepo."_

2. **Review generated SKILL.md files.** Each file captures: directory structure, tech stack, coding conventions, patterns, and agent-specific guidance for that folder type.

3. **Commit the skills to the repo.** All other agents load these files as context when working in the relevant directories — this is what makes agent outputs consistent with your actual codebase.

4. **Re-run when needed.** After major refactors, dependency upgrades, or architectural changes, run the analyst again to keep skills current.

---

## 💡 Tips for New Developers

**Always start with `@technical-leader`.** Never invoke implementation agents directly for new features — the technical-leader's plan is the source of truth that all other agents align to.

**Let the debugger diagnose before fixing.** Skipping root cause analysis leads to superficial patches. The debugger's report gives the developer the exact context needed to fix correctly.

**Onboard the codebase first.** On a new project, run `@codebase-analyst` before any implementation work. Agents without project skills will produce generic output that may not fit your conventions.

**Approve plans before execution.** The plan review step is your main control point. Read it carefully — once agents start implementing, changes require a new loop.

**Skills are living documents.** If you notice an agent making repeated mistakes about a pattern in your codebase, update the relevant SKILL.md. All agents benefit immediately.

---

## 🚦 Quality Gates

No work ships without passing both review stages:

| Gate        | Agent           | Checks                                                                    |
| ----------- | --------------- | ------------------------------------------------------------------------- |
| Code Review | `code-reviewer` | Correctness, security, performance, plan adherence, engineering standards |
| QA          | `qa-engineer`   | Acceptance criteria coverage, edge cases, regression safety               |

If either gate fails, the technical-leader loops back to the implementer with specific feedback. The cycle repeats until all gates pass.

---

## License

ISC
