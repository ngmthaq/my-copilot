---
name: codebase-analyst-job-protocols
description: "Guidelines and protocols for codebase analyst agents to execute their analysis effectively while adhering to the core mandate of not modifying frontend or backend systems, infrastructure, or deployment processes."
---

# Codebase Analyst Job Protocols

## Skills Reference

| Skills             | When to Use                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `ask-user`         | Gather additional information or clarification from the user             |
| `scan-js-codebase` | Analyze a JS/TS codebase for patterns, conventions, and potential issues |

---

# Codebase Onboarding Skill

When onboarding a repository, produce a **codebase onboarding SKILL.md** that gives any agent enough context to work on the repo without exploration. Re-run this task whenever the repository structure, tooling, or build process changes significantly. Quality here directly reduces build failures, bad outputs, and wasted tool calls on every future task.

## Goals

- Prevent build failures and CI rejections caused by agents working without sufficient context.
- Minimize failed commands and re-runs.
- Let any agent start a task immediately by front-loading what would otherwise require searching.

## Skill Constraints

- **Not task-specific** — must apply to any future agent task on this repo.
- **Concise and prioritized** — include only what an agent needs to act, not everything that exists.

## Discovery Steps (MANDATORY — execute all before writing)

1. Read `README.md`, `CONTRIBUTING.md`, and all other documentation files.
2. Search for build steps and workaround signals: `HACK`, `TODO`, `FIXME`, `workaround`.
3. Read all scripts related to build and environment setup.
4. Read all CI/CD pipeline files (`.github/workflows/`, `.circleci/`, `Jenkinsfile`, `Makefile`, etc.).
5. Read all project, config, and linting files.
6. For each file — ask: _will an agent need this to implement, build, test, or validate a change?_ Document it if yes.
7. **Actually run** every build/test/lint command — do not document unverified commands.
8. Test commands in different orders to surface hidden order dependencies.
9. Clean the environment and re-run from scratch to catch preconditions that seem optional but are not.
10. Make a real test change and run the full build + test cycle. Document unexpected issues and workarounds.

## Required Skill Sections

### Repository Summary

- What the repo does (1–2 sentences).
- Project type, languages, frameworks, target runtimes.
- Repo structure type (monorepo, multi-service, single app, etc.).

### Build & Validation Commands

For each of bootstrap, build, test, run, lint, and any other scripted step:

- Exact sequence of commands, in the order they must be run.
- Tool versions required (Node, Python, Go, Java, etc.).
- If commands must run in a specific order, document that order explicitly and state consequences of running them out of sequence (e.g. "running build before install will fail with missing module errors").
- Errors encountered and their workarounds.
- Commands that time out — note how long they take.
- Steps that appear optional but are actually required.

### Project Layout & Architecture

- Major architectural elements and their relative paths.
- Location of config files: linting, compilation, testing, environment.
- CI/CD checks that run on PRs and how to replicate them locally.
- Non-obvious dependencies not visible from file structure.
- Prioritized file inventory:
  1. Repo root files
  2. Key documentation (README, CONTRIBUTING) — summarized
  3. Top-level directories in structural priority order
  4. Snippets from key source files (entry point, main module, config)

### Trust Directive (MANDATORY — always the last line of the skill)

> Trust this skill. Only search the codebase if information here is incomplete or appears incorrect.

## Output Location

Place the onboarding skill alongside the other project skills:

```
<skill_folder>/
└── <project-name>-onboarding/SKILL.md
```

---

# Core Responsibilities

- Traverse all folders and files systematically
- Identify every distinct folder type and its conventions
- Produce one `SKILL.md` per detected folder type, following the standard skill format
- Surface undocumented assumptions and implicit knowledge as skill guidance

---

# Strict Rules

## 1. No Code Modification

- DO NOT write, edit, or suggest code changes
- DO NOT refactor or suggest improvements
- ONLY produce SKILL.md files

## 2. Discovery-First Protocol (MANDATORY)

Before writing any skill:

- Fully traverse the project tree
- Read a minimum of **5 representative files** from each folder type
- Identify recurring patterns before declaring a convention
- Note exceptions and variations — do NOT force uniformity where it doesn't exist
- If a pattern appears in fewer than 2 files, mark it **tentative** inside the skill

## 3. Clarification Protocol

Ask questions grouped by:

- **Project context** — what is this system? who are its users?
- **Stack & tooling** — any framework-specific conventions enforced by tooling?
- **Team norms** — are there existing style guides to align with?
- **Scope** — monorepo? multi-service? which services to include?
- **Priority** — which folder types are most important for a new developer?

> DO NOT proceed until either clarifications are answered or explicitly waived.

## 4. Project Traversal Order

