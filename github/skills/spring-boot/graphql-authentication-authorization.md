---
name: spring-boot-graphql-authentication-authorization
description: "Spring Boot GraphQL authentication and authorization - endpoint security, method-level policies, context-based identity, and field-level access checks. Use when: securing GraphQL APIs in Spring. DO NOT USE FOR: non-security schema modeling tasks."
---

# Spring Boot GraphQL Authentication and Authorization

## 1. Endpoint Security

- Secure `/graphql` endpoint via Spring Security.
- Allow introspection only where appropriate.
- Propagate user identity into GraphQL context.

## 2. Method-Level Authorization

```java
@QueryMapping
@PreAuthorize("hasAuthority('orders:read')")
public OrderDto orderById(@Argument UUID id) {
    return orderService.getById(id);
}
```

- Use policy/authority checks close to resolver boundaries.

## 3. Row/Field-Level Access

- Enforce tenant scoping in service/repository layers.
- Mask or omit restricted fields based on caller role.

## 4. Anti-Patterns

- Relying only on gateway for authorization.
- Returning authorization internals in error messages.
- Allowing broad wildcard permissions by default.
