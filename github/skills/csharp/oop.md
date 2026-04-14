---
name: csharp-oop
description: "C# OOP guidance - covers classes, interfaces, inheritance, composition, records, and dependency inversion. Use when: modeling domains, designing APIs, or refactoring object-oriented code."
---

# C# OOP

## When to Use

- Designing service and domain models
- Choosing between inheritance and composition
- Defining interfaces for testability and replaceability

## Core Principles

- Prefer composition over deep inheritance trees.
- Depend on abstractions (`interface`) instead of concrete implementations.
- Keep classes focused and cohesive.
- Use records for immutable data carriers.

## Example: Composition with Interface

```csharp
public interface IClock
{
    DateTimeOffset UtcNow { get; }
}

public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}

public sealed class SessionService
{
    private readonly IClock _clock;

    public SessionService(IClock clock)
    {
        _clock = clock;
    }

    public DateTimeOffset GetExpiry(TimeSpan ttl) => _clock.UtcNow.Add(ttl);
}
```

## Records vs Classes

- Use `record` for immutable value-centric models (DTOs, messages).
- Use `class` for entities with identity and mutable lifecycle.

## Anti-Patterns

- God classes with many unrelated responsibilities.
- Leaking infrastructure concerns into domain models.
- Using inheritance only for code reuse where composition is clearer.
