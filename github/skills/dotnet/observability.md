---
name: dotnet-observability
description: "Observability guidance for .NET - structured logs, tracing, metrics, health checks, and production diagnostics. Use when: diagnosing reliability and performance issues."
---

# Observability

## Procedure

1. Add structured logs with correlation/request identifiers.
2. Define health checks for critical dependencies.
3. Emit metrics for latency, throughput, and error rate.
4. Enable distributed tracing across service boundaries.
5. Review telemetry for noisy/unactionable signals.

## Example

```csharp
builder.Services.AddHealthChecks()
	.AddDbContextCheck<AppDbContext>("db");

app.MapHealthChecks("/health");
```

## Rules

- Never log secrets or PII.
- Prefer semantic log fields over string-only messages.
- Track both success and failure latency distributions.
- Ensure alerts map to actionable runbook steps.
- Keep SLO-aligned dashboards for latency, error rate, and saturation.
