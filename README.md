# @ngmthaq20/my-copilot

A curated, ready-to-use collection of AI copilot customization files — **agents**, **skills**, and **document templates** — designed to power an AI-assisted software development workflow across backend, frontend, mobile, desktop, and AI/ML teams.

Supports both **GitHub Copilot** (`.github/`) and **Claude Code** (`.claude/`). Drop it into any project and get a fully structured AI team out of the box.

## Installation

Run directly with `npx` (no install needed):

```bash
npx @ngmthaq20/my-copilot@latest init
```

---

## Initialization

Run in your project directory:

```bash
npx @ngmthaq20/my-copilot@latest init
```

An interactive initializer will appear asking you to select the target platform. All agents and skills are copied automatically.

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
    └── <datetime>-agent-*         # Feature docs & bugfix plans (flat)
```

**Claude Code target (`.claude/`):**

```
.claude/
├── CLAUDE.md                      # Global rules inherited by all agents
├── agent-configs.json             # Workspace-level agent configuration
├── agents/                        # Specialized agent definitions
├── skills/                        # Skill packs (frameworks, tools, languages)
└── docs/
    └── <datetime>-agent-*         # Feature docs & bugfix plans (flat)
```

---

### Agents

Role-based AI agents that follow a structured team workflow. Each agent has a defined role, model, tool access, and sub-agent delegation.

Agents are defined as `.agent.md` files inside the `agents/` folder of your chosen target (`.github/agents/` or `.claude/agents/`).

---

### Skills

Reusable knowledge packs that agents load on demand. Each skill is a folder containing a `SKILL.md` index and focused sub-skill files.

Skills are stored in `<target>/skills/<skill-name>/`.

---

### Docs

The `docs/` directory is the single root used by agents to store all project documentation:

- **`<datetime>-agent-feature-*`** — Feature documents created by the technical leader (e.g., `docs/20260405-1430-agent-feature-login-api.md`).
- **`<datetime>-agent-plan-fix-*`** — Bugfix plans created from debugger RCAs (e.g., `docs/20260405-1715-agent-plan-fix-cors-in-user-creation-form.md`).

---

### agent-configs.json

A workspace-level configuration file that tells agents where to find docs:

```json
{
  "doc_directory": "<workspace>/<target>/docs"
}
```

`<workspace>` is resolved to the workspace root at runtime. `<target>` is replaced with `.github` or `.claude` during `init`. Agents reference this path when creating or reading feature docs and bugfix plans.

---

## License

ISC
