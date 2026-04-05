---
applyTo: "**"
---

# React.js Copilot Instructions

When working on any React.js-related task, you **MUST** load the skill files below **before** generating any response or writing any code.

## Required Skill Entry Point

Always start by reading the top-level skill index:

```
.github/skills/reactjs/SKILL.md
```

Use the **Quick Decision Guide** inside that file to determine which sub-skill file(s) to load next.

## Sub-Skill Paths

All sub-skill files are located at `.github/skills/reactjs/`. Load only the ones relevant to the current task:

| Domain                     | Path                                                 |
| -------------------------- | ---------------------------------------------------- |
| Conventions                | `.github/skills/reactjs/convention.md`               |
| Component Design           | `.github/skills/reactjs/design-component.md`         |
| Modern Hook Mastery        | `.github/skills/reactjs/modern-hook-mastery.md`      |
| State Management           | `.github/skills/reactjs/state-management.md`         |
| Routing & Navigation       | `.github/skills/reactjs/routing-navigation.md`       |
| API Integration            | `.github/skills/reactjs/api-integration.md`          |
| Form Handling & Validation | `.github/skills/reactjs/form-handling-validation.md` |
| UI & Styling               | `.github/skills/reactjs/ui-styling.md`               |
| Performance Optimization   | `.github/skills/reactjs/performance-optimization.md` |
| Mock API                   | `.github/skills/reactjs/mock-api.md`                 |
| Unit Testing & Storybook   | `.github/skills/reactjs/unit-test.md`                |

## Workflow

1. Read `.github/skills/reactjs/SKILL.md` first.
2. Identify the correct sub-skill(s) using the Quick Decision Guide.
3. Read the relevant sub-skill file(s) with `read_file`.
4. Follow the patterns and examples from those files in your response.
5. Load multiple sub-skill files when the task spans more than one domain.

## Related Skills

When the task touches areas beyond React.js core, also load the relevant entry point from these related skills:

| Skill           | Entry Point                          | When to also load                                                      |
| --------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| REST API Design | `.github/skills/restapi/SKILL.md`    | Understanding REST conventions when consuming backend APIs             |
| GraphQL         | `.github/skills/graphql/SKILL.md`    | Consuming a GraphQL API from React (queries, mutations, subscriptions) |
| TypeScript      | `.github/skills/typescript/SKILL.md` | TypeScript types, generics, utility types, or tsconfig                 |
| JavaScript      | `.github/skills/javascript/SKILL.md` | JS fundamentals, async patterns, modules, or event loop                |
| Linting         | `.github/skills/linting/SKILL.md`    | ESLint, Prettier, pre-commit hooks, or monorepo lint setup             |
| Vite            | `.github/skills/vite/SKILL.md`       | Build config, dev server, aliases, env vars, or code splitting         |
| Docker          | `.github/skills/docker/SKILL.md`     | Containerising the React app or multi-stage builds                     |
| Nginx           | `.github/skills/nginx/SKILL.md`      | Serving the built React SPA or setting up a reverse proxy              |
| Git             | `.github/skills/git/SKILL.md`        | Branching, commit conventions, hooks, or history management            |
