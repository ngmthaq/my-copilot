---
name: csharp-modern-csharp
description: "Modern C# guidance - covers language features from C# 9+ including records, init/required members, pattern matching improvements, file-scoped namespaces, and primary constructors. Use when: modernizing or designing new C# code."
---

# Modern C#

## Features to Prefer

- Records for immutable value objects and DTOs.
- `init` and `required` to model construction invariants.
- File-scoped namespaces for cleaner files.
- Switch expressions and relational patterns.
- Primary constructors for concise type declarations.

## Example

```csharp
namespace Billing;

public sealed record InvoiceLine(string Sku, int Quantity, decimal UnitPrice)
{
    public decimal Total => Quantity * UnitPrice;
}

public sealed class Invoice(required string Number, IReadOnlyList<InvoiceLine> Lines)
{
    public string Number { get; } = Number;
    public IReadOnlyList<InvoiceLine> Lines { get; } = Lines;
}
```

## Adoption Guidance

- Introduce modern features incrementally per module.
- Keep team conventions explicit in reviews.
- Avoid novelty when it reduces readability for the team.
