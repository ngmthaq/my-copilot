---
name: scan-js-codebase
description: >
  Scans a Node.js project (JavaScript or TypeScript) to build a compact
  knowledge graph of file dependencies and exported symbols, storing it in
  the project's agent folder (.claude, .github, or .cursor) for use by
  GitHub Copilot, Claude Code, or any AI agent.
---

# scan-js-codebase

Builds and queries a compact knowledge graph for Node.js projects (JS or TS).
Scripts live inside this skill folder — **never copy them to the project**.
Run them directly with their full path. Output is stored in the project's
agent folder (`.claude/`, `.github/`, or `.cursor/`).

## When to Use

Use this skill whenever the user mentions: scanning a codebase, building a
dependency graph, understanding file relationships, finding where a symbol
is defined, impact analysis ("what breaks if I change X"), onboarding to a
new project, or setting up context for GitHub Copilot or Claude Code or any AI agent.
Trigger even if the user phrases it casually ("map out my project", "show me what
imports what", "help my AI understand my code").

## Skill scripts location

When this skill is loaded, its scripts are at:

```
SKILL_DIR/scripts/build-graph.js
SKILL_DIR/scripts/query-graph.js
```

`SKILL_DIR` is the directory containing this SKILL.md file. Claude must
resolve it at runtime from the actual path of this file and substitute it
into every command below before running or presenting them to the user.

---

## Step 1 — Check madge is available

```bash
# Prefer a local project install
npm install --save-dev madge

# Or global
npm install -g madge
```

---

## Step 2 — Build the knowledge graph

Run `build-graph.js` from the **project root**
(so madge finds `node_modules/.bin/madge` and relative paths resolve correctly):

```bash
# TypeScript project → store in .github/
node SKILL_DIR/scripts/build-graph.js \
  --src ./src \
  --tsconfig tsconfig.json \
  --out .github/knowledge-graph.json

# JavaScript project → store in .github/
node SKILL_DIR/scripts/build-graph.js \
  --src ./src \
  --out .github/knowledge-graph.json

# Custom output path
node SKILL_DIR/scripts/build-graph.js \
  --src ./src \
  --tsconfig tsconfig.app.json \
  --out .claude/knowledge-graph.json
```

### Flags

| Flag           | Default         | Description                                 |
| -------------- | --------------- | ------------------------------------------- |
| `--src`        | `src`           | Source directory to scan                    |
| `--tsconfig`   | _(none)_        | Path to tsconfig — required for TS projects |
| `--extensions` | `ts,tsx,js,jsx` | File extensions to include                  |
| `--out`        | _(none)_        | Explicit output path                        |

The output directory is created automatically if it does not exist.

### Output format

```jsonc
{
  "meta": { "generatedAt": "...", "totalFiles": 142, "totalEdges": 389 },
  "files": { "0": "src/main.tsx", "1": "src/App.tsx" },
  "nodes": [{ "id": 1, "exports": ["App", "default"] }],
  "edges": [{ "from": 1, "to": 5 }],
  "importedBy": { "5": [1, 3, 9] },
}
```

---

## Step 3 — Query the graph

Run `query-graph.js` from anywhere — point `--graph` at the file written in Step 2:

```bash
# Context for a specific file
node SKILL_DIR/scripts/query-graph.js \
  --graph .github/knowledge-graph.json \
  --file src/App.tsx

# 2 hops out
node SKILL_DIR/scripts/query-graph.js \
  --graph .github/knowledge-graph.json \
  --file src/App.tsx --depth 2

# Find which file defines a symbol
node SKILL_DIR/scripts/query-graph.js \
  --graph .claude/knowledge-graph.json \
  --symbol useAuth

# Print summary
node SKILL_DIR/scripts/query-graph.js \
  --graph .claude/knowledge-graph.json
```

### Flags

| Flag       | Default                | Description                      |
| ---------- | ---------------------- | -------------------------------- |
| `--graph`  | `knowledge-graph.json` | Path to the knowledge graph file |
| `--file`   | _(none)_               | Query by file path               |
| `--symbol` | _(none)_               | Query by exported symbol name    |
| `--depth`  | `1`                    | Hops to include in subgraph      |

---

## Example using with AI agents

### GitHub Copilot Chat

Paste the query output directly into chat before your request:

```
Here is the dependency context for src/App.tsx:
[paste output of query-graph.js command above]

Refactor App.tsx to lazy-load the Dashboard component.
```

### Claude Code

Add to `.claude/settings.json` so Claude Code fetches context automatically:

```json
{
  "tools": [
    {
      "name": "get_file_context",
      "command": "node SKILL_DIR/scripts/query-graph.js --graph .claude/knowledge-graph.json --file {file}",
      "description": "Returns imports, dependents, and exports for a source file"
    }
  ]
}
```

Replace `SKILL_DIR` with the actual absolute path to the skill folder.

---

## Rebuilding the graph

Run `node SKILL_DIR/scripts/build-graph.js --src src --tsconfig tsconfig.json --out AGENT_FOLDER/knowledge-graph.json`
whenever files change significantly.

Replace `SKILL_DIR` with the actual absolute path to the skill folder.
Replace `AGENT_FOLDER` with the actual agent folder in the project (`.claude`, `.github`, or `.cursor`).
