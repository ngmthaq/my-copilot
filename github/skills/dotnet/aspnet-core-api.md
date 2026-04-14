---
name: dotnet-aspnet-core-api
description: "ASP.NET Core API implementation guidance - endpoints, validation, status codes, filters, and minimal API/controller patterns. Use when: creating or fixing .NET HTTP APIs."
---

# ASP.NET Core API

## Scope

- Design request/response contracts with explicit DTOs.
- Keep endpoint handlers thin; delegate business logic to services.
- Return precise status codes and stable error payloads.
- Apply consistency for pagination, filtering, and sorting contracts.

## Procedure

1. Define DTOs for input/output and validation rules.
2. Choose style: Minimal API for small feature slices, Controllers for larger API surfaces.
3. Implement endpoint handler with cancellation support.
4. Centralize error mapping (validation, not found, conflicts, unexpected errors).
5. Add endpoint-level tests for success and failure paths.

## API Rules

- Use `400` for validation failure, `404` for missing resources, `409` for conflicts.
- Avoid returning domain entities directly.
- Keep route naming consistent (`/resources/{id}` style).
- Do not leak stack traces or internal exception messages.
- Use idempotency keys for externally retried create operations when applicable.

## Minimal API Example

```csharp
app.MapPost("/users", async (
    CreateUserRequest request,
    IUserService service,
    CancellationToken ct) =>
{
    var result = await service.CreateAsync(request, ct);
    return Results.Created($"/users/{result.Id}", result);
});
```

## Controller Example

```csharp
[HttpDelete("{id:guid}")]
public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
{
    var deleted = await _service.DeleteAsync(id, ct);
    return deleted ? NoContent() : NotFound();
}
```
