---
name: dotnet-convention
description: "Dotnet convention guidance - naming, folder layout, project boundaries, and solution organization. Use when: standardizing structure and style in .NET repositories."
---

# Convention

## Rules

- Use clear project names by responsibility (`Api`, `Application`, `Domain`, `Infrastructure`, `Tests`).
- Keep one public type per file where practical.
- Use suffixes consistently (`Controller`, `Service`, `Repository`, `Options`).
- Prefer predictable namespaces aligned with folder structure.

## Folder Shape

```text
src/
	MyApp.Api/
	MyApp.Application/
	MyApp.Domain/
	MyApp.Infrastructure/
tests/
	MyApp.Api.Tests/
	MyApp.Application.Tests/
```

## Procedure

1. Align solution layout and project naming.
2. Ensure consistent file and namespace structure.
3. Normalize naming for DTOs, commands, queries, and handlers.
4. Add style checks in CI where available.

## Example

```csharp
namespace MyApp.Application.Users.Commands;

public sealed record CreateUserCommand(string Email, string DisplayName);
```
