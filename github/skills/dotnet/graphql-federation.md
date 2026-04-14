---
name: dotnet-graphql-federation
description: "Dotnet GraphQL federation guidance - subgraph ownership, entity references, schema composition, and cross-service contract stability. Use when: building federated GraphQL services."
---

# GraphQL Federation

## Procedure

1. Define clear ownership boundaries for each subgraph.
2. Use entity references for cross-service relationship fields.
3. Keep shared keys stable and globally unique.
4. Validate composed schema in CI before release.
5. Track cross-subgraph call volume and latency.

## Example

```csharp
builder.Services
    .AddGraphQLServer()
    .AddApolloFederation();
```
