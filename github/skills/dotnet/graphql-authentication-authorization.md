---
name: dotnet-graphql-authentication-authorization
description: "Dotnet GraphQL auth guidance - authentication context, field-level policy checks, and secure resolver access. Use when: protecting GraphQL operations."
---

# GraphQL Authentication and Authorization

## Procedure

1. Attach authenticated principal to GraphQL execution context.
2. Enforce policy checks at resolver or field level.
3. Return consistent unauthorized/forbidden errors.
4. Avoid over-fetching unauthorized data in nested fields.
5. Add tests for anonymous, unauthorized, and authorized flows.

## Example

```csharp
[Authorize(Policy = "Orders.Read")]
public Task<OrderDto?> GetOrderAsync(Guid id, [Service] IOrderService service, CancellationToken ct)
    => service.FindAsync(id, ct);
```
