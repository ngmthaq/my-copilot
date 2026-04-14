---
name: dotnet-configuration-options
description: "Configuration and options guidance for .NET - appsettings layering, options binding, validation, environment overrides, and secret handling. Use when: managing runtime configuration."
---

# Configuration and Options

## Procedure

1. Define strongly typed options classes per feature.
2. Bind and validate options at startup.
3. Separate environment values from defaults.
4. Keep secrets in secure stores, not source files.
5. Fail fast when required settings are missing.

## Rules

- Use clear section names and avoid deep nesting.
- Keep one options class per configuration concern.
- Validate range/format constraints during startup.
- Document required environment variables for deployment.
- Prefer strongly typed options over direct IConfiguration reads in business logic.

## Example

```csharp
builder.Services
    .AddOptions<SmtpOptions>()
    .BindConfiguration("Smtp")
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

## Environment Override Example

```csharp
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();
```
