---
name: spring-boot-graphql-schema-design
description: "Spring Boot GraphQL schema design - type boundaries, nullability, pagination, and schema evolution strategy. Use when: defining GraphQL contracts for Spring GraphQL APIs. DO NOT USE FOR: REST endpoint contract design."
---

# Spring Boot GraphQL Schema Design

## 1. Keep Schema Domain-Oriented

- Design around business concepts, not table structure.
- Use explicit input and payload types.
- Keep fields stable and additive for evolution.

## 2. Nullability Rules

- Use non-null (`!`) only when guaranteed.
- Avoid overusing nullable lists of nullable items.
- Reserve nullable outputs for expected absence, not hidden errors.

## 3. Pagination and Filtering

- Prefer cursor-based pagination for large datasets.
- Standardize filtering/sorting inputs across queries.
- Return metadata (`pageInfo`, total when appropriate).

## 4. Mutation Design

- Mutations should represent business actions.
- Use typed payloads with status and error metadata.
- Avoid exposing persistence implementation details.

## 5. Evolution Strategy

- Add fields before removing old ones.
- Deprecate with clear replacement guidance.
- Version only when absolutely necessary.

## 6. Anti-Patterns

- 1:1 mirroring database schema in GraphQL.
- Returning generic maps instead of typed payloads.
- Breaking changes without deprecation period.
