---
name: dotnet-resilience-http-clients
description: "Resilient outbound HTTP in .NET - HttpClientFactory, Polly retry/timeout/circuit-breaker, idempotency, fallback patterns, and observability for external API calls. Use when: integrating unstable external services safely. DO NOT USE FOR: endpoint/controller design or EF Core schema modeling."
---

# .NET Resilience for HTTP Clients

## 1. Typed Clients with `IHttpClientFactory`

```csharp
builder.Services.AddHttpClient<PaymentsClient>(client =>
{
    client.BaseAddress = new Uri("https://payments.internal");
    client.Timeout = TimeSpan.FromSeconds(10);
});

public sealed class PaymentsClient(HttpClient httpClient)
{
    public async Task<PaymentResult> AuthorizeAsync(PaymentRequest request, CancellationToken ct)
    {
        using var response = await httpClient.PostAsJsonAsync("/v1/authorize", request, ct);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<PaymentResult>(cancellationToken: ct))!;
    }
}
```

- Use typed or named clients instead of new `HttpClient()` per request.
- Always pass `CancellationToken`.

## 2. Polly Policies (Retry + Circuit Breaker + Timeout)

```csharp
builder.Services.AddHttpClient<PaymentsClient>(client =>
    {
        client.BaseAddress = new Uri("https://payments.internal");
    })
    .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(TimeSpan.FromSeconds(3)))
    .AddTransientHttpErrorPolicy(policy =>
        policy.WaitAndRetryAsync(3, retry => TimeSpan.FromMilliseconds(200 * Math.Pow(2, retry))))
    .AddTransientHttpErrorPolicy(policy =>
        policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
```

- Retry only transient faults (`5xx`, network errors, timeouts).
- Keep retry count low; use jitter in production.

## 3. Idempotency and Safe Retries

- Retry only idempotent operations by default (`GET`, safe upserts).
- For `POST`, use idempotency keys when supported.
- Avoid retrying validation and auth failures (`4xx` except `408`/`429`).

## 4. Fallback and Degradation

```csharp
public async Task<PriceQuote> GetQuoteAsync(string sku, CancellationToken ct)
{
    try
    {
        return await pricingClient.GetQuoteAsync(sku, ct);
    }
    catch (Exception)
    {
        return PriceQuote.Fallback(sku);
    }
}
```

- Prefer graceful degradation over full request failure for non-critical dependencies.

## 5. Observability and Correlation

- Log dependency failures with status code and elapsed time.
- Add correlation ID headers to outbound requests.
- Track retries/circuit-open events as metrics.

## 6. Anti-Patterns

- Creating raw `HttpClient` in services.
- Infinite or aggressive retries.
- Retrying on all exceptions indiscriminately.
- Swallowing external errors without metrics/log context.
