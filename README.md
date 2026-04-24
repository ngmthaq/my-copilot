# @ngmthaq20/my-copilot

A curated, ready-to-use collection of AI copilot customization files — **agents**, **skills**, and **document templates** — designed to power an AI-assisted software development workflow across backend, frontend, mobile, desktop, and AI/ML teams.

---

# Initialization

Run in your project directory:

```bash
npx @ngmthaq20/my-copilot@latest init github
```

---

## 💡 Tips for New Developers

**Always start with `@technical-leader`.** Never invoke implementation agents directly for new features — the technical-leader's plan is the source of truth that all other agents align to.

**Let the debugger diagnose before fixing.** Skipping root cause analysis leads to superficial patches. The debugger's report gives the developer the exact context needed to fix correctly.

**Onboard the codebase first.** On a new project, run `@codebase-analyst` before any implementation work. Agents without project skills will produce generic output that may not fit your conventions.

**Approve plans before execution.** The plan review step is your main control point. Read it carefully — once agents start implementing, changes require a new loop.

**Skills are living documents.** If you notice an agent making repeated mistakes about a pattern in your codebase, update the relevant SKILL.md. All agents benefit immediately.

---

## License

ISC
