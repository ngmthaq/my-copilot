---
name: spring-boot-microservices-messaging
description: "Spring Boot microservices messaging - async event publishing, consumer idempotency, DLQ strategy, schema evolution, and tracing across Kafka/RabbitMQ flows. Use when: building event-driven Spring services. DO NOT USE FOR: simple synchronous CRUD-only applications."
---

# Spring Boot Microservices Messaging

## 1. Producer Pattern

```java
@Component
public class OrderEventPublisher {

    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishCreated(OrderCreatedEvent event) {
        kafkaTemplate.send("orders.created.v1", event.orderId(), event);
    }
}
```

- Use stable topic naming with version suffixes.
- Key by aggregate ID for ordering per entity.

## 2. Consumer Pattern

```java
@Component
public class OrderCreatedConsumer {

    @KafkaListener(topics = "orders.created.v1", groupId = "billing-service")
    public void onOrderCreated(OrderCreatedEvent event) {
        // idempotent processing by eventId/orderId
    }
}
```

- Keep consumer handlers small and idempotent.
- Commit offsets only after successful processing.

## 3. Idempotency

- Persist processed `eventId` values.
- Use upsert or unique constraints to suppress duplicates.
- Ensure retries do not create duplicate side effects.

## 4. Error Handling and DLQ

- Route poison messages to dead-letter topics/queues.
- Include error metadata for replay/diagnosis.
- Add retry backoff instead of tight retry loops.

## 5. Schema and Contract Evolution

- Prefer additive changes.
- Version topic or payload schema for breaking changes.
- Validate payloads at producer and consumer boundaries.

## 6. Transactional Outbox Pattern

- Write domain change + outbox record in one DB transaction.
- Publish outbox asynchronously to broker.
- Avoid dual-write inconsistency between DB and broker.

## 7. Anti-Patterns

- Publishing raw entities as events.
- No event versioning strategy.
- Infinite retries without DLQ.
- Shared consumer group for unrelated workloads.
