---
name: csharp-core-fundamentals
description: "C# core fundamentals - covers types, nullable reference types, control flow, pattern matching, value vs reference semantics, and basic API design. Use when: implementing or debugging language-level behavior in C#."
---

# C# Core Fundamentals

## Scope

Use this guide for language basics that affect correctness and readability.

## Type and Nullability Rules

- Enable nullable reference types (`<Nullable>enable</Nullable>`).
- Treat warnings like `CS8602` as real defects.
- Prefer explicit null handling over using null-forgiving (`!`) repeatedly.

```csharp
public string NormalizeName(string? input)
{
    if (string.IsNullOrWhiteSpace(input))
    {
        return "unknown";
    }

    return input.Trim();
}
```

## Value vs Reference Semantics

- `struct` is copied by value; avoid large mutable structs.
- `class` is referenced by object identity.
- Use `readonly struct` for small immutable value-like types.

## Pattern Matching

- Prefer pattern matching over nested casts.
- Use switch expressions for compact, exhaustive logic.

```csharp
public static string Describe(object value) => value switch
{
    null => "null",
    int n when n < 0 => "negative int",
    int => "int",
    string s when s.Length == 0 => "empty string",
    string => "string",
    _ => "other"
};
```

## API Design Basics

- Use clear parameter names and avoid boolean traps.
- Return immutable/read-only views where possible.
- Favor small methods with single responsibility.
