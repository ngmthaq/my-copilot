# GitHub Copilot Workspace Instructions

## 1. Framework-Specific Skills

This workspace uses skill files as the authoritative source of patterns, conventions, and best practices. Each framework has a `SKILL.md` entry point that maps to focused sub-skill files. Load the relevant `SKILL.md` before writing any code:

| Framework / Technology   | SKILL.md Entry Point                            |
| ------------------------ | ----------------------------------------------- |
| Dart                     | `.github/skills/dart/SKILL.md`                  |
| Docker                   | `.github/skills/docker/SKILL.md`                |
| Express.js               | `.github/skills/expressjs/SKILL.md`             |
| Flutter                  | `.github/skills/flutter/SKILL.md`               |
| Git                      | `.github/skills/git/SKILL.md`                   |
| GraphQL                  | `.github/skills/graphql/SKILL.md`               |
| JavaScript               | `.github/skills/javascript/SKILL.md`            |
| Linting                  | `.github/skills/linting/SKILL.md`               |
| NestJS                   | `.github/skills/nestjs/SKILL.md`                |
| Nginx                    | `.github/skills/nginx/SKILL.md`                 |
| NoSQL                    | `.github/skills/nosql/SKILL.md`                 |
| Prisma                   | `.github/skills/prisma/SKILL.md`                |
| React.js                 | `.github/skills/reactjs/SKILL.md`               |
| React Native             | `.github/skills/react-native/SKILL.md`          |
| Relational Database      | `.github/skills/relational-database/SKILL.md`   |
| REST API                 | `.github/skills/restapi/SKILL.md`               |
| TypeORM                  | `.github/skills/typeorm/SKILL.md`               |
| TypeScript               | `.github/skills/typescript/SKILL.md`            |
| Vite                     | `.github/skills/vite/SKILL.md`                  |
| Vue.js (Composition API) | `.github/skills/vuejs-composition-api/SKILL.md` |

**Rule:** Before writing any code or making architectural decisions, identify which framework(s) are involved and load the corresponding `SKILL.md` using `read_file`. Each `SKILL.md` contains a sub-skills table — load only the specific sub-skill files relevant to the task at hand.

---

## 2. Available Instructions

These instruction files define formatting rules, naming conventions, file templates, and style standards. They apply automatically to matching files via the `applyTo` glob, but **agents must also load them explicitly with `read_file` before writing or reviewing code**.

| Instruction File                                                 | Covers                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| `.github/instructions/js-coding-convention.instructions.md`      | Formatting, naming, imports, TypeScript, ESLint, Prettier |
| `.github/instructions/flutter-coding-convention.instructions.md` | Formatting, naming, imports, widget conventions, Dart     |
| `.github/instructions/feature-doc-template.instructions.md`      | Feature document template for all agents                  |
| `.github/instructions/plan-template.instructions.md`             | Plan document template for feature implementation         |
| `.github/instructions/bugfix-plan-template.instructions.md`      | Bug-fix plan template for debugger agents                 |

**Rule:** When writing, editing, or reviewing code in any of the above file types, load the corresponding instruction file using `read_file` and follow its conventions strictly.

---

## 3. Available Hooks

This workspace uses Copilot coding agent hooks (`.github/hooks/`) to enforce governance, security, compliance, and observability. Hooks run automatically at specific lifecycle events — agents do **not** need to invoke them manually.

| Hook                       | Path                                        | Event(s)                                            | Description                                                                                                             |
| -------------------------- | ------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Governance Audit           | `.github/hooks/governance-audit/`           | `sessionStart`, `sessionEnd`, `userPromptSubmitted` | Scans prompts for threat signals (data exfiltration, privilege escalation, prompt injection) and logs governance events |
| Dependency License Checker | `.github/hooks/dependency-license-checker/` | `sessionEnd`                                        | Scans newly added dependencies for copyleft / restrictive licenses (GPL, AGPL, SSPL, etc.)                              |
| Secrets Scanner            | `.github/hooks/secrets-scanner/`            | `sessionEnd`                                        | Scans modified files for leaked secrets, API keys, credentials, and private keys before commit                          |
| Session Logger             | `.github/hooks/session-logger/`             | `sessionStart`, `sessionEnd`, `userPromptSubmitted` | Logs session start/end times and user prompt events for audit trails and usage analytics                                |
| Tool Guardian              | `.github/hooks/tool-guardian/`              | `preToolUse`                                        | Blocks dangerous tool operations (destructive file ops, force pushes, DB drops) before execution                        |

**Note:** Each hook folder contains a `hooks.json` (lifecycle config), shell scripts, and a `README.md` with full documentation. Refer to the individual README for configuration options (guard modes, allowlists, environment variables).

