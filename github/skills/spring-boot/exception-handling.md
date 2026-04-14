---
name: spring-boot-exception-handling
description: "Spring Boot exception handling - global exception mapping, Problem Details, validation error shaping, and consistent API error contracts. Use when: standardizing REST/GraphQL error responses and failure behavior. DO NOT USE FOR: authentication policy design or persistence schema rules."
---

# Spring Boot Exception Handling

## 1. Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiError("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
            .body(new ApiError("BAD_REQUEST", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiError("INTERNAL_ERROR", "Unexpected error occurred"));
    }
}
```

- Centralize mapping from exceptions to HTTP status and API error codes.
- Keep unknown/internal details out of client-visible messages.

## 2. Validation Errors

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
ResponseEntity<ApiValidationError> handleValidation(MethodArgumentNotValidException ex) {
    var violations = ex.getBindingResult().getFieldErrors().stream()
        .map(err -> new FieldViolation(err.getField(), err.getDefaultMessage()))
        .toList();

    return ResponseEntity.badRequest().body(
        new ApiValidationError("VALIDATION_ERROR", violations)
    );
}
```

- Use a stable validation payload shape across endpoints.

## 3. Problem Details (Spring 6+)

```java
@ExceptionHandler(ConflictException.class)
ProblemDetail handleConflict(ConflictException ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
    pd.setTitle("Conflict");
    pd.setDetail(ex.getMessage());
    pd.setProperty("code", "CONFLICT");
    return pd;
}
```

- Prefer RFC 7807 style when clients support it.

## 4. Domain Exception Strategy

- Define explicit domain exceptions with stable codes.
- Translate infrastructure exceptions at service boundaries.
- Avoid leaking DB/driver/framework-specific error internals.

## 5. Logging Rules

- Log full stack traces only once at system boundaries.
- Use warn/error severity appropriately by failure class.
- Include correlation IDs for traceability.

## 6. GraphQL Error Mapping Notes

- Normalize domain errors to predictable extension codes.
- Keep transport semantics consistent across resolvers.

## 7. Anti-Patterns

- Catching `Exception` in controllers and returning ad-hoc responses.
- Returning different error JSON shapes per endpoint.
- Exposing stack traces or SQL errors to clients.
- Silently swallowing exceptions without logs/metrics.
