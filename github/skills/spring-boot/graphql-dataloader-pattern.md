---
name: spring-boot-graphql-dataloader-pattern
description: "Spring Boot GraphQL DataLoader pattern - request-scoped batching, caching, and N+1 query prevention for nested fields. Use when: optimizing GraphQL nested resolver performance. DO NOT USE FOR: non-GraphQL service optimization."
---

# Spring Boot GraphQL DataLoader Pattern

## 1. N+1 Problem

- Nested resolvers can trigger one DB call per parent row.
- Use DataLoader to batch by keys within request scope.

## 2. Batching Strategy

- Batch by aggregate key (`orderId`, `userId`).
- Preserve key order in returned results.
- Keep loader caches request-scoped only.

## 3. Resolver Usage

- In field resolver, enqueue load by key instead of immediate query.
- Let DataLoader dispatch batched query once per tick/request phase.

## 4. Anti-Patterns

- Global DataLoader cache across requests.
- Mixing tenant data in the same batch query without constraints.
- Returning partially ordered/misaligned batch results.
