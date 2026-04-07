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

## 2. Coding Convention Instructions

These instruction files define formatting rules, naming conventions, and style standards. They apply automatically to matching files via the `applyTo` glob, but **agents must also load them explicitly with `read_file` before writing or reviewing code**.

| Instruction File                                                 | Covers                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| `.github/instructions/js-coding-convention.instructions.md`      | Formatting, naming, imports, TypeScript, ESLint, Prettier |
| `.github/instructions/flutter-coding-convention.instructions.md` | Formatting, naming, imports, widget conventions, Dart     |
| `.github/instructions/feature-doc-template.instructions.md`      | Feature document template for all agents                  |
| `.github/instructions/plan-template.instructions.md`             | Plan document template for feature implementation         |
| `.github/instructions/bugfix-plan-template.instructions.md`      | Bug-fix plan template for debugger agents                 |

**Rule:** When writing, editing, or reviewing code in any of the above file types, load the corresponding instruction file using `read_file` and follow its conventions strictly.

---

## 3. Requirement Clarification — Never Assume

Before starting any task, AI **must** ask the user clarifying questions to fully understand the requirement. Do **not** assume any detail that has not been explicitly stated.

Guiding principles:

- Ask about scope, constraints, and expected behavior upfront.
- If the task is ambiguous, surface the ambiguity and ask the user to resolve it.
- Ask about technology choices (framework, library, database) if they are not already clear from the context.
- Ask about edge cases and error handling expectations when relevant.
- Only proceed with implementation after the user has answered all critical questions.

Use the `vscode_askQuestions` tool to collect answers in a structured way.

---

## 4. General Workflow Summary

For every task, follow this order:

1. **Load** the relevant framework `SKILL.md` and any needed sub-skill files.
2. **Load** the relevant coding convention instruction file using `read_file` before writing or reviewing code.
3. **Ask** clarifying questions — never assume requirements.
4. **Propose** a feature doc and wait for user approval before creating it. This is the source of truth for all agents.
5. **Propose** a plan document (based on the feature doc) and wait for user approval before creating it.
6. **Implement** following the feature doc and plan, using the loaded skill/instruction patterns.
7. **Update** the plan checkboxes as steps complete.
