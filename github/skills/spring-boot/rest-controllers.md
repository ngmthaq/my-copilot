---
name: spring-boot-rest-controllers
description: "Spring Boot REST controllers - request mapping, DTO validation, response modeling, global exception handling, pagination, and API versioning. Use when: building or refactoring HTTP APIs with Spring MVC. DO NOT USE FOR: security authentication internals or JPA entity tuning details."
---

# Spring Boot REST Controllers

## 1. Controller and Routing Basics

```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(OrderResponse.from(orderService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        Order created = orderService.create(request.toCommand());
        URI location = URI.create("/api/v1/orders/" + created.id());
        return ResponseEntity.created(location).body(OrderResponse.from(created));
    }
}
```

- Keep controllers thin: validate, map, delegate, map response.
- Keep business logic in services.

## 2. Request DTO Validation

```java
public record CreateOrderRequest(
    @NotNull Long customerId,
    @NotEmpty List<@Valid LineItemRequest> items,
    @NotBlank String currency
) {
    public CreateOrderCommand toCommand() {
        return new CreateOrderCommand(customerId, items, currency);
    }
}

public record LineItemRequest(
    @NotNull Long productId,
    @Min(1) int quantity
) {
}
```

```java
@RestController
@RequestMapping("/api/v1/customers")
class CustomerController {

    @PostMapping
    ResponseEntity<Void> create(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.accepted().build();
    }
}
```

- Validate boundary DTOs, not entities.
- Use nested validation (`@Valid`) for child payloads.

## 3. Query Params and Pagination

```java
@GetMapping
public Page<OrderSummaryResponse> search(
    @RequestParam(required = false) String status,
    @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
) {
    return orderService.search(status, pageable).map(OrderSummaryResponse::from);
}
```

- Default and bound page size to avoid abuse.
- Return metadata (`Page<T>`) for pageable endpoints.

## 4. Global Exception Handling

```java
@RestControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiError("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiValidationError> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldViolation> violations = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> new FieldViolation(err.getField(), err.getDefaultMessage()))
            .toList();
        return ResponseEntity.badRequest().body(new ApiValidationError("VALIDATION_ERROR", violations));
    }
}
```

- Centralize error mapping; keep controller methods clean.
- Use stable error codes for clients.

## 5. API Versioning Patterns

- URI versioning: `/api/v1/...` (simple and explicit).
- Header versioning: good for internal or advanced clients.
- Avoid breaking response contracts in-place.

## 6. Best Practices

- Use request/response DTOs, not JPA entities.
- Return appropriate status codes (`201`, `204`, `400`, `404`, `409`).
- Keep idempotency in mind for `PUT` and `DELETE`.
- Add request correlation ID logging for traceability.

## 7. Anti-Patterns

- Business rules inside controllers.
- Returning entities directly.
- Inconsistent error response format.
- Catching `Exception` in controllers and swallowing details.
