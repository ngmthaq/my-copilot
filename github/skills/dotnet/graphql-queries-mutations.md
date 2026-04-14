---
name: dotnet-graphql-queries-mutations
description: "Dotnet GraphQL query/mutation guidance - contract shape, cursor pagination, filtering, and mutation payload design. Use when: designing GraphQL operations."
---

# GraphQL Queries and Mutations

## Procedure

1. Keep query inputs explicit and bounded (pagination limits).
2. Return mutation payloads that include identifiers and result metadata.
3. Use cursor-based pagination for large collections.
4. Include deterministic sorting for paginated results.
5. Add contract tests for operation shape and validation failures.

## Example

```csharp
public record OrdersQueryInput(string? Search, int First = 20, string? After = null);
public record OrdersConnection(IReadOnlyList<OrderDto> Nodes, string? EndCursor, bool HasNextPage);
```
