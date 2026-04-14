---
name: dotnet-dependency-injection
description: "Dependency injection guidance for .NET - service registration, lifetime selection, composition root patterns, and boundary wiring. Use when: structuring .NET services and dependencies."
---

# Dependency Injection

## Lifetime Guidance

- `Singleton`: stateless services and caches safe for shared lifetime.
- `Scoped`: request/unit-of-work services (most app services).
- `Transient`: lightweight, side-effect-free helpers.

## Procedure

1. Define interface boundaries at domain/application seams.
2. Register dependencies in one composition root.
3. Validate lifetimes to prevent captive dependency issues.
4. Keep constructors minimal and explicit.
5. Add startup tests to verify container resolution.

## Example

```csharp
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, EfUserRepository>();
builder.Services.AddSingleton<ISystemClock, SystemClock>();
```

## Anti-Patterns

- Service locator access in business logic.
- Huge constructors signaling missing module boundaries.
- Singleton service depending on scoped services.
