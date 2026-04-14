---
name: dotnet-data-access-efcore
description: "EF Core data access guidance - DbContext modeling, migrations, query shaping, transactions, and consistency checks. Use when: implementing persistence in .NET apps."
---

# EF Core Data Access

## Scope

- Design aggregate boundaries and entity configuration clearly.
- Keep query projections explicit to avoid over-fetching.
- Apply transactions where multi-step writes must be atomic.

## Procedure

1. Define entities and fluent configuration.
2. Add migration and review generated SQL for safety.
3. Implement repository/query service with cancellation tokens.
4. Use projection (`Select`) for API read models.
5. Add integration tests for constraints and transaction behavior.

## Rules

- Use `AsNoTracking()` for read-only queries.
- Avoid N+1 access by shaping includes intentionally.
- Keep migration history linear and reviewed.
- Validate concurrency strategy (row version or conflict handling).

## Example

```csharp
var users = await _db.Users
	.AsNoTracking()
	.Where(x => x.IsActive)
	.OrderBy(x => x.DisplayName)
	.Select(x => new UserListItem(x.Id, x.DisplayName, x.Email))
	.ToListAsync(ct);
```