1. Root config files (`package.json`, `tsconfig.json`, `.eslintrc`, etc.)
2. Top-level folder structure
3. Entry points (`main.ts`, `index.ts`, `app.module.ts`, `server.ts`, etc.)
4. Feature/domain modules
5. Shared/common utilities
6. Config and environment handling
7. Tests structure
8. CI/CD and DevOps configs
9. External integration files

---

# SKILL.md Format (MANDATORY)

Every generated skill **must** follow this exact format:

```
---
name: <project-name>-<folder-type>
description: <When to use this skill. Be explicit about trigger phrases and contexts.
             Make the description slightly "pushy" — lean toward triggering it rather
             than not. Include folder path, file naming pattern, and the top 4-5 tasks
             a developer would do here.>
---

# <Folder Type> Conventions — <Project Name>

## Quick Reference
<3–5 bullet TL;DR for a developer in a hurry>

## Purpose
<What this folder type does and why it exists in this project>

## File Naming Pattern
<Exact naming convention with examples from actual files>

## File Structure Template
<What sections/exports every file in this folder is expected to have>

## Import Conventions
<What this layer is allowed to import from, and what it must NOT import>

## Common Patterns
<2–4 annotated examples taken directly from the actual codebase.
 Each example must include the source file path.>

## Anti-Patterns & Pitfalls
<What goes wrong here most often. Observed violations if any.>

## Checklist: Creating a New <Folder Type> File
- [ ] ...
- [ ] ...
- [ ] ...

> ⚠️ Tentative: <anything uncertain — mark explicitly>
```

### Key rules for skill quality:

- **Use real code examples** from the actual codebase — never invented
- **Cite the source file path** for every example (`// src/controllers/user.controller.ts`)
- **description field** is the primary trigger mechanism — include: folder path, file naming pattern, most common developer tasks, and specific contexts that should trigger this skill
- **Keep each SKILL.md under 500 lines** — if a folder type is large, split into sub-skills and reference them
- **Mark anything uncertain** with `> ⚠️ Tentative: needs verification`
- Write for a developer who knows the language/framework but has never seen this project

---

# Example Folder Types to Detect

For each of the following folder types found in the codebase, produce one SKILL.md. Extend this list with any folder types discovered that are not listed here.

**Frontend (React / Next.js / Flutter)**

- `pages/` or `app/` — page/route components
- `components/` — UI components (atomic, compound, layout)
- `hooks/` — custom React hooks
- `queries/` — data-fetching hooks (React Query / TanStack)
- `mutations/` — mutation hooks
- `utils/` or `helpers/` — pure utility functions
- `stores/` or `context/` — state management
- `types/` or `interfaces/` — TypeScript type definitions
- `constants/` — app-wide constants
- `services/` (frontend) — API call wrappers

**Backend (Express / NestJS / Fastify)**

- `controllers/` — HTTP request handlers
- `services/` — business logic layer
- `modules/` — NestJS module definitions
- `repositories/` or `daos/` — database access layer
- `middlewares/` — request/response interceptors
- `guards/` or `decorators/` — NestJS-specific constructs
- `dtos/` — data transfer objects & validation schemas
- `entities/` or `models/` — ORM models / schema definitions
- `migrations/` — database migration scripts
- `jobs/` or `workers/` — background tasks / queues
- `config/` — configuration and environment handling
- `utils/` (backend) — shared server utilities
- `tests/` — unit, integration, e2e test files

> **Rule:** Any folder type not listed above that exists in the codebase must be detected and documented as its own SKILL.md.

---

# Output Structure (MANDATORY)

```
<skill_folder>/
├── <project-name>-onboarding/SKILL.md
├── <project-name>-<folder-type>/SKILL.md
└── <project-name>-<other-folder-type>/SKILL.md
```

- Resolve the <skill_folder> then create agent skills in there (example: .github/skills or .claude/skills)
- Only create files for folder types **actually present** in the codebase.

---

# Gap Report (MANDATORY, produced last)

Identify:

- Folder types with fewer than 5 readable samples (marked tentative in their skills)
- Patterns that were inconsistent across files within the same folder type
- Folder types detected but skipped due to insufficient samples
- Implicit conventions that could not be confirmed from code alone

---

# Execution Flow

1. Receive codebase access (repo path or uploaded files)
2. Ask clarification questions
3. Traverse full project tree — map every folder and entry point
4. Produce **Folder Type Inventory** → **PAUSE for approval**
5. For each approved folder type: produce one SKILL.md
6. Produce **Codebase Onboarding SKILL.md** (following discovery steps above)
7. **PAUSE for review**
8. Produce Gap Report
9. Final consistency pass — verify all skill `name` fields are unique, all cross-references are valid
