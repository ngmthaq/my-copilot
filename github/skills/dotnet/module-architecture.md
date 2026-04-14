---
name: dotnet-module-architecture
description: "Dotnet module architecture guidance - feature boundaries, layering, dependency direction, and composition roots. Use when: structuring medium/large .NET applications."
---

# Module Architecture

## Goals

- Keep dependencies inward toward domain/application logic.
- Isolate infrastructure details behind interfaces.
- Group code by feature and capability, not only by technical type.

## Procedure

1. Define feature modules and ownership boundaries.
2. Establish layer contracts (API -> Application -> Domain -> Infrastructure).
3. Register module dependencies in one composition root.
4. Enforce dependency direction in reviews.

## Example

```csharp
// API depends on Application abstractions
builder.Services.AddScoped<IUserService, UserService>();

// Infrastructure implements Application contracts
builder.Services.AddScoped<IUserRepository, EfUserRepository>();
```

## Checks

- No domain dependency on web/EF/infrastructure packages.
- Feature modules are independently testable.
- Each module exposes a minimal public surface.
