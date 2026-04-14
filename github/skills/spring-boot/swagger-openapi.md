---
name: spring-boot-swagger-openapi
description: "Spring Boot Swagger/OpenAPI - endpoint documentation, schema annotations, grouped docs, and secure API doc exposure. Use when: documenting Spring REST APIs with springdoc-openapi. DO NOT USE FOR: GraphQL schema documentation flows."
---

# Spring Boot Swagger and OpenAPI

## 1. Basic Setup

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info().title("Order API").version("v1"));
    }
}
```

- Standard UI path is `/swagger-ui.html`.
- Keep API metadata explicit and versioned.

## 2. Endpoint Annotations

```java
@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders")
public class OrderController {

    @Operation(summary = "Get order by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Order found"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(/* ... */);
    }
}
```

## 3. Schema Documentation

```java
@Schema(description = "Order creation request")
public record CreateOrderRequest(
    @Schema(example = "1") Long customerId,
    @Schema(example = "USD") String currency
) {}
```

- Prefer DTO-level docs instead of entity-level docs.

## 4. Grouping APIs

```java
@Bean
public GroupedOpenApi publicApi() {
    return GroupedOpenApi.builder()
        .group("public")
        .pathsToMatch("/api/v1/**")
        .build();
}
```

## 5. Security for Docs

- Expose docs only in non-production or behind auth.
- Hide internal/admin endpoints from public docs.

## 6. Anti-Patterns

- Letting docs drift from real response contracts.
- Documenting JPA entities instead of API DTOs.
- Exposing Swagger UI publicly without controls.
