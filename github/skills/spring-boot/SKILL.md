---
name: spring-boot
description: "Unified Spring Boot skill index - covers auto-configuration, dependency injection and bean lifecycle, REST controllers and request validation, JPA/Hibernate persistence patterns, authentication, exception handling, Spring Security authorization, caching and rate limiting, microservices messaging, observability, testing, Swagger/OpenAPI documentation, and GraphQL (schema design, type system, resolvers, queries/mutations, subscriptions, auth, DataLoader, error handling, performance, and federation). Use this as the entry point; it delegates to focused sub-skill files for each domain."
---

# Spring Boot Skill Index

## Sub-Skills Reference

| Domain                           | File                                                                               | When to use                                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto-Configuration               | [auto-configuration.md](auto-configuration.md)                                     | Configuring Spring Boot startup behavior, property binding, profiles, conditional beans, custom starters, and overriding auto-config safely  |
| Dependency Injection             | [dependency-injection.md](dependency-injection.md)                                 | Designing services/components with constructor injection, bean scopes, lifecycle hooks, qualifiers, and testing with injected dependencies   |
| Input Validation                 | [input-validation.md](input-validation.md)                                         | Enforcing request and argument validation with Bean Validation, custom constraints, nested validation, and consistent error payloads         |
| Exception Handling               | [exception-handling.md](exception-handling.md)                                     | Centralizing error mapping with `@RestControllerAdvice`, Problem Details, and stable API error contracts                                     |
| Authentication                   | [authentication.md](authentication.md)                                             | Implementing login flows, JWT/session authentication, credential validation, and secure token lifecycle handling                             |
| REST Controllers                 | [rest-controllers.md](rest-controllers.md)                                         | Building REST APIs using `@RestController`, request/response DTOs, validation, global exception handling, and API versioning                 |
| JPA and Hibernate                | [jpa-hibernate.md](jpa-hibernate.md)                                               | Modeling entities/relations, repositories, transactional service patterns, lazy loading, fetch tuning, and migration-safe persistence design |
| Security                         | [security.md](security.md)                                                         | Implementing authentication and authorization with Spring Security, JWT/session flows, method security, CSRF/CORS, and secure defaults       |
| Caching and Rate Limiting        | [caching-rate-limiting.md](caching-rate-limiting.md)                               | Reducing read load with cache patterns and protecting sensitive endpoints from abuse with request throttling                                 |
| Microservices Messaging          | [microservices-messaging.md](microservices-messaging.md)                           | Building event-driven flows over Kafka/RabbitMQ with idempotent consumers, retries, DLQ, and schema-safe contracts                           |
| Observability                    | [observability.md](observability.md)                                               | Adding production diagnostics with structured logging, metrics, tracing, and health/readiness endpoints                                      |
| Testing                          | [testing.md](testing.md)                                                           | Building balanced test coverage with unit, slice, integration, Testcontainers, and security-focused tests                                    |
| Swagger and OpenAPI              | [swagger-openapi.md](swagger-openapi.md)                                           | Documenting REST APIs with springdoc, endpoint annotations, grouped docs, and controlled exposure                                            |
| GraphQL - Schema Design          | [graphql-schema-design.md](graphql-schema-design.md)                               | Designing GraphQL contracts with clear boundaries, nullability, and schema evolution guidance                                                |
| GraphQL - Type System            | [graphql-type-system.md](graphql-type-system.md)                                   | Modeling GraphQL object/input types, enums, custom scalars, interfaces, and unions                                                           |
| GraphQL - Resolvers              | [graphql-resolvers.md](graphql-resolvers.md)                                       | Implementing query/mutation/field resolvers with thin orchestration and service-layer delegation                                             |
| GraphQL - Queries and Mutations  | [graphql-queries-mutations.md](graphql-queries-mutations.md)                       | Designing query/mutation contracts, payloads, and validation-safe mutation workflows                                                         |
| GraphQL - Subscriptions          | [graphql-subscriptions.md](graphql-subscriptions.md)                               | Building real-time GraphQL event streams with scoped delivery and reliability patterns                                                       |
| GraphQL - Auth and Authorization | [graphql-authentication-authorization.md](graphql-authentication-authorization.md) | Securing GraphQL operations with endpoint, method, and row-level authorization checks                                                        |
| GraphQL - DataLoader             | [graphql-dataloader-pattern.md](graphql-dataloader-pattern.md)                     | Preventing N+1 by using request-scoped batching and caching for nested field resolution                                                      |
| GraphQL - Error Handling         | [graphql-error-handling.md](graphql-error-handling.md)                             | Standardizing GraphQL error mapping, extension codes, and client-safe failure responses                                                      |
| GraphQL - Performance            | [graphql-performance-optimization.md](graphql-performance-optimization.md)         | Optimizing resolver performance with complexity limits, batching, caching, and profiling                                                     |
| GraphQL - Federation             | [graphql-federation.md](graphql-federation.md)                                     | Designing federated subgraph boundaries, ownership, keys, and composed schema evolution                                                      |

---

## Quick Decision Guide

```
What are you trying to do?
|
|- Control Spring Boot startup behavior, profiles, or app properties
|  -> auto-configuration.md
|
|- Wire services/repositories cleanly with beans and injection
|  -> dependency-injection.md
|
|- Validate request bodies, params, and input contracts
|  -> input-validation.md
|
|- Standardize API/GraphQL error handling and response contracts
|  -> exception-handling.md
|
|- Implement login, token/session handling, and credential validation
|  -> authentication.md
|
|- Build or refine HTTP endpoints and validation
|  -> rest-controllers.md
|
|- Design persistence using entities, repositories, and transactions
|  -> jpa-hibernate.md
|
|- Add login/authz and lock down endpoints
   -> security.md
|
|- Publish and maintain REST API documentation
|  -> swagger-openapi.md
|
|- Improve performance with caching and abuse protection
|  -> caching-rate-limiting.md
|
|- Build asynchronous/event-driven integration between services
|  -> microservices-messaging.md
|
|- Add metrics, tracing, logs, and health probes for production ops
|  -> observability.md
|
|- Expand confidence with unit/slice/integration test strategy
|  -> testing.md
|
|- Build or optimize GraphQL APIs
   |- GraphQL schema and contract design
   |  -> graphql-schema-design.md
   |- GraphQL type system modeling
   |  -> graphql-type-system.md
   |- Resolver implementation
   |  -> graphql-resolvers.md
   |- Query and mutation patterns
   |  -> graphql-queries-mutations.md
   |- Real-time subscriptions
   |  -> graphql-subscriptions.md
   |- GraphQL auth and authorization
   |  -> graphql-authentication-authorization.md
   |- N+1 prevention with batching
   |  -> graphql-dataloader-pattern.md
   |- Error mapping and response consistency
   |  -> graphql-error-handling.md
   |- Performance guardrails and tuning
   |  -> graphql-performance-optimization.md
   |- Federation and multi-service schema composition
      -> graphql-federation.md
```

---

## How to Use

1. Identify the immediate goal from the table or quick guide.
2. Load the matching sub-skill file before writing code.
3. Apply its patterns and avoid listed anti-patterns.
4. Combine sub-skills for cross-cutting tasks (for example GraphQL resolvers + DataLoader + auth + testing).

> Sub-skill files are co-located in this folder and should be referenced by relative path.