---

## 4. Requirement Clarification — Never Assume

Before starting any task, AI **must** ask the user clarifying questions to fully understand the requirement. Do **not** assume any detail that has not been explicitly stated.

Guiding principles:

- Ask about scope, constraints, and expected behavior upfront.
- If the task is ambiguous, surface the ambiguity and ask the user to resolve it.
- Ask about technology choices (framework, library, database) if they are not already clear from the context.
- Ask about edge cases and error handling expectations when relevant.
- Only proceed with implementation after the user has answered all critical questions.

Use the `vscode_askQuestions` tool to collect answers in a structured way.

---

## 5. Agent Common Rules

These rules are inherited by all agents via `copilot-instructions.md`. Individual agent files should **only** contain role-specific additions — not repeat these common rules.

### 5.1. All Agents

For every task, follow this order:

1. **Load** the relevant framework `SKILL.md` and only the specific sub-skill files needed.
2. **Load** the relevant coding convention instruction file using `read_file` before writing or reviewing code.
3. **Ask** clarifying questions — never assume requirements.
4. Follow all patterns and conventions from the loaded skill files and coding convention instructions.

### 5.2. Implementers (developer, QA engineer, DevOps engineer)

In addition to Section 5.1:

- **ALWAYS** read the feature doc (or bug-fix plan) as the **source of truth** for requirements and design before starting work
- **ALWAYS** read the plan document and follow it step by step
- **DO NOT** skip reading the feature doc and plan before starting
- Mark plan checkboxes (`[ ]` → `[x]`) as each step is completed

### 5.3. Developers

In addition to Section 5.2:

- **DO NOT** skip loading the framework `SKILL.md` before coding
- **DO NOT** deviate from the plan without flagging it to the technical leader
- Fix code review comments and security issues flagged by the code-reviewer agent

### 5.4. QA Engineers

In addition to Section 5.2:

- **DO NOT** modify production source code to make tests pass — fix the tests instead
- **DO NOT** write tests that test implementation details — test behavior
- Follow the AAA pattern (Arrange, Act, Assert)
- Run tests to verify they pass before reporting completion

### 5.5. DevOps Engineers

In addition to Section 5.2:

- **DO NOT** modify application business logic — only infra and deployment config
- **DO NOT** hardcode secrets or credentials in any configuration file
- **ONLY** use secure, minimal base images and follow platform best practices

### 5.6. Code Reviewers

In addition to Section 5.1:

- **ALWAYS** read the feature doc (or bug-fix plan) as the **source of truth** before reviewing any code
- **ALWAYS** read the plan document to verify implementation completeness
- **DO NOT** skip reading the feature doc and plan before reviewing
- **DO NOT** modify or edit any source code — only produce review comments
- **DO NOT** approve code that deviates significantly from the plan without flagging it
- **DO NOT** approve code with critical or high severity security issues without flagging them
- **ONLY** produce structured code review feedback

### 5.7. Debuggers

In addition to Section 5.1:

- **ALWAYS** create the plan document with diagnosis and fix steps — this is the **source of truth** for all agents (follow workspace instructions for the Bug-Fix Plan Structure)
- **WAIT** for user approval of the plan before delegating tasks to sub-agents
- **NEVER** skip the plan document — **ALWAYS** create it
- **DO NOT** implement code — delegate to the developer agent
- **DO NOT** guess the root cause without evidence — trace the issue through code and logs
- **DO NOT** modify source files — you are a diagnostic and planning agent only
- **ALWAYS** provide file paths, line numbers, and code references in your diagnosis
- **ALWAYS** explain the root cause before suggesting a fix
- **ONLY** produce diagnoses, plans, and task delegations

### 5.8. Technical Leaders

In addition to Section 5.1:

- **ALWAYS** create the feature document — this is the **source of truth** for all agents (follow workspace instructions for path and structure)
- Before creating the feature doc, **ALWAYS list `.github/docs/features/`** to discover existing module directories — place the doc inside an existing module folder if one matches; **ONLY** create a new module directory when no existing one fits
- **WAIT** for user approval of the feature doc before proceeding to the plan
- **ALWAYS** create the plan document based on the approved feature doc (follow workspace instructions for path and naming)
- **WAIT** for user approval of the plan before delegating tasks to sub-agents
- **DO NOT** implement code — delegate to the developer agent
- **DO NOT** assume requirements — **ALWAYS** clarify ambiguities first
- **DO NOT** create the plan before the user has approved the feature doc — the feature doc is the source of truth
- **NEVER** skip the feature document — **ALWAYS** create it
- **NEVER** skip the plan document — **ALWAYS** create it
- **ONLY** produce plans, architecture decisions, task breakdowns, and documentation
