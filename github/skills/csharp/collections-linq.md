---
name: csharp-collections-linq
description: "C# collections and LINQ guidance - covers collection selection, LINQ query composition, deferred execution, and common performance pitfalls. Use when: implementing data processing logic."
---

# Collections and LINQ

## Collection Selection

| Need                          | Type                                                  |
| ----------------------------- | ----------------------------------------------------- |
| Index-based list              | List<T>                                               |
| Key lookup                    | Dictionary<TKey, TValue>                              |
| Unique items                  | HashSet<T>                                            |
| Thread-safe producer/consumer | ConcurrentQueue<T> / Channel<T>                       |
| Immutable snapshots           | ImmutableArray<T> / ImmutableDictionary<TKey, TValue> |

## LINQ Rules

- Materialize once if data is enumerated multiple times (`ToList`, `ToArray`).
- Keep query steps readable and side-effect free.
- Avoid expensive operations inside `Where` and `Select` repeatedly.

```csharp
var activeEmails = users
    .Where(u => u.IsActive)
    .Select(u => u.Email)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToList();
```

## Deferred Execution Pitfall

```csharp
// BAD: query re-runs each iteration against the source
var query = users.Where(u => u.IsActive);

// GOOD: evaluate once when snapshot is needed
var snapshot = users.Where(u => u.IsActive).ToList();
```

## Practical Guidance

- Prefer `Any()` over `Count() > 0` for existence checks.
- Prefer dictionary lookups for repeated key access.
- Use `StringComparer.Ordinal` or `OrdinalIgnoreCase` explicitly for predictability.
