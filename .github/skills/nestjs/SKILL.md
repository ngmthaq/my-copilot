---
name: nestjs
description: "Unified NestJS skill index — covers module architecture, controllers, services, dependency injection, guards & authentication, pipes, interceptors, exception filters, config management, database integration, input validation, Swagger/OpenAPI documentation, and GraphQL (resolvers, schema design, type system, subscriptions, federation, DataLoader, auth, error handling, and performance). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# NestJS Skill Index

## Overview

This index covers all NestJS skill domains. Load the specific sub-skill file that matches your task instead of this index file.

---

## Sub-Skills Reference

| Domain                         | File                                                                               | When to use                                                                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Module Architecture            | [module-architecture.md](module-architecture.md)                                   | Structuring a NestJS app; sharing providers across modules; building reusable feature, shared, or global modules; `forRoot`/`forFeature` patterns.                         |
| Controller Design              | [controller-design.md](controller-design.md)                                       | Defining REST controllers; handling HTTP requests with `@Get`/`@Post`/etc.; extracting `@Body`/`@Param`/`@Query`; building resource endpoints with DTOs.                   |
| Service Layer                  | [service-layer.md](service-layer.md)                                               | Implementing business logic; separating concerns from controllers; composing multiple repositories; managing transactions inside services.                                 |
| Dependency Injection           | [dependency-injection.md](dependency-injection.md)                                 | Registering providers; creating custom providers with `useValue`/`useFactory`/`useClass`; token-based injection; managing provider scopes.                                 |
| Config Management              | [config-management.md](config-management.md)                                       | Setting up environment config with `@nestjs/config`; loading `.env` files; accessing config in services via `ConfigService`; validating config at startup with Joi/Zod.    |
| Guards & Authentication        | [guards-authentication.md](guards-authentication.md)                               | Protecting REST endpoints with `@UseGuards`; implementing JWT auth with Passport; attaching the authenticated user to the request; role-based access control.              |
| Input Validation               | [input-validation.md](input-validation.md)                                         | Validating request bodies with `ValidationPipe` and `class-validator`; enforcing DTO schemas; using `whitelist`/`forbidNonWhitelisted`; transforming payloads.             |
| Pipes                          | [pipes-validation.md](pipes-validation.md)                                         | Parsing and transforming route params with `ParseIntPipe`/`ParseUUIDPipe`; building custom transformation pipes; sanitising inputs before they reach handlers.             |
| Interceptors & Logging         | [interceptors-logging.md](interceptors-logging.md)                                 | Transforming response shapes with `@UseInterceptors`; logging requests and responses; measuring execution time; integrating Winston or Pino.                               |
| Exception Filters              | [exception-filters.md](exception-filters.md)                                       | Formatting error responses; catching specific exceptions with `@Catch`; applying global vs. local filters; building custom HTTP error shapes.                              |
| Database Integration           | [database-integration.md](database-integration.md)                                 | Connecting a database with TypeORM, Prisma, or Mongoose; setting up repository/entity patterns; configuring database modules.                                              |
| Swagger / OpenAPI              | [swagger-implementation.md](swagger-implementation.md)                             | Documenting a REST API with `@nestjs/swagger`; adding `@ApiProperty`/`@ApiOperation`/`@ApiTags`; setting up Swagger UI; generating the OpenAPI spec.                       |
| GraphQL — Schema Design        | [graphql-schema-design.md](graphql-schema-design.md)                               | Designing GraphQL schemas with the code-first approach; using `@ObjectType`/`@Field` decorators; organizing schema types across modules; setting nullability.              |
| GraphQL — Type System          | [graphql-type-system.md](graphql-type-system.md)                                   | Defining `ObjectType`, `InputType`, enums, interfaces, unions, and custom scalars with NestJS code-first decorators; choosing type modifiers.                              |
| GraphQL — Resolvers            | [graphql-resolvers.md](graphql-resolvers.md)                                       | Implementing resolver logic with `@Resolver`/`@ResolveField`/`@Parent`; accessing GraphQL context; organizing resolvers by module with dependency injection.               |
| GraphQL — Queries & Mutations  | [graphql-queries-mutations.md](graphql-queries-mutations.md)                       | Defining `@Query` and `@Mutation` operations; using `@Args` decorators; structuring input types and return types in NestJS resolvers.                                      |
| GraphQL — Subscriptions        | [graphql-subscriptions.md](graphql-subscriptions.md)                               | Implementing real-time features with `@Subscription`; setting up PubSub (in-memory and Redis); filtering events; publishing from mutations; WebSocket auth.                |
| GraphQL — Auth & Authorization | [graphql-authentication-authorization.md](graphql-authentication-authorization.md) | Protecting GraphQL resolvers with `@UseGuards`/`GqlAuthGuard`; implementing JWT login; roles decorator; `@CurrentUser` context extraction.                                 |
| GraphQL — DataLoader           | [graphql-dataloader-pattern.md](graphql-dataloader-pattern.md)                     | Solving N+1 queries with `nestjs-dataloader`; per-request scoping; batch functions; integrating DataLoader with `@ResolveField`.                                           |
| GraphQL — Error Handling       | [graphql-error-handling.md](graphql-error-handling.md)                             | Handling errors in GraphQL resolvers; using exception filters with `GraphQLError`; formatting error responses; validating inputs with pipes.                               |
| GraphQL — Performance          | [graphql-performance-optimization.md](graphql-performance-optimization.md)         | Optimising slow GraphQL queries; limiting abuse with query complexity and depth limits; implementing response caching; persisted queries; monitoring resolver performance. |
| GraphQL — Federation           | [graphql-schema-stitching-federation.md](graphql-schema-stitching-federation.md)   | Composing multiple NestJS GraphQL services with Apollo Federation; setting up subgraphs; extending types across services; configuring the Apollo Router or NestJS gateway. |

