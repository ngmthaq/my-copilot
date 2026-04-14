---
name: spring-boot-graphql-federation
description: "Spring Boot GraphQL federation - subgraph boundaries, entity ownership, key design, and cross-service schema composition. Use when: building federated GraphQL architecture with Spring services. DO NOT USE FOR: single-service monolithic schemas."
---

# Spring Boot GraphQL Federation

## 1. Subgraph Boundaries

- Split by business domain, not by technical layer.
- Keep ownership clear for each entity and field.
- Minimize cross-subgraph chatty dependencies.

## 2. Entity Ownership and Keys

- Define stable federated keys for resolvable entities.
- Keep reference resolvers lightweight and deterministic.
- Avoid mutable business fields as federation keys.

## 3. Contract Evolution

- Additive changes first, coordinated deprecations.
- Validate composed schema in CI.
- Version-breaking changes with explicit migration plans.

## 4. Operational Concerns

- Monitor resolver latency across subgraphs.
- Enforce auth consistency at gateway and subgraph levels.
- Use tracing to diagnose cross-service query paths.

## 5. Anti-Patterns

- Duplicating ownership of the same field in multiple services.
- Tight coupling on internal IDs with no compatibility guarantees.
- Shipping unvalidated composed schemas.
