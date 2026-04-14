---
name: csharp-error-handling
description: "C# error handling guidance - covers exception boundaries, custom exceptions, validation, retry strategy, and structured logging. Use when: defining or refactoring error propagation behavior."
---

# Error Handling

## Principles

- Throw exceptions for truly exceptional states, not routine control flow.
- Validate inputs early with guard clauses.
- Preserve stack traces when rethrowing (`throw;`, not `throw ex;`).
- Translate low-level exceptions at service boundaries.

## Exception Boundary Pattern

```csharp
public async Task<UserDto> GetUserAsync(Guid id, CancellationToken cancellationToken)
{
    try
    {
        var entity = await _repository.LoadAsync(id, cancellationToken);
        return Map(entity);
    }
    catch (SqlException ex)
    {
        throw new UserStoreException("Failed to load user from store.", ex);
    }
}
```

## Retry Guidance

- Retry only transient failures (network, timeout, 429/503).
- Use bounded retries with jittered backoff.
- Do not retry non-idempotent operations blindly.

## Result Pattern

- For expected business failures, consider result objects rather than exceptions.
- Keep error payloads explicit and machine-readable.
