---
name: dotnet-graphql-type-system
description: "Dotnet GraphQL type-system guidance - scalars, enums, interfaces, unions, and input/payload contracts. Use when: modeling GraphQL types in .NET."
---

# GraphQL Type System

## Procedure

1. Define domain-safe scalar mappings (ID, DateTime, decimal policy).
2. Use enums for constrained states instead of free strings.
3. Use interfaces/unions only when clients truly need polymorphism.
4. Keep input types separate from output types.
5. Enforce explicit defaults for optional fields.

## Example

```csharp
public enum OrderStatus { Pending, Paid, Cancelled }

public record CreateOrderInput(Guid CustomerId, IReadOnlyList<Guid> ItemIds);
public record CreateOrderPayload(Guid Id, OrderStatus Status);
```
