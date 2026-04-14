---
name: dotnet-worker-services
description: "Dotnet worker service guidance - background jobs, queue consumers, retries, cancellation, and graceful shutdown. Use when: implementing hosted background processing."
---

# Worker Services

## Procedure

1. Implement worker loops with cancellation token awareness.
2. Separate polling/consumption from business processing logic.
3. Add bounded retries and dead-letter strategy.
4. Emit structured logs, metrics, and health indicators.
5. Ensure graceful shutdown drains in-flight work safely.

## Example

```csharp
public sealed class QueueWorker : BackgroundService
{
	protected override async Task ExecuteAsync(CancellationToken stoppingToken)
	{
		while (!stoppingToken.IsCancellationRequested)
		{
			await ProcessNextMessageAsync(stoppingToken);
		}
	}
}
```

## Rules

- Use idempotency for retried message processing.
- Avoid unbounded parallelism and memory growth.
- Keep retry policy explicit and observable.
- Use bounded channels or queue client prefetch limits for throughput control.
