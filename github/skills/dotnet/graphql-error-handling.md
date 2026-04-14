---
name: dotnet-graphql-error-handling
description: "Dotnet GraphQL error handling guidance - safe error envelopes, extension codes, and domain-to-GraphQL failure mapping. Use when: standardizing GraphQL failures."
---

# GraphQL Error Handling

## Procedure

1. Define a canonical set of GraphQL extension codes.
2. Map domain exceptions to stable client-safe error shapes.
3. Redact internal details while preserving actionable codes.
4. Keep partial-data behavior explicit for clients.
5. Add negative tests for validation, authorization, and conflict errors.

## Example

```csharp
throw new GraphQLException(
    ErrorBuilder.New()
        .SetMessage("Order not found")
        .SetCode("ORDER_NOT_FOUND")
        .Build());
```
