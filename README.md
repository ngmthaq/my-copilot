# @ngmthaq20/my-copilot

A curated, ready-to-use collection of GitHub Copilot customization files — **agents**, **skills**, **instructions**, **hooks**, and **document templates** — designed to power an AI-assisted software development workflow across backend, frontend, mobile, desktop, and AI/ML teams.

Drop it into any project and get a fully structured AI team out of the box.

---

## Table of Contents

- [Installation](#installation)
- [Initialization](#initialization)
- [What's Inside](#whats-inside)
  - [Agents](#agents)
  - [Skills](#skills)
  - [Hooks](#hooks)
  - [Instructions](#instructions)
  - [Docs](#docs)
  - [agent-configs.json](#agent-configsjson)
- [Customization](#customization)
  - [Custom Agent](#custom-agent)
  - [Custom Skill](#custom-skill)
  - [Custom Instruction](#custom-instruction)
- [License](#license)

---

## Installation

Run directly with `npx` (no install needed):

```bash
npx @ngmthaq20/my-copilot@latest --help
```

---

## Initialization

Run in your project directory:

```bash
npx @ngmthaq20/my-copilot@latest init
```

An interactive initializer will appear. First, choose one mode:

- **Template**: pick a predefined stack.
- **Customize**: pick agents and then pick skills filtered by those agents.

In **Customize** mode:

- `technical-leader`, `debugger`, and `code-reviewer` are preselected and cannot be unselected.
- Use **Space** to toggle non-required agents/skills, and **Enter** to confirm.
- Skills are shown as a filtered multi-select list based on the selected agents.

If you choose **Template**, the template selector appears:

| Template                   | Description               |
| -------------------------- | ------------------------- |
| `all`                      | All agents and skills     |
| `web-fullstack`            | Frontend + Backend        |
| `ai-application-fullstack` | AI + Frontend + Backend   |
| `ai-backend`               | AI services + Backend     |
| `mobile-fullstack`         | Mobile + Backend          |
| `desktop-app-fullstack`    | Desktop + Backend         |
| `backend-only`             | Backend APIs only         |
| `frontend-only`            | Frontend development only |

You can also skip the interactive selector:

```bash
npx @ngmthaq20/my-copilot@latest init --template web-fullstack
```

To overwrite an existing `.github` folder (the old one is renamed to `.github-legacy-<timestamp>`):

```bash
npx @ngmthaq20/my-copilot@latest init --force
```

After running `init`, a `.github` folder is created in your project root. Open the workspace in **VS Code** with **GitHub Copilot Chat** enabled — agents, skills, instructions, and hooks are picked up automatically.

---

## What's Inside

```
.github/
├── copilot-instructions.md        # Global rules inherited by all agents
├── agent-configs.json             # Workspace-level agent configuration
├── agents/                        # Specialized agent definitions
├── skills/                        # Skill packs (frameworks, tools, languages)
├── instructions/                  # Document templates & conventions
├── hooks/                         # Automated guardrails
└── docs/
    ├── features/                  # Feature documentation
    └── plans/                     # Implementation & bugfix plans
```

---

### Agents

Role-based AI agents that follow a structured team workflow. Each agent has a defined role, model, tool access, and sub-agent delegation.

| Agent                   | Role                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| `technical-leader`      | Analyzes requirements, creates feature docs & plans, delegates work |
| `be-developer`          | Implements backend features, routes, services, DB integrations      |
| `fe-developer`          | Implements frontend features, components, state management          |
| `mobile-developer`      | Implements mobile features (Flutter, React Native)                  |
| `desktop-app-developer` | Implements desktop app features (Electron, Electron Forge)          |
| `ai-engineer`           | Implements AI/ML features (LangChain, HuggingFace, Ollama)          |
| `qa-engineer`           | Writes and runs tests, verifies implementations                     |
| `code-reviewer`         | Reviews code, tests, and DevOps configurations across stacks        |
| `devops-engineer`       | Manages infrastructure, CI/CD, Docker, Nginx, deployment            |
| `debugger`              | Diagnoses errors and creates bug-fix plans                          |

Agents are defined as `.agent.md` files inside `.github/agents/`.

---

### Skills

Reusable knowledge packs that agents load on demand. Each skill is a folder containing a `SKILL.md` index and focused sub-skill files.

| Category           | Skills                                                                      |
| ------------------ | --------------------------------------------------------------------------- |
| **Languages**      | C, C++, C#, Java, TypeScript, JavaScript, Dart, Python                      |
| **Backend**        | .NET, Spring Boot, NestJS, Express.js, Prisma, TypeORM, GraphQL, REST API   |
| **Frontend**       | React.js, Vue.js (Composition & Options API), Vite, HTML, CSS/SCSS, Linting |
| **Mobile**         | Flutter, React Native                                                       |
| **Desktop**        | Electron.js, Electron Forge                                                 |
| **AI / ML**        | LangChain, LangChain.js, HuggingFace, Ollama                                |
| **Infrastructure** | Docker, Nginx, Git, GitHub MCP                                              |
| **Databases**      | Relational DB, NoSQL (MongoDB, Redis, Cassandra, Neo4j)                     |

Skills are stored in `.github/skills/<skill-name>/`.

---

### Hooks

Automated guardrails that run as Copilot hooks at different lifecycle events:

| Hook                           | Event                                               | Description                                       |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------------- |
| **secrets-scanner**            | `sessionEnd`                                        | Scans diffs for leaked credentials and secrets    |
| **dependency-license-checker** | `sessionEnd`                                        | Flags dependencies with problematic licenses      |
| **governance-audit**           | `sessionStart`, `sessionEnd`, `userPromptSubmitted` | Enforces repo governance policies                 |
| **session-logger**             | `sessionStart`, `sessionEnd`, `userPromptSubmitted` | Logs all agent session activity                   |
| **tool-guardian**              | `preToolUse`                                        | Controls which tools each agent is allowed to use |

Hooks are stored in `.github/hooks/<hook-name>/` with a `hooks.json` config and shell scripts.

---

### Instructions

Document templates that guide agents when creating feature docs, plans, and bugfix plans:

| Instruction                            | `applyTo` Pattern        | Purpose                                              |
| -------------------------------------- | ------------------------ | ---------------------------------------------------- |
| `feature-doc-template.instructions.md` | `**/agent-feature-*.md`  | Template for feature documentation (source of truth) |
| `plan-template.instructions.md`        | `**/agent-plan-*.md`     | Template for implementation plans                    |
| `bugfix-plan-template.instructions.md` | `**/agent-plan-fix-*.md` | Template for bug-fix plans (no feature doc needed)   |

Instructions are stored in `.github/instructions/`.

---

### Docs

The `docs/` directory holds two sub-folders used by agents to organize project documentation:

- **`features/`** — Feature documents created by the technical leader. Organized by module (e.g., `features/auth/agent-feature-login-api.md`).
- **`plans/`** — Implementation and bugfix plans (e.g., `plans/agent-plan-add-user-authentication-2026-04-05-1430.md`).

---

### agent-configs.json

A workspace-level configuration file that tells agents where to find docs:

```json
{
  "features_directory": "<workspace>/.github/docs/features",
  "plans_directory": "<workspace>/.github/docs/plans"
}
```

`<workspace>` is resolved to the workspace root at runtime. Agents reference these paths when creating or reading feature docs and plans.

---

## Customization

### Custom Agent

Create a new `.agent.md` file inside `.github/agents/`:

```markdown
---
name: my-agent
model: Claude Sonnet 4.6 (copilot)
description: "Short description of the agent's role."
argument-hint: "What the user should provide, e.g., 'Implement the login feature.'"
tools: [vscode, execute, read, browser, edit, search, web, todo]
agents: ["be-developer", "fe-developer"]
---

You are a [role description].

## Role

Your job is to ...

## Rules & Responsibilities

- **ALWAYS** ...
- **DO NOT** ...

## Output Format

- ...
```

**Key fields in the YAML frontmatter:**

| Field           | Description                                       |
| --------------- | ------------------------------------------------- |
| `name`          | Unique agent identifier (used in `agents` arrays) |
| `model`         | The model to use                                  |
| `description`   | Shown in the Copilot Chat agent picker            |
| `argument-hint` | Placeholder text for the input box                |
| `tools`         | Tools the agent is allowed to use                 |
| `agents`        | Sub-agents this agent can delegate to             |

---

### Custom Skill

Create a new folder inside `.github/skills/<skill-name>/` with a `SKILL.md` entry point:

```markdown
---
name: my-skill
description: "Brief description — this text helps Copilot decide when to load the skill."
---

# My Skill Index

## Sub-Skills Reference

| Domain  | File                     | When to use                 |
| ------- | ------------------------ | --------------------------- |
| Topic A | [topic-a.md](topic-a.md) | When the user needs Topic A |
| Topic B | [topic-b.md](topic-b.md) | When the user needs Topic B |
```

Then add sub-skill files (e.g., `topic-a.md`, `topic-b.md`) in the same folder. Agents will load `SKILL.md` first and then read only the sub-skill files they need.

---

### Custom Instruction

Create a new `.instructions.md` file inside `.github/instructions/`:

````markdown
---
applyTo: "**/pattern-to-match-*.md"
---

# My Instruction Title

## When to Use

- Describe when this instruction should be applied.

## Template

\```markdown

# Title

## Section 1

...
\```
````

The `applyTo` glob pattern determines which files trigger this instruction. When an agent creates or edits a file matching the pattern, the instruction is automatically applied.

---

## License

ISC
