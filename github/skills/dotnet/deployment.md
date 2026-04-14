---
name: dotnet-deployment
description: "Dotnet deployment guidance - publish outputs, container packaging, environment configuration handoff, and release readiness checks. Use when: preparing .NET apps for runtime environments."
---

# Deployment

## Procedure

1. Build and test in release configuration.
2. Produce publish artifacts with explicit runtime targets where required.
3. Package using minimal runtime image when containerized.
4. Wire environment configuration and secret injection.
5. Validate health endpoint and startup behavior in staging.

## Example

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY ./artifacts/publish .
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```

## Release Checks

- Build metadata/version is traceable.
- Startup succeeds with production-like configuration.
- Rollback strategy is documented and tested.
- Resource limits and probes are defined for runtime platform.
- Runtime image contains only required artifacts and dependencies.
