# @ngmthaq20/my-copilot

A curated, ready-to-use collection of AI copilot customization files — **agents**, **skills**, and **document templates** — designed to power an AI-assisted software development workflow across backend, frontend, mobile, desktop, and AI/ML teams.

Supports both **GitHub Copilot** (`.github/`) and **Claude Code** (`.claude/`). Drop it into any project and get a fully structured AI team out of the box.

---

## Table of Contents

- [Installation](#installation)
- [Initialization](#initialization)
- [What's Inside](#whats-inside)
  - [Agents](#agents)
  - [Skills](#skills)
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

An interactive initializer will appear:

- `technical-leader`, `debugger`, and `code-reviewer` are preselected and cannot be unselected.
- Use **Space** to toggle non-required agents/skills, and **Enter** to confirm.
- Skills are shown as a filtered multi-select list based on the selected agents.

To overwrite an existing folder (the old one is renamed to `<target>-legacy-<timestamp>`):

```bash
npx @ngmthaq20/my-copilot@latest init --force
```

After running `init`, a `.github` or `.claude` folder is created in your project root depending on the target you selected:

- **`.github`** — Open the workspace in **VS Code** with **GitHub Copilot Chat** enabled. Agents, skills are picked up automatically.
- **`.claude`** — Open the workspace with **Claude Code**. Agents, skills, are picked up automatically.

---

## What's Inside

**GitHub Copilot target (`.github/`):**

```
.github/
├── copilot-instructions.md        # Global rules inherited by all agents
├── agent-configs.json             # Workspace-level agent configuration
├── agents/                        # Specialized agent definitions
├── skills/                        # Skill packs (frameworks, tools, languages)
└── docs/
    ├── features/                  # Feature documentation
    ├── plans/                     # Implementation & bugfix plans
    └── crawled-contents/          # Cached web page content from crawler
```

**Claude Code target (`.claude/`):**

```
.claude/
├── CLAUDE.md                      # Global rules inherited by all agents
├── agent-configs.json             # Workspace-level agent configuration
├── agents/                        # Specialized agent definitions
├── skills/                        # Skill packs (frameworks, tools, languages)
└── docs/
    ├── features/                  # Feature documentation
    ├── plans/                     # Implementation & bugfix plans
    └── crawled-contents/          # Cached web page content from crawler
```

---

### Agents

Role-based AI agents that follow a structured team workflow. Each agent has a defined role, model, tool access, and sub-agent delegation.

| Agent                   | Role                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| `technical-leader`      | Analyzes requirements, creates feature docs & plans, delegates work |
| `be-developer`          | Implements backend features, routes, services, DB integrations      |
| `fe-developer`          | Implements frontend features, components, state management          |
| `mobile-developer`      | Implements mobile features                                          |
| `desktop-app-developer` | Implements desktop app features                                     |
| `ai-engineer`           | Implements AI/ML features                                           |
| `qa-engineer`           | Writes and runs tests, verifies implementations                     |
| `code-reviewer`         | Reviews code, tests, and DevOps configurations across stacks        |
| `devops-engineer`       | Manages infrastructure, CI/CD, Docker, Nginx, deployment            |
| `debugger`              | Diagnoses errors and creates bug-fix plans                          |

Agents are defined as `.agent.md` files inside the `agents/` folder of your chosen target (`.github/agents/` or `.claude/agents/`).

---

### Skills

Reusable knowledge packs that agents load on demand. Each skill is a folder containing a `SKILL.md` index and focused sub-skill files.

Skills are stored in `<target>/skills/<skill-name>/`.

---

### Docs

The `docs/` directory holds three sub-folders used by agents to organize project documentation:

- **`features/`** — Feature documents created by the technical leader. Organized by module (e.g., `features/auth/agent-feature-login-api.md`).
- **`plans/`** — Implementation and bugfix plans (e.g., `plans/agent-plan-add-user-authentication-2026-04-05-1430.md`).
- **`crawled-contents/`** — Cached web page content extracted by the page-content-crawler skill.

---

### agent-configs.json

A workspace-level configuration file that tells agents where to find docs:

```json
{
  "features_directory": "<workspace>/<target>/docs/features",
  "plans_directory": "<workspace>/<target>/docs/plans",
  "crawled_contents_directory": "<workspace>/<target>/docs/crawled-contents"
}
```

`<workspace>` is resolved to the workspace root at runtime. `<target>` is replaced with `.github` or `.claude` during `init`. Agents reference these paths when creating or reading feature docs and plans.

---

## Customization

### Custom Agent

Create a new `.agent.md` file inside your target's `agents/` folder (`.github/agents/` or `.claude/agents/`):

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

Create a new folder inside your target's `skills/` folder (`.github/skills/<skill-name>/` or `.claude/skills/<skill-name>/`) with a `SKILL.md` entry point:

```markdown
---
name: my-skill
description: "Brief description — this text helps Copilot decide when to load the skill."
---

# My Skill

## Purpose

## When to Use

## Constraints

## Table of Contents

## Accessing Reference Content

## Best Practices

## Anti-Patterns
```

---

## License

ISC
