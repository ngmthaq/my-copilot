---
name: dotnet-middleware-logging
description: "Dotnet middleware and logging guidance - request pipeline behavior, correlation IDs, latency measurements, and structured diagnostics. Use when: implementing cross-cutting API concerns."
---

# Middleware and Logging

## Procedure

1. Add request correlation ID propagation.
2. Log request start/end with stable structured fields.
3. Measure duration and classify outcomes.
4. Apply middleware in correct order.
5. Keep logs concise and privacy-safe.

## Example

```csharp
app.Use(async (context, next) =>
{
	var traceId = context.TraceIdentifier;
	var start = DateTime.UtcNow;

	await next();

	var elapsedMs = (DateTime.UtcNow - start).TotalMilliseconds;
	logger.LogInformation("Request {Method} {Path} {StatusCode} {ElapsedMs}ms {TraceId}",
		context.Request.Method,
		context.Request.Path,
		context.Response.StatusCode,
		elapsedMs,
		traceId);
});
```

## Rules

- Do not log secrets or full sensitive payloads.
- Prefer structured key/value logs over free-form strings.
- Capture enough context to debug production incidents.
- Include status code and elapsed time in every request completion log.
