---
name: spring-boot-graphql-queries-mutations
description: "Spring Boot GraphQL queries and mutations - contract patterns, pagination/filtering, mutation payload design, and input validation. Use when: designing or implementing query/mutation APIs in Spring GraphQL. DO NOT USE FOR: transport-level subscriptions and broker design."
---

# Spring Boot GraphQL Queries and Mutations

## 1. Query Patterns

- Design focused queries with clear filter inputs.
- Support paging for list-heavy queries.
- Avoid unconstrained list queries in production.

## 2. Mutation Patterns

- Use action-oriented mutation names (`createOrder`, `cancelOrder`).
- Return typed payloads, not bare booleans.
- Include partial failure info only when required by workflow.

## 3. Input Validation

- Validate arguments early (Bean Validation or service-level guards).
- Return client-safe validation errors with field context.

## 4. Example

```java
@MutationMapping
public CancelOrderPayload cancelOrder(@Argument UUID orderId, @Argument String reason) {
    return orderService.cancel(orderId, reason);
}
```

## 5. Anti-Patterns

- Generic catch-all mutations with weak typing.
- Returning persistence entities as mutation payload.
- No bounds or filters on collection queries.
