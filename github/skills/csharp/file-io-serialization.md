---
name: csharp-file-io-serialization
description: "C# file I/O and serialization guidance - covers file streams, async I/O, JSON serialization, options, and contract safety. Use when: reading/writing files or serializing data."
---

# File I/O and Serialization

## File I/O Rules

- Prefer async I/O for service and UI scenarios.
- Use `await using` for disposable async streams.
- Specify encoding explicitly for text operations.

```csharp
public static async Task WriteJsonAsync<T>(string path, T payload, CancellationToken cancellationToken)
{
    await using var stream = File.Create(path);
    await JsonSerializer.SerializeAsync(stream, payload, cancellationToken: cancellationToken);
}
```

## JSON Guidance

- Use `System.Text.Json` by default.
- Keep serializer options centralized.
- Prefer explicit DTOs over serializing domain entities directly.

```csharp
public static readonly JsonSerializerOptions JsonOptions = new()
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    WriteIndented = false
};
```

## Safety Checklist

- Validate path inputs from external sources.
- Guard against very large payloads.
- Version contracts carefully when APIs evolve.