---

## Quick Decision Guide

```
What are you working on?
│
├── App structure / wiring
│   ├── Organising feature modules, shared modules → module-architecture.md
│   ├── Registering services / custom providers → dependency-injection.md
│   └── Loading env vars / config validation → config-management.md
│
├── REST API
│   ├── HTTP endpoints / route handlers → controller-design.md
│   ├── Business logic / repositories → service-layer.md
│   ├── Validating request body / DTO → input-validation.md
│   ├── Parsing / transforming params → pipes-validation.md
│   ├── Response transformation / logging → interceptors-logging.md
│   ├── Error formatting / exception handling → exception-filters.md
│   ├── Protecting routes / JWT auth → guards-authentication.md
│   ├── Database connection / ORM setup → database-integration.md
│   └── API docs / Swagger UI → swagger-implementation.md
│
└── GraphQL API
    ├── Schema types / ObjectType / InputType → graphql-type-system.md
    ├── Schema structure / modules / nullability → graphql-schema-design.md
    ├── @Resolver / @ResolveField / @Parent → graphql-resolvers.md
    ├── @Query / @Mutation / @Args → graphql-queries-mutations.md
    ├── Real-time / subscriptions / PubSub → graphql-subscriptions.md
    ├── Auth / guards on resolvers → graphql-authentication-authorization.md
    ├── N+1 / batching / DataLoader → graphql-dataloader-pattern.md
    ├── Error handling / GraphQLError → graphql-error-handling.md
    ├── Complexity / caching / monitoring → graphql-performance-optimization.md
    └── Multi-service / federation / subgraphs → graphql-schema-stitching-federation.md
```

---

## How to Use

1. **Identify the goal** — use the Quick Decision Guide above to determine which sub-skill applies to the task.
2. **Load the sub-skill file** — read the specific `.md` file (e.g. `guards-authentication.md`) before generating any code.
3. **Follow its patterns** — each sub-skill file contains code patterns, conventions, and best practices specific to that domain; apply them exactly.
4. **Load multiple sub-skills when the task spans domains** — for example, a feature that adds a guarded REST endpoint with Swagger docs should load both `guards-authentication.md` and `swagger-implementation.md`.
