# My Copilot

A curated collection of GitHub Copilot customization files — agents, skills, instructions, hooks, and document templates — designed to power an AI-assisted software development workflow across backend, frontend, and mobile teams.

## What's Inside

```
.github/
├── copilot-instructions.md        # Global rules inherited by all agents
├── agents/                        # 14 specialized agent definitions
├── skills/                        # 21 skill packs (frameworks, tools, private projects)
├── instructions/                  # Coding conventions & doc templates
├── hooks/                         # Automated guardrails (secrets, licenses, governance, …)
└── docs/
    ├── features/                  # Feature documentation
    └── plans/                     # Implementation & bugfix plans
```

### Agents

Role-based AI agents that follow a structured team workflow:

| Role                 | Agents                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| **Technical Leader** | `technical-leader` — analyzes requirements, creates plans, delegates work |
| **Developers**       | `be-developer`, `fe-developer`, `mobile-developer`                        |
| **QA Engineers**     | `be-qa-engineer`, `fe-qa-engineer`, `mobile-qa-engineer`                  |
| **Code Reviewer**    | `code-reviewer` — cross-stack code, test, and DevOps review               |
| **DevOps Engineer**  | `devops-engineer` — cross-stack infrastructure, CI/CD, and deployment     |
| **Debugger**         | `debugger` — cross-stack error diagnosis                                  |

### Skills

Reusable knowledge packs that agents load on demand:

- **Languages & Runtimes** — TypeScript, JavaScript, Dart
- **Backend** — NestJS, Express.js, Prisma, TypeORM, GraphQL, REST API
- **Frontend** — React.js, Vue.js (Composition API), Vite
- **Mobile** — Flutter, React Native (Expo)
- **Infrastructure** — Docker, Nginx, Git
- **Databases** — Relational DB, NoSQL (MongoDB, Redis, Cassandra, Neo4j)
- **Quality** — Linting (ESLint + Prettier)

### Instructions

- `js-coding-convention.instructions.md` — JS/TS naming, formatting, and style rules
- `flutter-coding-convention.instructions.md` — Dart/Flutter style rules
- `feature-doc-template.instructions.md` — Template for feature documentation
- `plan-template.instructions.md` — Template for implementation plans
- `bugfix-plan-template.instructions.md` — Template for bugfix plans

### Hooks

Automated checks that run as Copilot guardrails:

- **secrets-scanner** — Detects leaked credentials
- **dependency-license-checker** — Flags problematic licenses
- **governance-audit** — Enforces repo governance rules
- **session-logger** — Logs agent session activity
- **tool-guardian** — Controls tool access per agent

## Getting Started

### Option 1: npx (Recommended)

Run in your project directory:

```bash
npx @ngmthaq/my-copilot init
```

This copies the `.github` folder into your current directory.

To overwrite an existing `.github` folder:

```bash
npx @ngmthaq/my-copilot init --force
```

### Option 2: Clone

1. Clone the repo into your workspace.
2. Run `copy-github.sh` to copy `.github/` to a sibling project.

### Then

Open the workspace in VS Code with GitHub Copilot Chat enabled. Agents, skills, instructions, and hooks are picked up automatically from `.github/`.

## Formatting

```bash
yarn format          # Auto-fix with Prettier
yarn format:check    # Check only
```

## License

ISC
