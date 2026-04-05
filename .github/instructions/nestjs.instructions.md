---
applyTo: "**"
---

# NestJS Copilot Instructions

When working on any NestJS-related task, you **MUST** load the skill files below **before** generating any response or writing any code.

## Required Skill Entry Point

Always start by reading the top-level skill index:

```
.github/skills/nestjs/SKILL.md
```

Use the **Quick Decision Guide** inside that file to determine which sub-skill file(s) to load next.

## Sub-Skill Paths

All sub-skill files are located at `.github/skills/nestjs/`. Load only the ones relevant to the current task:

| Domain                         | Path                                                            |
| ------------------------------ | --------------------------------------------------------------- |
| Module Architecture            | `.github/skills/nestjs/module-architecture.md`                  |
| Controller Design              | `.github/skills/nestjs/controller-design.md`                    |
| Service Layer                  | `.github/skills/nestjs/service-layer.md`                        |
| Dependency Injection           | `.github/skills/nestjs/dependency-injection.md`                 |
| Config Management              | `.github/skills/nestjs/config-management.md`                    |
| Guards & Authentication        | `.github/skills/nestjs/guards-authentication.md`                |
| Input Validation               | `.github/skills/nestjs/input-validation.md`                     |
| Pipes                          | `.github/skills/nestjs/pipes-validation.md`                     |
| Interceptors & Logging         | `.github/skills/nestjs/interceptors-logging.md`                 |
| Exception Filters              | `.github/skills/nestjs/exception-filters.md`                    |
| Database Integration           | `.github/skills/nestjs/database-integration.md`                 |
| Swagger / OpenAPI              | `.github/skills/nestjs/swagger-implementation.md`               |
| GraphQL — Schema Design        | `.github/skills/nestjs/graphql-schema-design.md`                |
| GraphQL — Type System          | `.github/skills/nestjs/graphql-type-system.md`                  |
| GraphQL — Resolvers            | `.github/skills/nestjs/graphql-resolvers.md`                    |
| GraphQL — Queries & Mutations  | `.github/skills/nestjs/graphql-queries-mutations.md`            |
| GraphQL — Subscriptions        | `.github/skills/nestjs/graphql-subscriptions.md`                |
| GraphQL — Auth & Authorization | `.github/skills/nestjs/graphql-authentication-authorization.md` |
| GraphQL — DataLoader           | `.github/skills/nestjs/graphql-dataloader-pattern.md`           |
| GraphQL — Error Handling       | `.github/skills/nestjs/graphql-error-handling.md`               |
| GraphQL — Performance          | `.github/skills/nestjs/graphql-performance-optimization.md`     |
| GraphQL — Federation           | `.github/skills/nestjs/graphql-schema-stitching-federation.md`  |

## Workflow

1. Read `.github/skills/nestjs/SKILL.md` first.
2. Identify the correct sub-skill(s) using the Quick Decision Guide.
3. Read the relevant sub-skill file(s) with `read_file`.
4. Follow the patterns and examples from those files in your response.
5. Load multiple sub-skill files when the task spans more than one domain.

## Related Skills

When the task touches areas beyond NestJS core, also load the relevant entry point from these related skills:

| Skill           | Entry Point                                   | When to also load                                                    |
| --------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| REST API Design | `.github/skills/restapi/SKILL.md`             | Designing resource URLs, HTTP methods, status codes, pagination      |
| GraphQL         | `.github/skills/graphql/SKILL.md`             | GraphQL schema design, resolvers, subscriptions outside NestJS scope |
| Prisma          | `.github/skills/prisma/SKILL.md`              | Database access via Prisma ORM                                       |
| TypeORM         | `.github/skills/typeorm/SKILL.md`             | Database access via TypeORM (common NestJS pairing)                  |
| Relational DB   | `.github/skills/relational-database/SKILL.md` | Raw SQL, schema design, indexing, transactions                       |
| NoSQL           | `.github/skills/nosql/SKILL.md`               | MongoDB, Redis, or other NoSQL databases                             |
| TypeScript      | `.github/skills/typescript/SKILL.md`          | TypeScript types, generics, decorators, or tsconfig                  |
| JavaScript      | `.github/skills/javascript/SKILL.md`          | JS fundamentals, async patterns, or modules                          |
| Linting         | `.github/skills/linting/SKILL.md`             | ESLint, Prettier, pre-commit hooks, or monorepo lint setup           |
| Docker          | `.github/skills/docker/SKILL.md`              | Containerising the NestJS app, Docker Compose, or deployment         |
| Nginx           | `.github/skills/nginx/SKILL.md`               | Reverse proxy, SSL/TLS, or serving the app behind Nginx              |
| Git             | `.github/skills/git/SKILL.md`                 | Branching, commit conventions, hooks, or history management          |
