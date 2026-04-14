---
name: spring-boot-input-validation
description: "Spring Boot input validation - Bean Validation for request DTOs, nested validation, groups, custom constraints, and consistent error responses. Use when: validating incoming REST/GraphQL inputs at service boundaries. DO NOT USE FOR: persistence schema constraints or authentication policy rules."
---

# Spring Boot Input Validation

## 1. Enable Validation at Boundaries

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(/* ... */);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(/* ... */);
    }
}
```

- Use `@Valid` for body validation.
- Use constraint annotations on params/path variables for scalar checks.

## 2. DTO Validation Rules

```java
public record CreateUserRequest(
    @NotBlank(message = "name is required")
    @Size(max = 120, message = "name must be <= 120 chars")
    String name,

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    String email,

    @NotEmpty(message = "roles must not be empty")
    List<@Pattern(regexp = "ADMIN|EDITOR|VIEWER", message = "invalid role") String> roles,

    @Valid
    AddressInput address
) {
}

public record AddressInput(
    @NotBlank String street,
    @NotBlank String city,
    @Pattern(regexp = "^[0-9]{5}$", message = "zip must be 5 digits") String zip
) {
}
```

- Keep validation in API input models, not JPA entities.
- Validate nested objects/collections with `@Valid`.

## 3. Validation Groups

```java
public interface OnCreate {}
public interface OnUpdate {}

public record UserInput(
    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    Long id,

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    String name
) {
}

@PostMapping
public ResponseEntity<Void> create(@Validated(OnCreate.class) @RequestBody UserInput input) {
    return ResponseEntity.ok().build();
}
```

- Use groups when create/update constraints differ.
- Keep groups minimal to avoid complexity.

## 4. Custom Constraint

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {
    String message() default "password is too weak";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return value.length() >= 12
            && value.chars().anyMatch(Character::isUpperCase)
            && value.chars().anyMatch(Character::isLowerCase)
            && value.chars().anyMatch(Character::isDigit);
    }
}
```

- Use custom constraints for reusable domain rules.

## 5. Consistent Error Responses

```java
@RestControllerAdvice
class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> handleInvalidBody(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> Map.of(
                "field", err.getField(),
                "message", err.getDefaultMessage()))
            .toList();

        return ResponseEntity.badRequest().body(Map.of(
            "code", "VALIDATION_ERROR",
            "errors", errors));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        var errors = ex.getConstraintViolations().stream()
            .map(v -> Map.of(
                "field", v.getPropertyPath().toString(),
                "message", v.getMessage()))
            .toList();

        return ResponseEntity.badRequest().body(Map.of(
            "code", "CONSTRAINT_VIOLATION",
            "errors", errors));
    }
}
```

- Return machine-readable validation codes.
- Keep error shape stable across endpoints.

## 6. GraphQL Input Validation Notes

- Apply Bean Validation on GraphQL input DTOs as well.
- Map validation failures to consistent GraphQL error codes/extensions.
- Avoid leaking internal validation metadata.

## 7. Anti-Patterns

- Relying only on frontend validation.
- Spreading ad-hoc `if` checks in controllers/services.
- Returning inconsistent error payloads per endpoint.
- Duplicating the same validation rules across DTOs without shared annotations.
