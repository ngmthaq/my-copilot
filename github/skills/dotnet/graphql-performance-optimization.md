---
name: dotnet-graphql-performance-optimization
description: "Dotnet GraphQL performance guidance - complexity limits, projection-aware querying, caching, and resolver latency tuning. Use when: reducing GraphQL latency and load."
---

# GraphQL Performance Optimization

## Procedure

1. Add complexity/depth guards for incoming queries.
2. Project only requested fields where possible.
3. Use DataLoader and query batching for relational fields.
4. Cache read-heavy query results at suitable boundaries.
5. Track per-field resolver latency and query cost metrics.

## Example

```csharp
builder.Services
    .AddGraphQLServer()
    .AddMaxExecutionDepthRule(10)
    .ModifyRequestOptions(o => o.IncludeExceptionDetails = false);
```
