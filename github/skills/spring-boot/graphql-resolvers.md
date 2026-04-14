---
name: spring-boot-graphql-resolvers
description: "Spring Boot GraphQL resolvers - query/mutation handlers, field resolvers, orchestration boundaries, and request-scoped context usage. Use when: implementing GraphQL resolver behavior in Spring GraphQL. DO NOT USE FOR: schema-only design tasks."
---

# Spring Boot GraphQL Resolvers

## 1. Query and Mutation Resolvers

```java
@Controller
public class OrderGraphQlController {

    private final OrderService orderService;

    public OrderGraphQlController(OrderService orderService) {
        this.orderService = orderService;
    }

    @QueryMapping
    public OrderDto orderById(@Argument UUID id) {
        return orderService.getById(id);
    }

    @MutationMapping
    public CreateOrderPayload createOrder(@Argument CreateOrderInput input) {
        return orderService.create(input);
    }
}
```

- Keep resolver methods thin and orchestration-focused.
- Move business logic into services.

## 2. Field Resolvers

```java
@SchemaMapping(typeName = "Order", field = "lines")
public List<OrderLineDto> lines(OrderDto order) {
    return orderService.getLines(order.id());
}
```

- Use field resolvers for nested fetches only.
- Batch nested fetches to avoid N+1.

## 3. Context and Security

- Access request context for tenant/user metadata.
- Validate access in service or method security layer.

## 4. Anti-Patterns

- Heavy data access directly inside resolver methods.
- Resolver-to-resolver direct coupling.
- Returning framework exceptions unnormalized.
