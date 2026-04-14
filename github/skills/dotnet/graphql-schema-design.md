---
name: dotnet-graphql-schema-design
description: "Dotnet GraphQL schema design guidance - object types, boundaries, nullability, and schema evolution strategies. Use when: designing GraphQL schemas in .NET services."
---

# GraphQL Schema Design

## Procedure

1. Model graph shape from client use cases, not database tables.
2. Define stable object types and explicit input/payload models.
3. Set nullability intentionally for backward-compatible evolution.
4. Version behavior through additive schema changes.
5. Validate schema shape with snapshot or introspection tests.

## Example

```csharp
public class Query
{
    [GraphQLName("user")]
    public Task<UserDto?> GetUserAsync(Guid id, [Service] IUserService service, CancellationToken ct)
        => service.FindAsync(id, ct);
}

public record UserDto(Guid Id, string Email, string DisplayName);
```
