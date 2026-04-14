---
name: dotnet-build-system
description: "Dotnet build workflow guidance - restore, build, test, publish, package versioning, and CI-safe defaults. Use when: setting up or troubleshooting .NET builds."
---

# Build System

## Standard Workflow

```bash
dotnet restore
dotnet build -c Release
dotnet test -c Release --no-build
dotnet publish -c Release -o ./artifacts/publish
```

## Build Rules

- Keep deterministic build settings in shared props.
- Prefer central package management where possible.
- Treat warnings as errors in CI for quality control.
- Use explicit framework/runtime targets during publish when needed.
- Cache NuGet packages in CI for repeatable performance.

## Troubleshooting Sequence

1. `dotnet --info` and SDK compatibility check.
2. Restore package graph and verify feeds.
3. Build one project, then full solution.
4. Run tests with `--no-build` to isolate test failures.

## CI Example

```bash
dotnet restore --locked-mode
dotnet build -c Release --no-restore
dotnet test -c Release --no-build --logger "trx"
dotnet publish src/MyApp.Api/MyApp.Api.csproj -c Release -o ./artifacts/publish --no-build
```
