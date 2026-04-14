---
name: spring-boot-graphql-type-system
description: "Spring Boot GraphQL type system - object/input types, enums, custom scalars, interfaces, and unions for Spring GraphQL. Use when: modeling robust GraphQL types. DO NOT USE FOR: resolver performance tuning."
---

# Spring Boot GraphQL Type System

## 1. Object and Input Types

- Keep output objects and input types separate.
- Avoid reusing entities as GraphQL types.
- Use dedicated DTOs mapped from domain models.

## 2. Enums and Scalars

- Use enums for finite states.
- Add custom scalars for domain values (UUID, DateTime, Money).
- Validate scalar parsing errors clearly.

## 3. Interfaces and Unions

- Use interfaces for shared fields across types.
- Use unions for polymorphic result variants.
- Keep client query ergonomics in mind with fragments.

## 4. Spring Mapping Notes

```java
@Controller
class UserGraphQlController {

    @QueryMapping
    UserDto userById(@Argument UUID id) {
        return /* ... */;
    }
}
```

- Align Java DTO nullability with schema nullability.

## 5. Anti-Patterns

- Overloaded generic scalar usage where enums fit better.
- One massive type used across all operations.
- Leaking internal IDs/types without purpose.
