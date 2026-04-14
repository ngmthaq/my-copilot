---
name: dotnet
description: "Unified .NET skill index - covers architecture, controllers, services, validation, exception handling, middleware logging, Swagger, data access, DI, config, auth, observability, testing, worker services, Blazor UI, GraphQL, build, and deployment."
argument-hint: "Describe your .NET goal, stack (API/worker/app), and constraints"
---

# .NET Skill Index

## Purpose

Use this skill as the entry point for end-to-end .NET work. It helps choose the right local sub-skill(s), apply a repeatable implementation workflow, and validate production readiness.

## Sub-Skills Reference

| Domain                                   | File                                                                               | When to use                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Convention                               | [convention.md](convention.md)                                                     | Naming projects/files, folder organization, and consistent .NET solution structure      |
| Module Architecture                      | [module-architecture.md](module-architecture.md)                                   | Splitting features into clean modules/layers and defining boundaries                    |
| ASP.NET Core API                         | [aspnet-core-api.md](aspnet-core-api.md)                                           | Designing endpoints, validation, status codes, minimal APIs, and controller conventions |
| Controller Design                        | [controller-design.md](controller-design.md)                                       | Designing controller actions, route contracts, and API behavior consistency             |
| Service Layer                            | [service-layer.md](service-layer.md)                                               | Structuring business logic and orchestration outside HTTP handlers                      |
| Input Validation                         | [input-validation.md](input-validation.md)                                         | Request payload/parameter validation and predictable validation errors                  |
| Exception Handling and Filters           | [exception-handling-filters.md](exception-handling-filters.md)                     | Global exception mapping and consistent problem response payloads                       |
| Middleware and Logging                   | [middleware-logging.md](middleware-logging.md)                                     | Request pipeline concerns: correlation IDs, logging, latency tracking                   |
| Swagger and OpenAPI                      | [swagger-openapi.md](swagger-openapi.md)                                           | API docs generation, endpoint metadata, and contract discoverability                    |
| Build System                             | [build-system.md](build-system.md)                                                 | Restore/build/test/publish workflows, NuGet strategy, CI-safe build settings            |
| EF Core Data Access                      | [data-access-efcore.md](data-access-efcore.md)                                     | DbContext design, migrations, query shaping, transactions, and consistency              |
| Dependency Injection                     | [dependency-injection.md](dependency-injection.md)                                 | Service registration, lifetimes, composition root, and boundary wiring                  |
| Configuration and Options                | [configuration-options.md](configuration-options.md)                               | appsettings layering, options binding, validation, and secrets handling                 |
| Authentication and Authorization         | [authentication-authorization.md](authentication-authorization.md)                 | JWT/cookie auth, policy-based authorization, role/claim checks                          |
| GraphQL Schema Design                    | [graphql-schema-design.md](graphql-schema-design.md)                               | Designing schema-first boundaries and code-first GraphQL types in .NET                  |
| GraphQL Type System                      | [graphql-type-system.md](graphql-type-system.md)                                   | Scalars, enums, interfaces, unions, input/payload modeling                              |
| GraphQL Resolvers                        | [graphql-resolvers.md](graphql-resolvers.md)                                       | Query/mutation/subscription resolver patterns with thin orchestration                   |
| GraphQL Queries and Mutations            | [graphql-queries-mutations.md](graphql-queries-mutations.md)                       | Designing query/mutation contracts, pagination, filtering, and payloads                 |
| GraphQL Subscriptions                    | [graphql-subscriptions.md](graphql-subscriptions.md)                               | Real-time event delivery, topic routing, and subscription safety                        |
| GraphQL Authentication and Authorization | [graphql-authentication-authorization.md](graphql-authentication-authorization.md) | Endpoint-level GraphQL auth rules, claim/policy enforcement                             |
| GraphQL DataLoader Pattern               | [graphql-dataloader-pattern.md](graphql-dataloader-pattern.md)                     | Solving N+1 issues with batched and cached request-scoped loading                       |
| GraphQL Error Handling                   | [graphql-error-handling.md](graphql-error-handling.md)                             | Consistent GraphQL error extensions and client-safe failures                            |
| GraphQL Performance Optimization         | [graphql-performance-optimization.md](graphql-performance-optimization.md)         | Complexity limits, projection, caching, and resolver performance                        |
| GraphQL Federation                       | [graphql-federation.md](graphql-federation.md)                                     | Multi-service schema composition and federated boundary design                          |
| Observability                            | [observability.md](observability.md)                                               | Structured logging, tracing, metrics, health checks, and diagnostics                    |
| Testing                                  | [testing.md](testing.md)                                                           | Unit/integration API testing, test pyramid, and deterministic test setup                |
| Worker Services                          | [worker-services.md](worker-services.md)                                           | Background processing, scheduled jobs, queue consumers, graceful shutdown               |
| Blazor UI                                | [blazor-ui.md](blazor-ui.md)                                                       | Building Razor components, state flow, form validation, and UI composition              |
| Deployment                               | [deployment.md](deployment.md)                                                     | Containerization, runtime hardening, config handoff, and release checks                 |

