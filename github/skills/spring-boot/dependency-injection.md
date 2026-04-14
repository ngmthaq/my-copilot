---
name: spring-boot-dependency-injection
description: "Spring Boot dependency injection - constructor injection, bean scopes, qualifiers, lifecycle hooks, and test-friendly service wiring. Use when: designing components and wiring dependencies via Spring beans. DO NOT USE FOR: endpoint contracts, database mapping details, or security filter rules."
---

# Spring Boot Dependency Injection

## 1. Prefer Constructor Injection

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;

    public OrderService(OrderRepository orderRepository, PaymentClient paymentClient) {
        this.orderRepository = orderRepository;
        this.paymentClient = paymentClient;
    }

    public Order place(OrderCommand command) {
        paymentClient.authorize(command.customerId(), command.total());
        return orderRepository.save(Order.create(command));
    }
}
```

- Constructor injection makes dependencies explicit and testable.
- Avoid field injection (`@Autowired` on fields).

## 2. Component Registration

```java
@Component
class UuidGenerator {
    UUID next() {
        return UUID.randomUUID();
    }
}

@Service
class InvoiceService {
}

@Repository
interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long> {
}
```

- Use stereotypes by responsibility (`@Service`, `@Repository`, `@Component`).

## 3. Bean Configuration with `@Bean`

```java
@Configuration
class ClientConfig {

    @Bean
    PaymentClient paymentClient(WebClient.Builder builder) {
        return new PaymentClient(builder.baseUrl("https://payments.internal").build());
    }
}
```

- Use `@Bean` for third-party classes or custom construction logic.

## 4. Multiple Implementations and `@Qualifier`

```java
public interface NotificationSender {
    void send(String message);
}

@Component("emailSender")
class EmailSender implements NotificationSender {
    public void send(String message) { }
}

@Component("smsSender")
class SmsSender implements NotificationSender {
    public void send(String message) { }
}

@Service
class AlertService {

    private final NotificationSender sender;

    AlertService(@Qualifier("emailSender") NotificationSender sender) {
        this.sender = sender;
    }
}
```

- Prefer explicit qualifiers when multiple beans match.

## 5. Bean Scope and Lifecycle

```java
@Component
@Scope("singleton")
class ExchangeRateCache {
}

@Component
@Scope("prototype")
class RequestScopedFormatter {
}

@Component
class StartupWarmup {

    @PostConstruct
    void warm() {
        // preload static lookups
    }

    @PreDestroy
    void shutdown() {
        // cleanup resources
    }
}
```

- Default scope is singleton; use others only when needed.

## 6. Circular Dependency Avoidance

- Split responsibilities to remove cycles.
- Introduce orchestration service instead of two-way dependencies.
- Use events or ports/interfaces where necessary.

## 7. Testing with DI

```java
@SpringBootTest
class OrderServiceIT {

    @Autowired
    private OrderService orderService;

    @MockBean
    private PaymentClient paymentClient;
}
```

- Use `@MockBean` to replace collaborators in integration tests.
- For unit tests, instantiate services directly with mocks.

## 8. Anti-Patterns

- Field injection everywhere.
- Service locator style (`ApplicationContext.getBean` in business code).
- God services with many dependencies.
- Hidden runtime decisions instead of explicit qualifiers.
