---
name: dotnet-graphql-subscriptions
description: "Dotnet GraphQL subscriptions guidance - event topics, filtering, connection lifecycle, and real-time delivery safeguards. Use when: implementing GraphQL subscriptions."
---

# GraphQL Subscriptions

## Procedure

1. Define event topics by aggregate and event type.
2. Filter events per tenant/user authorization context.
3. Bound fan-out and protect against noisy topics.
4. Support reconnect behavior and missed-event strategy.
5. Track subscription metrics for active clients and drop rates.

## Example

```csharp
public class Subscription
{
    [Subscribe]
    public OrderDto OnOrderUpdated([EventMessage] OrderDto message) => message;
}
```
