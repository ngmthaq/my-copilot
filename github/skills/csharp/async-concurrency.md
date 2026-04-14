---
name: csharp-async-concurrency
description: "C# async and concurrency guidance - covers async/await, Task orchestration, cancellation, synchronization, and safe parallelism. Use when: implementing non-blocking workflows or multithreaded code."
---

# Async and Concurrency

## Core Rules

- Async all the way: avoid blocking (`.Result`, `.Wait()`).
- Pass `CancellationToken` through async call chains.
- Use `Task.WhenAll` for independent concurrent operations.
- Limit parallelism for CPU-bound workloads.

## Cancellation Pattern

```csharp
public async Task<IReadOnlyList<Order>> FetchOrdersAsync(
    IOrderClient client,
    IReadOnlyList<Guid> ids,
    CancellationToken cancellationToken)
{
    var tasks = ids.Select(id => client.GetOrderAsync(id, cancellationToken));
    var orders = await Task.WhenAll(tasks);
    return orders;
}
```

## Synchronization Choices

- `lock` for short synchronous critical sections.
- `SemaphoreSlim` for async-friendly throttling.
- `Channel<T>` for producer/consumer pipelines.
- `ConcurrentDictionary<TKey, TValue>` for shared maps under contention.

## Anti-Patterns

- Fire-and-forget tasks without supervision/logging.
- Mixing blocking and async code in request paths.
- Ignoring `OperationCanceledException` semantics.
