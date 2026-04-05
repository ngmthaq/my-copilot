---
applyTo: "**"
---

# Express.js Copilot Instructions

When working on any Express.js-related task, you **MUST** load the skill files below **before** generating any response or writing any code.

## Required Skill Entry Point

Always start by reading the top-level skill index:

```
.github/skills/expressjs/SKILL.md
```

Use the **Quick Decision Guide** inside that file to determine which sub-skill file(s) to load next.

## Sub-Skill Paths

All sub-skill files are located at `.github/skills/expressjs/`. Load only the ones relevant to the current task:

| Domain                         | Path                                                       |
| ------------------------------ | ---------------------------------------------------------- |
| API Security                   | `.github/skills/expressjs/api-security.md`                 |
| Authentication & Authorization | `.github/skills/expressjs/authentication-authorization.md` |
| Database Integration (Prisma)  | `.github/skills/expressjs/database-integration.md`         |
| Environment Configuration      | `.github/skills/expressjs/env-configuration.md`            |
| Error Handling                 | `.github/skills/expressjs/error-handling.md`               |
| Input Validation (Zod)         | `.github/skills/expressjs/input-validation.md`             |
| Logging & Monitoring (Pino)    | `.github/skills/expressjs/logging-monitoring.md`           |
| Middleware Architecture        | `.github/skills/expressjs/middleware-architecture.md`      |
| Modular Architecture           | `.github/skills/expressjs/modular-architecture.md`         |
| REST API Design                | `.github/skills/expressjs/rest-api-design.md`              |
| Swagger / OpenAPI              | `.github/skills/expressjs/swagger-implementation.md`       |

## Workflow

1. Read `.github/skills/expressjs/SKILL.md` first.
2. Identify the correct sub-skill(s) using the Quick Decision Guide.
3. Read the relevant sub-skill file(s) with `read_file`.
4. Follow the patterns and examples from those files in your response.
5. Load multiple sub-skill files when the task spans more than one domain.

## Related Skills

When the task touches areas beyond Express.js core, also load the relevant entry point from these related skills:

| Skill           | Entry Point                                   | When to also load                                                   |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| REST API Design | `.github/skills/restapi/SKILL.md`             | Designing resource URLs, HTTP methods, status codes, pagination     |
| GraphQL         | `.github/skills/graphql/SKILL.md`             | Building a GraphQL API on top of Express                            |
| Prisma          | `.github/skills/prisma/SKILL.md`              | Database access via Prisma ORM                                      |
| TypeORM         | `.github/skills/typeorm/SKILL.md`             | Database access via TypeORM                                         |
| Relational DB   | `.github/skills/relational-database/SKILL.md` | Raw SQL, schema design, indexing, transactions                      |
| NoSQL           | `.github/skills/nosql/SKILL.md`               | MongoDB, Redis, or other NoSQL databases                            |
| TypeScript      | `.github/skills/typescript/SKILL.md`          | TypeScript types, generics, tsconfig, or decorators                 |
| JavaScript      | `.github/skills/javascript/SKILL.md`          | JS fundamentals, async patterns, modules, or functional programming |
| Linting         | `.github/skills/linting/SKILL.md`             | ESLint, Prettier, pre-commit hooks, or monorepo lint setup          |
| Docker          | `.github/skills/docker/SKILL.md`              | Containerising the Express app, Docker Compose, or deployment       |
| Nginx           | `.github/skills/nginx/SKILL.md`               | Reverse proxy, SSL/TLS, or serving the app behind Nginx             |
| Git             | `.github/skills/git/SKILL.md`                 | Branching, commit conventions, hooks, or history management         |
