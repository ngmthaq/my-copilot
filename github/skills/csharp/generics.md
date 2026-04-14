---
name: csharp-generics
description: "C# generics guidance - covers generic methods/types, constraints, variance, and API design tradeoffs. Use when: building reusable type-safe abstractions."
---

# C# Generics

## Use Cases

- Reusable collections/services without boxing
- Strongly typed pipelines and mappers
- Framework helpers that work across model types

## Constraints

- Use constraints to state requirements explicitly.
- Keep constraints minimal but sufficient.

```csharp
public interface IEntity
{
    Guid Id { get; }
}

public sealed class Repository<T> where T : class, IEntity
{
    public T? FindById(IEnumerable<T> source, Guid id)
    {
        return source.FirstOrDefault(x => x.Id == id);
    }
}
```

## Variance

- Use `out` for producer interfaces (covariant).
- Use `in` for consumer interfaces (contravariant).
- Variance applies only to interfaces and delegates.

## Guidance

- Avoid over-generalizing APIs with too many type parameters.
- If call sites become unreadable, simplify the abstraction.
- Prefer domain-specific type aliases/wrappers where useful.
