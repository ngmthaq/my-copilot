---
name: spring-boot-auto-configuration
description: "Spring Boot auto-configuration - application properties, `@ConfigurationProperties`, profiles, conditional beans, custom auto-configuration, and safe overrides. Use when: configuring app startup behavior and environment-driven wiring. DO NOT USE FOR: controller design, JPA entity modeling, or security policy design."
---

# Spring Boot Auto-Configuration

## 1. Property-Driven Configuration

```yaml
# application.yml
server:
  port: 8080

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:postgresql://localhost:5432/orderdb
    username: app
    password: secret
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
```

- Use `application.yml` for hierarchy and readability.
- Keep secrets outside repo via env vars or secret manager.

## 2. Strongly-Typed Config with `@ConfigurationProperties`

```java
@ConfigurationProperties(prefix = "app.cache")
public record CacheProperties(Duration ttl, int maxEntries) {
}

@Configuration
@EnableConfigurationProperties(CacheProperties.class)
class CacheConfig {

    @Bean
    CacheService cacheService(CacheProperties props) {
        return new CacheService(props.ttl(), props.maxEntries());
    }
}
```

- Prefer `@ConfigurationProperties` over scattered `@Value` usage.
- Validate config at startup with `@Validated` and bean validation.

## 3. Profiles and Environment Separation

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/orderdb_dev

# application-prod.yml
spring:
  datasource:
    url: ${DB_URL}
```

```bash
SPRING_PROFILES_ACTIVE=dev
```

- Use profiles for environment-specific differences only.
- Keep defaults in `application.yml` and override minimally.

## 4. Conditional Beans

```java
@Configuration
class MessagingConfig {

    @Bean
    @ConditionalOnProperty(name = "app.messaging.enabled", havingValue = "true")
    MessagePublisher kafkaPublisher() {
        return new KafkaMessagePublisher();
    }

    @Bean
    @ConditionalOnMissingBean
    Clock systemClock() {
        return Clock.systemUTC();
    }
}
```

- `@ConditionalOnProperty` enables feature flags.
- `@ConditionalOnMissingBean` keeps config extensible for tests and overrides.

## 5. Overriding Auto-Config Safely

```java
@Configuration
class WebClientConfig {

    @Bean
    WebClient webClient(WebClient.Builder builder) {
        return builder
            .baseUrl("https://api.example.com")
            .defaultHeader("User-Agent", "order-service")
            .build();
    }
}
```

- Prefer customizing builder beans over replacing whole auto-config classes.
- Override only what is necessary to avoid breaking defaults.

## 6. Custom Auto-Configuration (Starter Pattern)

```java
@AutoConfiguration
@ConditionalOnClass(MyClient.class)
@EnableConfigurationProperties(MyClientProperties.class)
public class MyClientAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    MyClient myClient(MyClientProperties props) {
        return new MyClient(props.baseUrl(), props.timeout());
    }
}
```

- Use `@AutoConfiguration` for reusable internal starters.
- Guard with `@ConditionalOnClass` and `@ConditionalOnMissingBean`.

## 7. Best Practices

- Keep config immutable using records where possible.
- Fail fast on invalid config at startup.
- Avoid hardcoded endpoints and credentials.
- Prefer environment variables for sensitive values.
- Keep profile logic small and explicit.

## 8. Anti-Patterns

- Heavy `@Value("${...}")` usage across many classes.
- Duplicating full config files per environment.
- Overriding framework auto-config without understanding side effects.
- Mixing dev/test/prod concerns in one profile.