## Decision Flow

```text
What are you implementing?
|
|- Language-level or architecture issue (types, nullability, async, OOP)
|  -> Pair this skill with ../csharp/SKILL.md
|
|- Project structure, boundaries, and naming consistency
|  -> Start with module-architecture.md
|  -> Pair with convention.md and dependency-injection.md
|
|- HTTP API endpoint, request/response contract, status code behavior
|  -> Start with controller-design.md or aspnet-core-api.md
|  -> Pair with input-validation.md, exception-handling-filters.md, and swagger-openapi.md
|
|- Data persistence, constraints, schema or query consistency
|  -> Start with data-access-efcore.md
|  -> Pair with dependency-injection.md
|
|- GraphQL API implementation or tuning
|  -> Start with graphql-schema-design.md and graphql-resolvers.md
|  -> Pair with graphql-dataloader-pattern.md and graphql-error-handling.md
|
|- Cross-cutting request pipeline behavior (logs, correlation, timing)
|  -> Start with middleware-logging.md
|  -> Pair with observability.md
|
|- Build/release/packaging pipeline, publish output, deployment image
|  -> Start with build-system.md
|  -> Pair with deployment.md
|
|- Performance or reliability concern in production path
|  -> Start with observability.md
|  -> Pair with testing.md
|
|- App bootstrapping or config management concerns
|  -> Start with configuration-options.md
|  -> Pair with dependency-injection.md
|
|- Hosted background processing or queue consumers
|  -> Start with worker-services.md
|  -> Pair with observability.md and deployment.md
|
|- Component-based .NET frontend work
|  -> Start with blazor-ui.md
|  -> Pair with authentication-authorization.md and input-validation.md
```

## Standard Workflow

1. Define the target outcome.
2. Choose one primary sub-skill from the Decision Flow.
3. Add 1-2 supporting sub-skills for cross-cutting concerns (auth, observability, deployment).
4. Implement in small, verifiable increments.
5. Run local validation (`restore`, `build`, `test`, and app-specific checks).
6. Review against quality gates before finalizing.

## Quality Gates

- Build succeeds without new warnings that indicate correctness risk.
- Tests cover changed behavior and pass locally.
- Error paths return consistent, actionable outputs.
- Data updates respect schema constraints and transactional safety.
- Logging/diagnostics are useful but do not leak sensitive data.
- Packaging/deployment artifact is reproducible for the target environment.

## Related Skills

Use these when your task crosses technology boundaries:

- [../csharp/SKILL.md](../csharp/SKILL.md) for language-level implementation details.
- [../restapi/SKILL.md](../restapi/SKILL.md) for HTTP semantics outside .NET specifics.
- [../docker/SKILL.md](../docker/SKILL.md) for advanced container workflows.
- [../relational-database/SKILL.md](../relational-database/SKILL.md) for vendor-specific SQL design.

## Example Prompts

- "Use the dotnet skill to add a new authenticated ASP.NET endpoint with validation and tests."
- "Use the dotnet skill to diagnose a failing .NET build and propose the minimal fix."
- "Use the dotnet skill to prepare a .NET service for containerized deployment with CI checks."

## Completion Criteria

This skill is complete when the selected sub-skills were used, required validations were executed, and the change passes all applicable quality gates.
