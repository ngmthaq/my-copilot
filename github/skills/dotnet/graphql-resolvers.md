---
name: dotnet-graphql-resolvers
description: "Dotnet GraphQL resolver guidance - thin resolvers, service delegation, field resolvers, and cancellation-safe execution. Use when: implementing GraphQL resolver logic."
---

# GraphQL Resolvers

## Procedure

1. Keep resolvers orchestration-only and delegate to services.
2. Accept cancellation token in async resolver paths.
3. Use field resolvers for computed or related data only.
4. Keep mutation resolvers idempotency-aware for retries.
5. Add resolver tests for success, not-found, and authorization paths.

## Example

```csharp
public class Mutation
{
    public Task<CreateOrderPayload> CreateOrderAsync(
        CreateOrderInput input,
        [Service] IOrderService service,
        CancellationToken ct)
        => service.CreateAsync(input, ct);
}
```
