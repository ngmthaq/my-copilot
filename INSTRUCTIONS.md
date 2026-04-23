# Workspace Instructions

## Workspace Configuration

- **ALWAYS READ** `README.md` to get related information
- **ALWAYS READ** `Project Context` section below to get configuration values
- Use these configured values instead of hardcoded values throughout the session
- All agents and instructions reference config values as placeholders — resolve them from the config

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

## Project Context

- **project_name**: `My Copilot`
- **project_description**: `A curated collection of AI copilot customization files — agents, skills, and document templates.`
- **programming_languages**: `JavaScript`
- **frameworks**: `N/A`
- **package_managers**: `Yarn`
- **key_libraries**: `N/A`
- **database**: `N/A`
- **doc_directory**: `<workspace>/<target>/docs`

> **NOTE**:
>
> - Resolve `<workspace>` is the current workspace
> - Resolve `<target>` is the current AI platform, which could be a .github or .claude folder
