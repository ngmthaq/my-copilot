---
name: csharp-build-system
description: "C# build system guidance - covers dotnet CLI workflows, MSBuild properties, NuGet package management, and CI-friendly build/test/publish commands. Use when: configuring or troubleshooting C# project builds."
---

# Build System

## Standard CLI Workflow

```bash
dotnet restore
dotnet build -c Release
dotnet test -c Release --no-build
dotnet publish -c Release -o ./artifacts/publish
```

## Project Structure

- Keep solution files at repository root for discovery.
- Separate app, library, and test projects clearly.
- Use `Directory.Build.props` for shared MSBuild properties.
- Use `Directory.Packages.props` for central package versioning.

## Recommended Build Settings

- `<Nullable>enable</Nullable>`
- `<ImplicitUsings>enable</ImplicitUsings>`
- `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` in CI
- Deterministic builds for reproducibility

## NuGet Guidance

- Prefer floating versions only in prototypes.
- Pin package versions in mainline branches.
- Audit transitive dependencies regularly.
