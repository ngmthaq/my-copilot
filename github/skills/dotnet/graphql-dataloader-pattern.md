---
name: dotnet-graphql-dataloader-pattern
description: "Dotnet GraphQL DataLoader guidance - request-scoped batching, caching, and N+1 mitigation for field resolvers. Use when: optimizing relational GraphQL fetches."
---

# GraphQL DataLoader Pattern

## Procedure

1. Identify N+1 field-resolution hotspots.
2. Batch keys per request scope.
3. Return results preserving input key order.
4. Cache only for request lifetime unless explicitly safe.
5. Measure query count before and after applying DataLoader.

## Example

```csharp
public sealed class UserByIdDataLoader : BatchDataLoader<Guid, UserDto>
{
    private readonly IUserRepository _repo;

    public UserByIdDataLoader(IBatchScheduler scheduler, IUserRepository repo)
        : base(scheduler) => _repo = repo;

    protected override async Task<IReadOnlyDictionary<Guid, UserDto>> LoadBatchAsync(
        IReadOnlyList<Guid> keys, CancellationToken cancellationToken)
        => await _repo.GetByIdsAsync(keys, cancellationToken);
}
```
