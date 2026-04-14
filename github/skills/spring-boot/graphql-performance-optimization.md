---
name: spring-boot-graphql-performance-optimization
description: "Spring Boot GraphQL performance optimization - query complexity limits, depth limits, batching, caching, and resolver profiling. Use when: reducing GraphQL latency and preventing expensive query abuse. DO NOT USE FOR: REST-only performance tuning."
---

# Spring Boot GraphQL Performance Optimization

## 1. Query Guardrails

- Enforce max query depth and complexity.
- Limit page size and nested list expansion.
- Block introspection in restricted production modes if required.

## 2. Resolver Efficiency

- Use DataLoader for nested relation fetching.
- Avoid synchronous blocking calls in resolvers.
- Batch downstream requests where possible.

## 3. Caching Strategy

- Cache stable query results where safe.
- Use short TTL for fast-changing data.
- Invalidate on relevant mutation events.

## 4. Profiling and Metrics

- Measure resolver latency by field/type.
- Track high-cost queries and repeated offenders.
- Emit metrics for complexity rejection events.

## 5. Anti-Patterns

- Unlimited nested queries.
- Per-field remote calls without batching.
- No metrics for resolver hot spots.
