---
name: spring-boot-observability
description: "Spring Boot observability - structured logging, metrics, tracing, health probes, and alert-oriented instrumentation with Micrometer and OpenTelemetry. Use when: making services diagnosable and production-operable. DO NOT USE FOR: domain-level business rule implementation."
---

# Spring Boot Observability

## 1. Structured Logging

```yaml
logging:
  level:
    root: INFO
    com.example.orders: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%X{traceId:-}] [%X{spanId:-}] %logger - %msg%n"
```

- Include trace/span/correlation IDs in logs.
- Log key business identifiers (orderId, customerId) without leaking secrets.

## 2. Metrics via Micrometer

```java
@Component
public class OrderMetrics {

    private final Counter createdCounter;
    private final Timer processingTimer;

    public OrderMetrics(MeterRegistry registry) {
        this.createdCounter = Counter.builder("orders.created.total").register(registry);
        this.processingTimer = Timer.builder("orders.processing.duration").register(registry);
    }

    public void incrementCreated() {
        createdCounter.increment();
    }

    public <T> T time(Supplier<T> supplier) {
        return processingTimer.record(supplier::get);
    }
}
```

- Favor low-cardinality metric tags.
- Track request count, error rate, and latency percentiles.

## 3. Tracing

- Use OpenTelemetry or Micrometer Tracing.
- Propagate trace headers on outbound calls.
- Correlate logs, traces, and metrics in dashboards.

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
```

## 4. Health and Readiness

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  endpoint:
    health:
      probes:
        enabled: true
```

- Use readiness for dependency checks (DB, broker).
- Keep liveness lightweight to avoid restart loops.

## 5. HTTP and Dependency Instrumentation

- Instrument inbound HTTP latency by route/status.
- Track outbound dependency failures by host + status class.
- Measure queue lag and retry counts for async workflows.

## 6. Alerting Signals

- High `5xx` rate spike.
- P95/P99 latency regression.
- Circuit breaker open events.
- Queue backlog growth and consumer lag.

## 7. Anti-Patterns

- Logging full JWTs, credentials, or PII fields.
- High-cardinality tags (userId/email) in metrics.
- Missing dashboards for top business paths.
- Treating health endpoint as a full synthetic test.
