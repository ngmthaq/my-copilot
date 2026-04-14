---
name: nestjs-microservices-messaging
description: "NestJS microservices messaging - transport setup, message patterns, event patterns, request/reply, retries, and contract-safe integration patterns with Kafka/RMQ/NATS/TCP. Use when: building distributed services with NestJS microservice transports. DO NOT USE FOR: plain REST controller design or GraphQL schema modeling."
---

# NestJS Microservices Messaging

## 1. Create a Microservice Transport

```typescript
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL!],
      queue: "order-events",
      queueOptions: { durable: true },
      prefetchCount: 20,
    },
  });

  await app.listen();
}
```

- Keep transport config in environment variables.
- Set bounded prefetch to avoid overloading consumers.

## 2. Message and Event Patterns

```typescript
@Controller()
export class OrderMessagingController {
  @MessagePattern({ cmd: "order.getById" })
  async getById(@Payload() payload: { orderId: string }) {
    return { orderId: payload.orderId, status: "CREATED" };
  }

  @EventPattern("order.created")
  async onOrderCreated(
    @Payload() event: { orderId: string; customerId: string },
  ) {
    // side-effect only, no response required
  }
}
```

- `@MessagePattern` for request/reply.
- `@EventPattern` for async event consumption.

## 3. Client Proxy for Producer Side

```typescript
@Injectable()
export class OrderEventsPublisher {
  constructor(@Inject("ORDER_BUS") private readonly client: ClientProxy) {}

  async emitCreated(event: {
    orderId: string;
    customerId: string;
  }): Promise<void> {
    await firstValueFrom(this.client.emit("order.created", event));
  }

  async getOrder(
    orderId: string,
  ): Promise<{ orderId: string; status: string }> {
    return firstValueFrom(
      this.client.send({ cmd: "order.getById" }, { orderId }),
    );
  }
}
```

- Use `firstValueFrom` for deterministic async behavior.
- Time out `send` requests when calling remote services.

## 4. Reliability Patterns

- Validate message payload DTOs before processing.
- Implement idempotency for consumers using event IDs.
- Handle poison messages with DLQ strategy.
- Include correlation IDs for traceability across services.

## 5. Error Handling

```typescript
@MessagePattern({ cmd: "inventory.reserve" })
async reserve(@Payload() payload: ReserveInventoryDto) {
  try {
    return await this.inventoryService.reserve(payload);
  } catch (error) {
    throw new RpcException({
      code: "INVENTORY_RESERVE_FAILED",
      message: (error as Error).message,
    });
  }
}
```

- Throw `RpcException` for consistent transport-safe errors.

## 6. Anti-Patterns

- Business logic directly in message handlers.
- No message schema/versioning strategy.
- Fire-and-forget events without idempotency.
- Infinite retries without dead-letter policies.
