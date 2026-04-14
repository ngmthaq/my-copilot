---
name: spring-boot-graphql-subscriptions
description: "Spring Boot GraphQL subscriptions - real-time event streams, transport setup, auth boundaries, and delivery reliability. Use when: implementing GraphQL subscriptions in Spring GraphQL. DO NOT USE FOR: standard request/response query patterns."
---

# Spring Boot GraphQL Subscriptions

## 1. Subscription Use Cases

- Live order status updates.
- Notification streams per user/tenant.
- Monitoring dashboards for operational events.

## 2. Design Guidelines

- Keep event payloads minimal and typed.
- Scope streams by tenant/user to avoid data leaks.
- Apply auth checks at subscription start and event delivery.

## 3. Reliability

- Handle reconnects and duplicate events on clients.
- Include event IDs for deduplication.
- Track delivery failures and backpressure behavior.

## 4. Anti-Patterns

- Streaming entire aggregates on every update.
- No authorization on subscription topics.
- Subscription handlers doing expensive blocking work.
