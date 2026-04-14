---
name: spring-boot-caching-rate-limiting
description: "Spring Boot caching and rate limiting - cache strategies, Redis integration, eviction rules, and request throttling for abuse protection. Use when: reducing repeated read load and protecting high-risk endpoints. DO NOT USE FOR: authentication token semantics or deep DB query tuning."
---

# Spring Boot Caching and Rate Limiting

## 1. Caching with Spring Cache

```java
@Service
public class ProductService {

    @Cacheable(cacheNames = "productById", key = "#id")
    public ProductDto getById(Long id) {
        return fetchFromDatabase(id);
    }

    @CacheEvict(cacheNames = "productById", key = "#id")
    public ProductDto update(Long id, UpdateProductCommand command) {
        return updateInDatabase(id, command);
    }
}
```

- Cache read paths with stable keys.
- Evict or refresh on writes.

## 2. Redis Cache Backend

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
  cache:
    type: redis
    redis:
      time-to-live: 60s
```

- Use Redis for multi-instance deployments.
- Set TTL per business volatility.

## 3. Cache Design Rules

- Avoid caching sensitive per-user data without partitioned keys.
- Use bounded TTLs and explicit invalidation.
- Monitor hit ratio and stale-read impact.

## 4. Rate Limiting

- Apply stricter limits for login/reset/OTP endpoints.
- Differentiate global, per-IP, and per-user limits.
- Return clear `429` responses with retry hints.

```java
// Example using Bucket4j filter registration concepts
// - key by userId (if authenticated) else IP
// - refill strategy: e.g., 20 requests/minute for auth endpoints
```

## 5. Operational Metrics

- Cache hit/miss ratio.
- Eviction count.
- 429 rate and top throttled routes.
- Redis latency and connection pool saturation.

## 6. Anti-Patterns

- Caching everything by default.
- Unbounded caches with no eviction policy.
- Global throttles that block internal service traffic.
- No observability around cache and throttle decisions.
